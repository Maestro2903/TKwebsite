import type { Timestamp } from 'firebase/firestore';

export type PassType = 'DAY_PASS' | 'GROUP_EVENTS_PASS' | 'PROSHOW_PASS' | 'ALL_ACCESS';

export type PaymentStatus = 'PENDING' | 'PAID';

/** User profile stored in Firestore users/{uid}. Used by AuthContext and registration. */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  phone: string;
  isOrganizer?: boolean;
  createdAt: Timestamp | { toDate: () => Date };
}

/** Payload for updating user profile (name, college, phone). */
export type UserProfileUpdate = Pick<UserProfile, 'name' | 'college' | 'phone'>;

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
