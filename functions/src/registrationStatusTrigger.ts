import * as functions from "firebase-functions/v1";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { Resend } from "resend";

type RegistrationStatus = "pending" | "converted" | "cancelled";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

type RegistrationDoc = {
  userId?: string;
  uid?: string;
  name?: string;
  email?: string;
  status?: RegistrationStatus | string;
  emailSentForStatus?: RegistrationStatus | string;
};

function getResendApiKey(): string | undefined {
  // Using Firebase Secret; value() is only available at runtime inside the function.
  const value = RESEND_API_KEY.value();
  return value ?? process.env.RESEND_API_KEY;
}

function isAllowedStatus(value: unknown): value is RegistrationStatus {
  return value === "pending" || value === "converted" || value === "cancelled";
}

function isAlreadyExistsError(err: unknown): boolean {
  const anyErr = err as { code?: unknown; message?: unknown };
  return (
    anyErr?.code === 6 ||
    anyErr?.code === "already-exists" ||
    (typeof anyErr?.message === "string" && anyErr.message.includes("ALREADY_EXISTS"))
  );
}

function buildEmail(status: RegistrationStatus, name?: string) {
  const safeName = name?.trim() || "there";

  switch (status) {
    case "pending":
      return {
        subject: "We got your registration 👀✨",
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">You're in (almost) 👀</h1>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 20px;">
    Hey ${safeName}, we’ve received your registration for <strong>Takshashila 2026</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    Your status is currently <strong>Pending</strong> — no stress, just vibes.
  </p>

  <div style="background:#1a1a1a; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:14px; opacity:0.8;">
      You’ll hear from us soon.<br/>
      Until then, start planning your main character moment.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    CIT Takshashila 2026 · Chennai
  </p>
</div>`.trim(),
      };
    case "converted":
      return {
        subject: "You’re officially part of Takshashila 😤🔥",
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">It’s official 😤🔥</h1>

  <p style="font-size:16px; opacity:0.9; max-width:480px; margin:0 auto 20px;">
    ${safeName}, your registration has been <strong>successfully confirmed</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    You’re now locked in for <strong>Takshashila 2026</strong>.<br/>
    Get ready for chaos, competition, concerts, and core memories.
  </p>

  <div style="background:linear-gradient(135deg,#ffcc00,#ff7a00); color:#000; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:15px; font-weight:600;">
      Big W secured.<br/>
      See you on campus.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    Save this email. Flex responsibly.
  </p>
</div>`.trim(),
      };
    case "cancelled":
      return {
        subject: "Update about your registration 💔",
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">Quick update 💔</h1>

  <p style="font-size:16px; opacity:0.9; max-width:480px; margin:0 auto 20px;">
    Hey ${safeName}, your registration status has been marked as <strong>Cancelled</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    We know that’s not the email you wanted.<br/>
    If this was unexpected, feel free to reach out and we’ll sort it out.
  </p>

  <div style="background:#1a1a1a; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:14px; opacity:0.8;">
      Still rooting for you. Always.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    CIT Takshashila 2026 · Support Team
  </p>
</div>`.trim(),
      };
  }
}

export const onRegistrationStatusChange = functions
  .runWith({ secrets: [RESEND_API_KEY] })
  .firestore
  .document("registrations/{registrationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as RegistrationDoc | undefined;
    const after = change.after.data() as RegistrationDoc | undefined;
    if (!before || !after) return;

    const beforeStatus = before.status;
    const afterStatus = after.status;
    if (beforeStatus === afterStatus) return;
    if (!isAllowedStatus(afterStatus)) return;

    const email = after.email?.trim();
    if (!email) return;

    const registrationId = String(context.params.registrationId);
    const userId = after.userId ?? after.uid ?? null;

    if (after.emailSentForStatus === afterStatus) {
      functions.logger.info("Skipping: already marked emailSentForStatus", {
        registrationId,
        status: afterStatus,
      });
      return;
    }

    const logId = `${registrationId}_${afterStatus}`;
    const logRef = admin.firestore().collection("emailLogs").doc(logId);

    try {
      await logRef.create({
        registrationId,
        userId,
        email,
        statusTriggered: afterStatus,
        state: "processing",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      if (isAlreadyExistsError(err)) {
        functions.logger.info("Skipping: email log already exists", { logId });
        return;
      }
      throw err;
    }

    const apiKey = getResendApiKey();
    if (!apiKey) {
      await logRef.set(
        {
          state: "failed",
          error: "Missing Resend API key (functions.config().resend.key or RESEND_API_KEY).",
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      functions.logger.error("Missing Resend API key");
      return;
    }

    const { subject, html } = buildEmail(afterStatus, after.name);
    const resend = new Resend(apiKey);

    try {
      const from = "Takshashila <noreply@cittakshashila.com>";
      const response = await resend.emails.send({
        from,
        to: email,
        subject,
        html,
      });

      await Promise.all([
        logRef.set(
          {
            state: "sent",
            resendId: response.data?.id ?? null,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
        change.after.ref.set(
          {
            emailSentForStatus: afterStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
      ]);
    } catch (err) {
      functions.logger.error("Email sending failed", err);
      await logRef.set(
        {
          state: "failed",
          error: err instanceof Error ? err.message : String(err),
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

