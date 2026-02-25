import * as functions from "firebase-functions/v1";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

type RegistrationStatus = "pending" | "converted" | "cancelled";

const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

type RegistrationDoc = {
  userId?: string;
  uid?: string;
  name?: string;
  email?: string;
  status?: RegistrationStatus | string;
  emailSentForStatus?: RegistrationStatus | string;
  passType?: string;
  selectedEvents?: string[];
  calculatedAmount?: number;
  teamName?: string;
  leaderName?: string;
  eventName?: string;
  totalMembers?: number;
};

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

function buildEmail(
  status: RegistrationStatus,
  options: {
    name?: string;
    registrationId: string;
    passType?: string;
    selectedEvents?: string[];
    amount?: number;
    teamName?: string;
    leaderName?: string;
    eventName?: string;
    totalMembers?: number;
  }
) {
  const safeName = options.name?.trim() || "there";
  const registrationId = options.registrationId;
  const passType = options.passType || "General";
  const eventList =
    options.selectedEvents && options.selectedEvents.length > 0
      ? options.selectedEvents.join(", ")
      : "Not specified";
  const formattedAmount =
    typeof options.amount === "number" && options.amount > 0
      ? options.amount.toFixed(0)
      : "0";

  const isGroupRegistration =
    !!options.teamName && !!options.eventName && !!options.totalMembers;

  switch (status) {
    case "pending":
      if (isGroupRegistration) {
        return {
          subject: "Team Registration Recorded – Payment Pending",
          html: `
<h2>Team Registration Recorded</h2>

<p>Dear ${options.leaderName?.trim() || "Team Leader"},</p>

<p>Your team <strong>${options.teamName}</strong> has been successfully registered.</p>

<p>
Event: ${options.eventName}<br/>
Members: ${options.totalMembers}<br/>
Registration ID: ${registrationId}
</p>

<p>
Payment must be completed at the venue for pass activation.<br/>
All members must be present during payment verification.
</p>

<p>
Regards,<br/>
Team Takshashila 2026
</p>
`.trim(),
        };
      }

      return {
        subject: "Registration Received – Takshashila 2026",
        html: `
<h2>Registration Received</h2>

<p>Dear ${safeName},</p>

<p>Your registration for <strong>Takshashila 2026</strong> has been successfully recorded.</p>

<p><strong>Registration Details:</strong></p>
<ul>
  <li>Pass Type: ${passType}</li>
  <li>Selected Events: ${eventList}</li>
  <li>Registration ID: ${registrationId}</li>
</ul>

<p>
⚠️ <strong>Important:</strong> Your pass will be activated only after payment is completed at the venue.
</p>

<p>
Please carry:
<ul>
  <li>A valid Registration ID</li>
</ul>
</p>

<p>
You can view your registration anytime here:<br/>
<a href="https://cittakshashila.org/register">
View Registration
</a>
</p>

<p>
We look forward to seeing you at Takshashila 2026.
</p>

<p>
Regards,<br/>
Team Takshashila 2026
</p>
`.trim(),
      };
    case "converted":
      return {
        subject: "Pass Activated – Takshashila 2026",
        html: `
<h2>Your Pass is Activated</h2>

<p>Dear ${safeName},</p>

<p>We confirm that your payment has been successfully received at the venue.</p>

<p><strong>Pass Details:</strong></p>
<ul>
  <li>Pass Type: ${passType}</li>
  <li>Amount Paid: ₹${formattedAmount}</li>
  <li>Registration ID: ${registrationId}</li>
</ul>

<p>
Your official QR pass is now active.
</p>

<p>
Access your pass here:<br/>
<a href="https://cittakshashila.org/register/my-pass">
View My Pass
</a>
</p>

<p>
Please do not share your QR code. It is valid for single-entry scanning.
</p>

<p>
We wish you an exciting experience at Takshashila 2026.
</p>

<p>
Regards,<br/>
Team Takshashila 2026
</p>
`.trim(),
      };
    case "cancelled":
      return {
        subject: "Registration Cancelled – Takshashila 2026",
        html: `
<h2>Registration Cancelled</h2>

<p>Dear ${safeName},</p>

<p>Your registration (ID: ${registrationId}) has been cancelled.</p>

<p>If this was a mistake, please register again through the official website.</p>

<p>
Regards,<br/>
Team Takshashila 2026
</p>
`.trim(),
      };
  }
}

