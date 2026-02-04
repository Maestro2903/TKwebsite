import type { Timestamp } from 'firebase/firestore';

export type PassType = 'DAY_PASS' | 'GROUP_EVENTS_PASS' | 'PROSHOW_PASS' | 'ALL_ACCESS' | 'group_events';

export type PaymentStatus = 'pending' | 'success' | 'failed';

/** User profile stored in Firestore users/{uid} */
export interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  college: string;
  phone: string;
  isOrganizer?: boolean;
  createdAt: Timestamp | { toDate: () => Date };
  updatedAt?: Timestamp | Date;
}

/** Tracking of orders created via Cashfree in payments/{orderId} */
export interface Payment {
  userId: string;
  amount: number;
  passType: string;
  cashfreeOrderId: string;
  status: PaymentStatus;
  createdAt: Timestamp | Date;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  teamId?: string | null;
}

/** Verified pass for entry in passes/{passId} */
export interface Pass {
  userId: string;
  passType: string;
  amount: number;
  paymentId: string; // The Cashfree orderId
  status: 'paid' | 'used';
  qrCode: string; // Data URL of the QR
  createdAt: Timestamp | Date;
  usedAt?: Timestamp | Date;
  scannedBy?: string; // UID of the organizer
}
