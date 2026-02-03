import type { Timestamp } from 'firebase/firestore';

export type PassType = 'DAY_PASS' | 'GROUP_EVENTS_PASS' | 'PROSHOW_PASS' | 'ALL_ACCESS';

export type PaymentStatus = 'PENDING' | 'PAID';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  phone: string;
  createdAt: Timestamp;
}

export interface Registration {
  uid: string;
  passType: PassType;
  amount: number;
  paymentStatus: PaymentStatus;
  cashfreeOrderId: string;
  createdAt: Timestamp;
  qrPayload?: string;
  registrationId?: string;
}
