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
  college?: string;
  phone?: string;
  qrCode?: string;
  passId?: string;
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
    college?: string;
    phone?: string;
    email?: string;
    qrCode?: string; // Data URL or CID
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
      // OD Email Replacement
      const formattedPassType = passType.replace(/_/g, ' ').toUpperCase();
      const collegeStr = options.college || "their college";

      if (isGroupRegistration) {
        return {
          subject: "Request for On Duty Leave – CIT Takshashila 2026",
          html: `
<h2>Request for On Duty Leave</h2>

<p>Dear Sir/Madam,</p>

<p>This is to certify that <strong>${options.leaderName?.trim() || "Team Leader"}</strong> from <strong>${collegeStr}</strong> has registered a team for CIT Takshashila 2026, the annual techno-cultural fest of Chennai Institute of Technology.</p>

<p>The team <strong>${options.teamName}</strong> has opted for the ${formattedPassType} pass and will be attending the events listed below. Kindly grant On Duty leave for the duration of the fest.</p>

<h3>Registration Details</h3>
<ul>
  <li><strong>Leader Name:</strong> ${options.leaderName?.trim() || "Team Leader"}</li>
  <li><strong>Email:</strong> ${options.email || "N/A"}</li>
  <li><strong>Phone:</strong> ${options.phone || "N/A"}</li>
  <li><strong>College:</strong> ${collegeStr}</li>
  <li><strong>Pass Type:</strong> ${formattedPassType}</li>
</ul>

<h3>Registered Events</h3>
<ul>
  <li>${options.eventName} (Team of ${options.totalMembers})</li>
</ul>

<p>We kindly request you to grant the necessary permission.</p>

<p>Thanking you,<br/>
<strong>CIT Takshashila 2026 Committee</strong><br/>
<a href="mailto:cittakshashila@citchennai.net">cittakshashila@citchennai.net</a><br/>
Chennai Institute of Technology, Kundrathur, Chennai - 600069
</p>`.trim(),
        };
      }

      return {
        subject: "Request for On Duty Leave – CIT Takshashila 2026",
        html: `
<h2>Request for On Duty Leave</h2>

<p>Dear Sir/Madam,</p>

<p>This is to certify that <strong>${safeName}</strong> from <strong>${collegeStr}</strong> has registered for CIT Takshashila 2026, the annual techno-cultural fest of Chennai Institute of Technology.</p>

<p>The student has opted for the ${formattedPassType} pass and will be attending the events listed below. Kindly grant On Duty leave for the duration of the fest.</p>

<h3>Registration Details</h3>
<ul>
  <li><strong>Name:</strong> ${safeName}</li>
  <li><strong>Email:</strong> ${options.email || "N/A"}</li>
  <li><strong>Phone:</strong> ${options.phone || "N/A"}</li>
  <li><strong>College:</strong> ${collegeStr}</li>
  <li><strong>Pass Type:</strong> ${formattedPassType}</li>
</ul>

<h3>Registered Events</h3>
<ul>
  ${options.selectedEvents && options.selectedEvents.length > 0 ? options.selectedEvents.map((evt) => `<li>${evt}</li>`).join('') : "<li>Not specified</li>"}
</ul>

<p>We kindly request you to grant the necessary permission.</p>

<p>Thanking you,<br/>
<strong>CIT Takshashila 2026 Committee</strong><br/>
<a href="mailto:cittakshashila@citchennai.net">cittakshashila@citchennai.net</a><br/>
Chennai Institute of Technology, Kundrathur, Chennai - 600069
</p>`.trim(),
      };
    case "converted":
      const qrCodeSection = options.qrCode
        ? `
        <div style="text-align: center; margin: 32px 0;">
          <p style="font-weight: 600; margin-bottom: 16px;">Your Entry QR Code:</p>
          <img src="cid:qrcode" alt="Registration QR Code" style="width: 250px; height: 250px; border: 4px solid #7c3aed; border-radius: 12px;" />
          <p style="font-size: 14px; color: #ef4444; margin-top: 12px;">*Please keep this QR code secure and present it at the venue.</p>
        </div>`
        : "";

      return {
        subject: "Pass Activated – Takshashila 2026",
        html: `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
<h2 style="color: #7c3aed;">Your Pass is Activated</h2>

<p>Dear ${safeName},</p>

<p>We confirm that your payment has been successfully received at the venue.</p>

<p><strong>Pass Details:</strong></p>
<div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
<ul>
  <li>Pass Type: ${passType}</li>
  <li>Amount Paid: ₹${formattedAmount}</li>
  <li>Registration ID: ${registrationId}</li>
</ul>
</div>

${qrCodeSection}

<p>
Your official QR pass is now active.
</p>

<p>
Access your pass here:<br/>
<a href="https://cittakshashila.org/register/my-pass" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
View My Pass
</a>
</p>

<p style="margin-top: 20px;">
Please do not share your QR code. It is valid for single-entry scanning.
</p>

<p>
We wish you an exciting experience at Takshashila 2026.
</p>

<p>
Regards,<br/>
Team Takshashila 2026
</p>
</div>
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

    let qrCode: string | undefined = after.qrCode;
    if (afterStatus === "converted" && !qrCode) {
      const passId = after.passId || (after as any).convertedToPassId;
      if (passId) {
        try {
          const passSnap = await admin.firestore().collection("passes").doc(passId).get();
          if (passSnap.exists) {
            qrCode = passSnap.data()?.qrCode as string | undefined;
          }
        } catch (err) {
          functions.logger.error("Failed to fetch pass for QR code", { passId, error: err });
        }
      }

      // If still no QR code for a converted status, we wait for the doc to be updated with one
      if (!qrCode) {
        functions.logger.info("Converted registration missing QR code; skipping email until it is added.", { registrationId });
        return;
      }
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
      college: after.college,
      phone: after.phone,
      email: email,
      qrCode: qrCode ? "cid:qrcode" : undefined,
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
      const mailOptions: any = {
        from: fromAddress,
        to: email,
        subject,
        html,
      };

      if (qrCode) {
        const base64Data = qrCode.split(",")[1];
        if (base64Data) {
          mailOptions.attachments = [
            {
              filename: "qrcode.png",
              content: base64Data,
              encoding: "base64",
              cid: "qrcode",
            },
          ];
        }
      }

      const info = await transporter.sendMail(mailOptions);

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

/**
 * Trigger: payments/{paymentId}
 * Triggered on any change to a payment document.
 * If status becomes 'converted', ensures a pass exists and sends email.
 */
export const onPaymentStatusConverted = functions
  .runWith({ secrets: [SMTP_USER, SMTP_PASS] })
  .firestore
  .document("payments/{paymentId}")
  .onWrite(async (change, context) => {
    const after = change.after.exists
      ? (change.after.data() as Record<string, unknown>)
      : undefined;
    if (!after) return;

    const beforeStatus = (change.before.data()?.status as string | undefined) ?? undefined;
    const afterStatus = after.status as string;

    // Only act on transitions into "converted" (or 'success' if it came from conversion)
    if (afterStatus !== "converted" && afterStatus !== "success") return;
    if (beforeStatus === afterStatus) return;

    const paymentId = context.params.paymentId;
    const userId = after.userId as string;
    const registrationId = after.registrationId as string | undefined;

    if (!userId) return;

    const db = admin.firestore();

    // 1. Check if pass already exists
    const passSnap = await db
      .collection("passes")
      .where("paymentId", "==", paymentId)
      .limit(1)
      .get();

    let qrCode: string | undefined = undefined;

    if (passSnap.empty) {
      functions.logger.info("Creating missing pass for converted payment", { paymentId });

      const passRef = db.collection("passes").doc();
      const passId = passRef.id;

      let hasTech = false;
      let hasNonTech = false;
      const passType = after.passType as string;
      const selectedEvents = (after.selectedEvents as string[]) || [];
      const selectedDays = (after.selectedDays as string[]) || [];

      const passData: Record<string, unknown> = {
        userId,
        passType,
        amount: after.amount || 0,
        paymentId,
        registrationId: registrationId || null,
        status: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        selectedEvents,
        selectedDays,
        eventAccess: {
          tech: hasTech,
          nonTech: hasNonTech,
          proshowDays: passType === "proshow" ? ["2026-02-26", "2026-02-28"] : [],
          fullAccess: passType === "sana_concert",
        },
      };

      if (after.teamId) {
        passData.teamId = after.teamId;
      }

      await passRef.set(passData);
      functions.logger.info("Pass created", { passId, paymentId });
    } else {
      const existingPass = passSnap.docs[0];
      qrCode = existingPass.data().qrCode as string;
      functions.logger.info("Pass already exists for converted payment", { passId: existingPass.id, paymentId });
    }

    // 2. Send Email
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const email = (userData?.email || (after.customerDetails as any)?.email) as string | undefined;

    if (!email) {
      functions.logger.warn("No email found to send confirmation for payment", { paymentId });
      return;
    }

    const smtpUser = SMTP_USER.value() || process.env.SMTP_USER;
    const smtpPass = SMTP_PASS.value() || process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) return;

    const { subject, html } = buildEmail("converted", {
      name: userData?.name || (after.customerDetails as any)?.name,
      registrationId: registrationId || paymentId,
      passType: after.passType as string,
      amount: (after.amount as number) || 0,
      email: email,
      qrCode: "cid:qrcode",
      college: userData?.college,
      phone: userData?.phone || (after.customerDetails as any)?.phone,
      selectedEvents: after.selectedEvents as string[],
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      // If pass exists but qrCode is not set yet in the variable, fetch it
      if (!qrCode) {
        const passRef = await db.collection("passes").where("paymentId", "==", paymentId).limit(1).get();
        if (!passRef.empty) {
          qrCode = passRef.docs[0].data().qrCode;
        }
      }

      if (!qrCode) {
        functions.logger.warn("QR code not found for converted payment email", { paymentId });
        // Optionally return early or wait? The original logic for status change returns early.
        // For payment converted, we might want to wait or just skip the attachment for now.
        // Given the requirement, we should probably fetch it.
      }

      const base64Data = qrCode ? qrCode.split(",")[1] : undefined;
      await transporter.sendMail({
        from: `"CIT Takshashila" <${smtpUser}>`,
        to: email,
        subject,
        html,
        attachments: base64Data ? [
          {
            filename: "qrcode.png",
            content: base64Data,
            encoding: "base64",
            cid: "qrcode",
          },
        ] : [],
      });
      functions.logger.info("Confirmation email sent for converted payment", { paymentId, email });
    } catch (err) {
      functions.logger.error("Failed to send email for converted payment", { paymentId, error: err });
    }
  });


