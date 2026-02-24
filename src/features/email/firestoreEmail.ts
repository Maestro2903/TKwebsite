import { getAdminFirestore } from '@/lib/firebase/adminApp';

export interface FirestoreEmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  data?: Record<string, unknown>;
}

const MAIL_COLLECTION = 'mail';

export async function enqueueEmail(message: FirestoreEmailMessage): Promise<void> {
  const db = getAdminFirestore();

  await db.collection(MAIL_COLLECTION).add({
    to: message.to,
    message: {
      subject: message.subject,
      ...(message.html ? { html: message.html } : {}),
      ...(message.text ? { text: message.text } : {}),
    },
    ...(message.templateId ? { template: { name: message.templateId } } : {}),
    ...(message.data ? { data: message.data } : {}),
    createdAt: new Date(),
  });
}

