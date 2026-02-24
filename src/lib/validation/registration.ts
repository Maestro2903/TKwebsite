import { getCachedEventsByIds } from '@/lib/cache/eventsCache';
import type { Event, PassType } from '@/lib/db/firestoreTypes';
import { PASS_TYPES } from '@/types/passes';

type ValidateRegistrationInputArgs = {
  passType: PassType;
  selectedEvents: string[];
  selectedDays?: string[] | null;
  teamMemberCount?: number | null;
};

export type RegistrationValidationResult = {
  calculatedAmount: number;
  events: Event[];
};

const ALLOWED_REGISTRATION_PASS_TYPES: PassType[] = ['day_pass', 'group_events', 'sana_concert'];

export async function validateRegistrationInput({
  passType,
  selectedEvents,
  selectedDays,
  teamMemberCount,
}: ValidateRegistrationInputArgs): Promise<RegistrationValidationResult> {
  if (!ALLOWED_REGISTRATION_PASS_TYPES.includes(passType)) {
    throw new Error('Invalid pass type for new registration flow');
  }

  const validPass = Object.values(PASS_TYPES).find((p) => p.id === passType);
  if (!validPass) {
    throw new Error('Invalid pass type');
  }

  if (!selectedEvents || selectedEvents.length === 0) {
    throw new Error('Event selection is required');
  }

  const events = (await getCachedEventsByIds(selectedEvents)) as unknown as Event[];

  if (events.length !== selectedEvents.length) {
    throw new Error('Some selected events do not exist');
  }

  const inactiveEvents = events.filter((e) => !e.isActive);
  if (inactiveEvents.length > 0) {
    throw new Error(
      `These events are not currently active: ${inactiveEvents.map((e) => e.name).join(', ')}`
    );
  }

  if (passType === 'day_pass' && selectedDays && selectedDays.length > 0) {
    const invalidEvents = events.filter((e) => !selectedDays.includes(e.date));
    if (invalidEvents.length > 0) {
      throw new Error(
        `Events must match selected days. Invalid events: ${invalidEvents
          .map((e) => e.name)
          .join(', ')}`
      );
    }
  }

  if (passType === 'group_events') {
    if (selectedEvents.length !== 1) {
      throw new Error('Group pass must select exactly one event');
    }
    const event = events[0];
    if (event.type !== 'group') {
      throw new Error('Selected event must be a group event');
    }

    const teamSize = teamMemberCount ?? 1;
    if (event.minMembers && teamSize < event.minMembers) {
      throw new Error(
        `Team size too small for ${event.name}. Minimum required: ${event.minMembers} (including leader)`
      );
    }
    if (event.maxMembers && teamSize > event.maxMembers) {
      throw new Error(
        `Team size too large for ${event.name}. Maximum allowed: ${event.maxMembers} (including leader)`
      );
    }
  }

  const deniedEvents = events.filter(
    (e) => !e.allowedPassTypes || !e.allowedPassTypes.includes(passType)
  );
  if (deniedEvents.length > 0) {
    throw new Error(
      `These events are not available for ${passType}: ${deniedEvents.map((e) => e.name).join(', ')}`
    );
  }

  let calculatedAmount: number;
  if (passType === 'group_events') {
    calculatedAmount =
      (teamMemberCount ?? 1) * ((validPass as { pricePerPerson?: number }).pricePerPerson ?? 250);
  } else if (passType === 'day_pass' && selectedDays && Array.isArray(selectedDays)) {
    const pricePerDay = (validPass as { price?: number }).price ?? 500;
    calculatedAmount = selectedDays.length * pricePerDay;
  } else {
    calculatedAmount = (validPass as { price?: number }).price ?? 0;
  }

  return {
    calculatedAmount,
    events,
  };
}

