import type { Timestamp } from 'firebase/firestore';

export type PassType = 'test_pass' | 'day_pass' | 'group_events' | 'proshow' | 'sana_concert';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type EventCategory = 'technical' | 'non_technical';
export type EventType = 'individual' | 'group' | 'workshop';

/** Event document structure in events/{eventId} collection */
export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  type: EventType;
  date: string; // ISO format: "2026-02-26"
  venue: string;
  prizePool?: number;
  allowedPassTypes: PassType[];
  isActive: boolean;
  description?: string;
  image?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/** Event access rules stored in pass */
export interface EventAccess {
  tech: boolean;
  nonTech: boolean;
  proshowDays: string[];
  fullAccess: boolean;
}

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
  /** Invite-unlock: unique code for referral links (TKX{first4UID}{random3}) */
  referralCode?: string;
  /** Invite-unlock: UIDs of users who signed up via this user's referral */
  invitedUsers?: string[];
  /** Invite-unlock: count of valid invites */
  inviteCount?: number;
  /** Invite-unlock: true when inviteCount >= 5 */
  dayPassUnlocked?: boolean;
  /** Invite-unlock: when day pass was unlocked */
  inviteUnlockedAt?: Timestamp | Date;
}

export interface UserProfileUpdate {
  name: string;
  college: string;
  phone: string;
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
  teamMemberCount?: number | null;
  selectedDays?: string[] | null;
  selectedEvents?: string[];
}

/** Individual team member with attendance tracking */
export interface TeamMember {
  memberId: string;
  name: string;
  phone: string;
  email: string;
  isLeader: boolean;
  attendance: {
    checkedIn: boolean;
    checkInTime: Timestamp | null;
    checkedInBy: string | null;
  };
}

/** Team registration for group events in teams/{teamId} */
export interface Team {
  teamName: string;
  leaderId: string;
  passId: string;
  totalMembers: number;
  totalAmount: number;
  members: TeamMember[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Team snapshot stored in pass document (immutable after payment) */
export interface TeamSnapshot {
  teamName: string;
  totalMembers: number;
  members: Array<{
    memberId: string;
    name: string;
    phone: string;
    isLeader: boolean;
    checkedIn: boolean;
  }>;
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

  // Event selection fields
  selectedEvents: string[];
  selectedDays: string[];
  eventAccess: EventAccess;

  // Group Events specific fields
  teamId?: string;
  teamSnapshot?: TeamSnapshot;
}