export const onRegistrationStatusChange = functions
  .runWith({ secrets: [SMTP_USER, SMTP_PASS] })
  .firestore
  .document("registrations/{registrationId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists
      ? (change.before.data() as RegistrationDoc | undefined)
      : undefined;
    const after = change.after.exists
      ? (change.after.data() as RegistrationDoc | undefined)
      : undefined;
    if (!after) return;

    const beforeStatus = before?.status;
    const afterStatus = after.status;
    if (beforeStatus === afterStatus && before) return;
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

    const smtpUser = SMTP_USER.value() || process.env.SMTP_USER;
    const smtpPass = SMTP_PASS.value() || process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
      await logRef.set(
        {
          state: "failed",
          error: "Missing SMTP credentials (SMTP_USER / SMTP_PASS).",
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      functions.logger.error("Missing SMTP credentials");
      return;
    }

    const { subject, html } = buildEmail(afterStatus, {
      name: after.name,
      registrationId,
      passType: after.passType,
      selectedEvents: Array.isArray(after.selectedEvents)
        ? after.selectedEvents
        : undefined,
      amount:
        typeof after.calculatedAmount === "number"
          ? after.calculatedAmount
          : undefined,
      teamName: after.teamName,
      leaderName: after.leaderName,
      eventName: after.eventName,
      totalMembers:
        typeof after.totalMembers === "number"
          ? after.totalMembers
          : undefined,
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      const fromAddress = `"CIT Takshashila" <${smtpUser}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html,
      });

      await Promise.all([
        logRef.set(
          {
            state: "sent",
            smtpMessageId: (info as any)?.messageId ?? null,
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

/**
 * Trigger: registrations/{registrationId}
 *
 * When a registration status transitions to "converted", this function:
 * - Ensures idempotency using the payments collection
 * - Creates a new document in payments/{registrationId}
 * - Creates a new document in passes/{passId}
 * - Optionally updates the related team document for group passes
 * - Does NOT generate a QR code or send email
 */
export const onRegistrationConvertedCreatePass = functions.firestore
  .document("registrations/{registrationId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists
      ? (change.before.data() as Record<string, unknown>)
      : undefined;
    const after = change.after.exists
      ? (change.after.data() as Record<string, unknown>)
      : undefined;

    if (!after) return;

    const beforeStatus = (before?.status as string | undefined) ?? undefined;
    const afterStatus = (after.status as string | undefined) ?? undefined;

    // Only act on transitions into "converted"
    if (afterStatus !== "converted") return;
    if (beforeStatus === "converted") return;

    const registrationId = String(context.params.registrationId);
    const userId = (after.userId as string | undefined) ?? (after.uid as string | undefined) ?? null;
    const passType = (after.passType as string | undefined) ?? null;
    const selectedEvents = Array.isArray(after.selectedEvents)
      ? (after.selectedEvents as string[])
      : [];
    const selectedDays = Array.isArray(after.selectedDays)
      ? (after.selectedDays as string[])
      : [];
    const amount =
      typeof after.calculatedAmount === "number"
        ? (after.calculatedAmount as number)
        : 0;
    const teamId = (after.teamId as string | undefined) ?? null;

    if (!userId || !passType) {
      functions.logger.warn(
        "Skipping conversion flow: missing userId or passType on registration",
        {
          registrationId,
          hasUserId: !!userId,
          hasPassType: !!passType,
        }
      );
      return;
    }

    functions.logger.info("[Registration Converted]", {
      registrationId,
      userId,
    });

    const db = admin.firestore();

    // Idempotency: if a payment already exists for this registration, skip
    const existingPaymentSnap = await db
      .collection("payments")
      .where("registrationId", "==", registrationId)
      .limit(1)
      .get();

    if (!existingPaymentSnap.empty) {
      const existingPaymentId = existingPaymentSnap.docs[0]?.id;
      functions.logger.info(
        "Skipping conversion flow: payment already exists for registration",
        {
          registrationId,
          userId,
          existingPaymentId,
        }
      );
      return;
    }

    const paymentRef = db.collection("payments").doc(registrationId);

    try {
      await paymentRef.create({
        registrationId,
        userId,
        passType,
        amount,
        selectedEvents,
        selectedDays,
        teamId,
        status: "success",
        source: "manual_conversion",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info("[Payment Created]", {
        registrationId,
        userId,
        paymentId: paymentRef.id,
      });
    } catch (err) {
      if (isAlreadyExistsError(err)) {
        functions.logger.info(
          "Payment document already exists for registration, treating as idempotent success",
          {
            registrationId,
            userId,
            paymentId: paymentRef.id,
          }
        );
        return;
      }

      functions.logger.error("Failed to create payment for converted registration", {
        registrationId,
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    const passRef = db.collection("passes").doc();

    try {
      await db.runTransaction(async (tx) => {
        const passData: Record<string, unknown> = {
          userId,
          passType,
          amount,
          paymentId: paymentRef.id,
          registrationId,
          selectedEvents,
          selectedDays,
          status: "paid",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          teamId,
          eventAccess: {
            tech: false,
            nonTech: false,
            proshowDays: [],
            fullAccess: false,
          },
        };

        // Group event handling: embed team data and update team document
        if (passType === "group_events" && teamId) {
          const teamRef = db.collection("teams").doc(teamId);
          const teamSnap = await tx.get(teamRef);

          if (!teamSnap.exists) {
            functions.logger.warn(
              "Expected team document not found for group_events pass",
              {
                registrationId,
                userId,
                teamId,
              }
            );
          } else {
            const teamData = teamSnap.data() ?? {};
            passData.team = teamData;

            tx.update(teamRef, {
              passId: passRef.id,
              paymentStatus: "success",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        tx.set(passRef, passData);
      });

      functions.logger.info("[Pass Created]", {
        registrationId,
        userId,
        paymentId: paymentRef.id,
        passId: passRef.id,
      });

      await change.after.ref.set(
        {
          passId: passRef.id,
          paymentId: paymentRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      functions.logger.error(
        "Failed to create pass or update team for converted registration",
        {
          registrationId,
          userId,
          paymentId: paymentRef.id,
          error: err instanceof Error ? err.message : String(err),
        }
      );
      // Intentionally do not roll back the payment here to keep side effects simple.
    }
  });


