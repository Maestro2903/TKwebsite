/**
 * Canonical pass types for registration and payment flow.
 * Used by register page, create-order, and verify API.
 */
export const PASS_TYPES = {
  TEST_PASS: { id: 'test_pass', name: 'Test Pass', price: 1 },
  DAY_PASS: { id: 'day_pass', name: 'Day Pass', price: 500 },
  GROUP_EVENTS: { id: 'group_events', name: 'Group Events', pricePerPerson: 250 },
  PROSHOW: { id: 'proshow', name: 'Day 1 Proshow + Day 3 Proshow', price: 1000 },
  SANA_CONCERT: { id: 'sana_concert', name: 'SANA Concert + All 3-Day Pass', price: 1500 },
} as const;

export type PassTypeId = (typeof PASS_TYPES)[keyof typeof PASS_TYPES]['id'];

export interface Pass {
  id: string;
  userId: string;
  passType: string;
  amount: number;
  paymentId: string;
  status: 'pending' | 'paid' | 'used';
  qrCode: string;
  createdAt: Date | { toDate: () => Date };
  usedAt?: Date | { toDate: () => Date };
}

export interface Team {
  id: string;
  teamId?: string;
  teamName: string;
  leaderId: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  leaderCollege?: string;
  members: { name: string; phone: string; email: string }[];
  totalMembers?: number;
  passId?: string;
  totalAmount: number;
  status?: 'pending' | 'paid' | 'cancelled';
  createdAt?: Date | { toDate: () => Date };
}

export interface Payment {
  id: string;
  orderId?: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  cashfreeOrderId: string;
  passType: string;
  teamId: string | null;
  createdAt: Date | { toDate: () => Date };
}
