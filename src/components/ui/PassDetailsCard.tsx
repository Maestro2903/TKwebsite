'use client';

import { CheckCircle2, Calendar, MapPin, Users, Ticket, CreditCard, Clock } from 'lucide-react';

interface PassDetailsCardProps {
  passType: string;
  amount: number;
  status: string;
  purchaseDate: string | null;
  selectedDays: string[];
  selectedEvents: Array<{
    id: string;
    name: string;
    venue?: string;
    startTime?: string;
    endTime?: string;
  }>;
  eventAccess: {
    tech: boolean;
    nonTech: boolean;
    proshowDays: string[];
    fullAccess: boolean;
  } | null;
  teamSnapshot: {
    teamName: string;
    totalMembers?: number;
    members: Array<{ name: string; isLeader?: boolean }>;
  } | null;
  userName: string;
  college: string;
  phone: string;
  email: string;
}

export default function PassDetailsCard({
  passType,
  amount,
  status,
  purchaseDate,
  selectedDays,
  selectedEvents,
  eventAccess,
  teamSnapshot,
  userName,
  college,
  phone,
  email,
}: PassDetailsCardProps) {
  return (
    <div className="w-full max-w-md bg-linear-to-br from-neutral-900/80 to-black border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="relative bg-linear-to-r from-neutral-900 via-neutral-800/80 to-neutral-900 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-orbitron tracking-tight uppercase">
              {passType}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-white font-orbitron">₹{amount}</span>
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} />
                {status === 'paid' ? 'Verified' : status}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-full" />
      </div>

      {/* Details Grid */}
      <div className="px-6 py-5 space-y-4">
        {/* Personal Info */}
        <DetailSection title="Attendee">
          <DetailRow icon={<Ticket size={14} />} label="Name" value={userName} />
          <DetailRow icon={<MapPin size={14} />} label="College" value={college} />
          {phone && <DetailRow icon={<CreditCard size={14} />} label="Phone" value={phone} />}
          {email && <DetailRow icon={<CreditCard size={14} />} label="Email" value={email} />}
        </DetailSection>

        {/* Purchase Info */}
        {purchaseDate && (
          <DetailSection title="Purchase">
            <DetailRow icon={<Clock size={14} />} label="Date" value={purchaseDate} />
            <DetailRow icon={<CreditCard size={14} />} label="Amount" value={`₹${amount}`} />
          </DetailSection>
        )}


        {/* Selected Days - Hidden as per user request */}
        {/* <DetailSection title="Selected Days">
          {selectedDays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((day) => {
                // Format date string nicely if possible
                let displayDay = day;
                try {
                  const d = new Date(day);
                  if (!isNaN(d.getTime())) {
                    displayDay = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  }
                } catch (error) {
                  console.error('Failed to parse selected day date:', day, error);
                }
                return (
                  <span
                    key={day}
                    className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300 font-medium"
                  >
                    <Calendar size={10} className="inline mr-1 -mt-0.5" />
                    {displayDay}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No specific days selected</p>
          )}
        </DetailSection> */}

        {/* Registered Events */}
        <DetailSection title="Registered Events">
          {selectedEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="px-3 py-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-sm font-medium text-neutral-200">{event.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 ml-3.5">
                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                        <MapPin size={10} className="text-neutral-500" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    {(event.startTime || event.endTime) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                        <Clock size={10} className="text-neutral-500" />
                        <span>
                          {event.startTime}
                          {event.endTime && ` – ${event.endTime}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No events registered yet</p>
          )}
        </DetailSection>


        {/* Event Access */}
        {eventAccess && (
          <DetailSection title="Access">
            <div className="flex flex-wrap gap-2">
              {eventAccess.fullAccess && (
                <AccessBadge label="Full Access" color="purple" />
              )}
              {eventAccess.tech && <AccessBadge label="Technical" color="blue" />}
              {eventAccess.nonTech && <AccessBadge label="Non-Technical" color="green" />}
              {eventAccess.proshowDays.length > 0 && (
                <AccessBadge
                  label={`Proshow (${eventAccess.proshowDays.join(', ')})`}
                  color="amber"
                />
              )}
            </div>
          </DetailSection>
        )}

        {/* Team Info */}
        {teamSnapshot && (
          <DetailSection title="Team">
            <DetailRow icon={<Users size={14} />} label="Team" value={teamSnapshot.teamName} />
            <div className="mt-2 space-y-1">
              {teamSnapshot.members.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-neutral-400"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${member.isLeader ? 'bg-amber-400' : 'bg-neutral-600'
                      }`}
                  />
                  <span className={member.isLeader ? 'text-amber-300 font-medium' : ''}>
                    {member.name}
                    {member.isLeader && ' (Leader)'}
                  </span>
                </div>
              ))}
            </div>
          </DetailSection>
        )}
      </div>

      {/* Bottom tech decoration */}
      <div className="px-6 py-3 border-t border-neutral-800/50 flex justify-between items-center">
        <span className="text-[9px] text-neutral-600 font-orbitron tracking-widest uppercase">
          CIT Takshashila 2026
        </span>
        <span className="text-[9px] text-neutral-600 font-orbitron tracking-widest uppercase">
          Valid Entry Pass
        </span>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-orbitron text-neutral-500 uppercase tracking-[0.2em] mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-neutral-500 shrink-0">{icon}</span>
      <span className="text-neutral-500 min-w-15">{label}</span>
      <span className="text-neutral-200 truncate">{value}</span>
    </div>
  );
}

function AccessBadge({ label, color }: { label: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    green: 'bg-green-500/10 border-green-500/20 text-green-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  };

  return (
    <span
      className={`px-3 py-1 border rounded-full text-xs font-medium ${colorMap[color] ?? colorMap.blue
        }`}
    >
      {label}
    </span>
  );
}
