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
  selectedDays?: string[];
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
    selectedDates?: string[];
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
  const selectedDatesText =
    options.selectedDates && options.selectedDates.length > 0
      ? options.selectedDates.join(", ")
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
          subject: "Team Registration Confirmation – Takshashila 2026",
          html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Team Registration Confirmation – Takshashila 2026</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#ffffff; border:1px solid #e0e0e0;">
            <tr>
              <td style="padding:16px 20px; background-color:#111827; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
                <div style="font-size:18px; font-weight:600; margin:0;">
                  Takshashila 2026
                </div>
                <div style="font-size:12px; margin-top:2px; color:#d1d5db;">
                  Chennai Institute of Technology
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 12px 0;">
                  Dear ${options.leaderName?.trim() || "Team Leader"},
                </p>
                <p style="margin:0 0 12px 0;">
                  This is to confirm that the registration of your team for participation in Takshashila 2026, organized by Chennai Institute of Technology, has been successfully recorded.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 8px 0; font-weight:600;">
                  Registration Details
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td style="padding:4px 0; width:150px; color:#4b5563;">Team Name</td>
                    <td style="padding:4px 0; color:#111827;">${options.teamName}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0; color:#4b5563;">Event</td>
                    <td style="padding:4px 0; color:#111827;">${options.eventName}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0; color:#4b5563;">Total Members</td>
                    <td style="padding:4px 0; color:#111827;">${options.totalMembers}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0; color:#4b5563;">Registration ID</td>
                    <td style="padding:4px 0; color:#111827;">${registrationId}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 8px 0; font-weight:600;">
                  Important Instructions
                </p>
                <ul style="margin:0 0 4px 20px; padding:0;">
                  <li style="margin-bottom:6px;">
                    Each team member is required to carry a valid College Identity Card. A government-issued identity document may also be carried, if available.
                  </li>
                  <li style="margin-bottom:6px;">
                    Where applicable, payment for participation is to be completed at the designated registration or payment counter at the venue, as per the instructions issued by the organizers.
                  </li>
                  <li style="margin-bottom:6px;">
                    Please retain the Registration ID (${registrationId}) for verification and for any future correspondence.
                  </li>
                  <li style="margin-bottom:6px;">
                    Further information or changes, if any, will be communicated through the official channels of Takshashila 2026, including the registered contact details of the team.
                  </li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 20px 20px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 12px 0;">
                  Should you require any clarification, please contact the organizing committee of Takshashila 2026 through the official communication channels.
                </p>
                <p style="margin:0 0 4px 0;">
                  Sincerely,
                </p>
                <p style="margin:4px 0 0 0;">
                  Team Takshashila 2026<br />
                  Chennai Institute of Technology<br />
                  <a href="https://cittakshashila.org/register" style="color:#1d4ed8; text-decoration:none;">
                    https://cittakshashila.org/register
                  </a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim(),
        };
      }

      return {
        subject: "Registration Confirmation – Takshashila 2026",
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Registration Confirmation – Takshashila 2026</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#ffffff; border:1px solid #e0e0e0;">
            <tr>
              <td style="padding:16px 20px; background-color:#111827; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
                <div style="font-size:18px; font-weight:600; margin:0;">
                  Takshashila 2026
                </div>
                <div style="font-size:12px; margin-top:2px; color:#d1d5db;">
                  Chennai Institute of Technology
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 12px 0;">
                  Dear ${safeName},
                </p>
                <p style="margin:0 0 12px 0;">
                  This is to confirm that your registration for participation in Takshashila 2026, organized by Chennai Institute of Technology, has been successfully recorded.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 8px 0; font-weight:600;">
                  Registration Details
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td style="padding:4px 0; width:130px; color:#4b5563;">Registration ID</td>
                    <td style="padding:4px 0; color:#111827;">${registrationId}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0; color:#4b5563;">Event(s)</td>
                    <td style="padding:4px 0; color:#111827;">${eventList}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0; color:#4b5563;">Event Date(s)</td>
                    <td style="padding:4px 0; color:#111827;">${selectedDatesText}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 16px 20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 8px 0; font-weight:600;">
                  Important Instructions
                </p>
                <ul style="margin:0 0 4px 20px; padding:0;">
                  <li style="margin-bottom:6px;">
                    Please carry a valid College Identity Card. A government-issued identity document may also be carried, if available.
                  </li>
                  <li style="margin-bottom:6px;">
                    Where applicable, payment for participation is to be completed at the designated registration or payment counter at the venue, as per the instructions issued by the organizers.
                  </li>
                  <li style="margin-bottom:6px;">
                    Kindly retain your Registration ID (${registrationId}) for reference during verification and for any future correspondence.
                  </li>
                  <li style="margin-bottom:6px;">
                    Further information or changes, if any, will be communicated through the official channels of Takshashila 2026, including your registered email address.
                  </li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 20px 20px; font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 8px 0; font-weight:600;">
                  Next Steps
                </p>
                <ul style="margin:0 0 4px 20px; padding:0;">
                  <li style="margin-bottom:6px;">
                    Review the schedule and venue information for the event(s) for which you have registered on the official website.
                  </li>
                  <li style="margin-bottom:6px;">
                    Report to the venue on the scheduled date(s) ${selectedDatesText} and allow adequate time for entry and on-site formalities.
                  </li>
                  <li style="margin-bottom:6px;">
                    In case of any discrepancy in the above details, please contact the organizing committee at the earliest.
                  </li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 20px 20px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 4px 0;">
                  You may review your registration and related information on the official portal:
                </p>
                <p style="margin:0;">
                  <a href="https://cittakshashila.org/register" style="color:#1d4ed8; text-decoration:none;">
                    https://cittakshashila.org/register
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 20px 20px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#111827; line-height:1.5;">
                <p style="margin:0 0 12px 0;">
                  Should you require any clarification, please contact the organizing committee of Takshashila 2026 through the official communication channels.
                </p>
                <p style="margin:0 0 4px 0;">
                  Sincerely,
                </p>
                <p style="margin:4px 0 0 0;">
                  Team Takshashila 2026<br />
                  Chennai Institute of Technology<br />
                  <a href="https://cittakshashila.org/register" style="color:#1d4ed8; text-decoration:none;">
                    https://cittakshashila.org/register
                  </a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
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
      selectedDates: Array.isArray(after.selectedDays)
        ? (after.selectedDays as string[])
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


