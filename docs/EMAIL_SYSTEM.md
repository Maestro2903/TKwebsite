## 1. Overview

The CIT Takshashila 2026 platform uses **Resend** for transactional email. Email is used to:

- Welcome users to the fest (optional)
- Confirm successful payments
- Deliver passes (via QR images and optional PDF attachments)

Email sending is implemented in `src/features/email/emailService.ts` and is called primarily from payment/pass flows.

---

## 2. Provider & Configuration

### 2.1 Provider: Resend

- SDK: `resend` npm package.
- Instantiated once:

```ts
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = 'onboarding@resend.dev'; // test sender
```

**Environment variable:**

- `RESEND_API_KEY` – secret API key for Resend.

If `RESEND_API_KEY` is **not** set:

- `resend` is `null`.
- `sendEmail` logs a warning and returns `{ success: false, error: 'Resend not configured' }`.
- This allows local/dev environments without email to function without breaking the payment flow.

---

## 3. Email API

### 3.1 Type: `EmailData`

From `src/features/email/emailService.ts`:

```ts
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}
```

### 3.2 `sendEmail`

```ts
export async function sendEmail({ to, subject, html, attachments }: EmailData) {
  if (!resend) {
    console.warn('Resend is not initialized. Skipping email.');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const emailPayload: any = {
      from: FROM_EMAIL,
      to,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Fatal error sending email:', err);
    return { success: false, error: err };
  }
}
```

Behavior:

- Returns a `{ success, data? \| error? }` object.
- Logs all errors to the server console (Vercel logs).
- Does **not** throw on failure, allowing calling code to continue (e.g. consider payment successful even if email fails).

---

## 4. Templates

Templates are defined in `emailTemplates`:

```ts
export const emailTemplates = {
  welcome: (name: string) => ({ subject, html }),
  passConfirmation: (data: { name, amount, passType, college, phone, qrCodeUrl }) => ({ subject, html })
};
```

### 4.1 Welcome Email

- **When used:** Optional — can be triggered when user completes profile or on first sign‑in.
- **Subject:** `Welcome to CIT Takshashila 2026!`
- **Content:**
  - Personalized greeting (`Welcome aboard, {name}!`).
  - Short description of the fest.
  - “Next steps” with bullet points.
  - Footer with team signature.

### 4.2 Pass Confirmation Email

- **When used:** After successful payment and pass creation (typically in webhook/verify/admin flows).
- **Subject:** `Your Pass for CIT Takshashila 2026`
- **Parameters:**
  - `name` – attendee name.
  - `amount` – amount paid.
  - `passType` – human‑readable pass label.
  - `college` – attendee college.
  - `phone` – attendee phone.
  - `qrCodeUrl` – image URL/Data URL of QR code (from pass).

- **Content:**
  - Greeting and confirmation of payment amount.
  - Summary section:
    - Pass Type
    - College
    - Phone
  - Centered QR code:
    - `<img src="{qrCodeUrl}" ... />`
    - Instructions to keep the QR safe and present at venue.
  - Footer with link to the site (`takshashila26.in`).

The email HTML is inline‑styled for compatibility with major email clients.

---

## 5. Attachments & PDF Passes

PDF generation is handled by server‑side utilities using `jspdf` and `canvas`/`html2canvas`. When available:

- A PDF buffer is attached using the `attachments` field:

```ts
attachments: [
  {
    filename: 'Takshashila_Pass.pdf',
    content: pdfBuffer
  }
]
```

The email will then contain:

- Inline QR code + event details in HTML.
- Downloadable PDF pass.

If PDF generation fails:

- `sendEmail` is still called with no attachments.
- Users still receive a functional email with embedded QR code.

---

## 6. Integration Points

Email sending is integrated into the payment and admin flows:

- **Payment success (webhook/verify):**
  - After creating `passes/{passId}` and generating QR:
    - Build `passConfirmation` template.
    - Optionally generate and attach PDF.
    - Call `sendEmail`.

- **Admin fix-stuck-payment:**
  - When a pass is created late via `/api/admin/fix-stuck-payment`:
    - Same pattern: confirmation email + QR/PDF.

Other potential integration points:

- Initial welcome message after profile creation.
- Reminder emails or event updates (not currently implemented).

---

## 7. Testing Email

### 7.1 Local / Dev Behavior

- If `RESEND_API_KEY` is **not** set:
  - `sendEmail` logs a warning and returns `{ success: false, error: 'Resend not configured' }`.
  - Payment flows continue without email.

- For development/testing with a valid key:
  - Use Resend’s test sender `onboarding@resend.dev`.
  - Add your own email to the `to` field for testing.

### 7.2 Test Script

Use `scripts/testing/test-email.js`:

- Sends a sample email using the configured `RESEND_API_KEY`.
- Verifies that:
  - Authentication with Resend is working.
  - The running environment can reach Resend’s API.

Run:

```bash
npm run test:email
```

---

## 8. Production Considerations

For production deployments:

- **Use a verified sender domain**
  - Configure a custom `FROM_EMAIL` with your domain (e.g. `no-reply@takshashila26.in`).
  - Set up SPF/DKIM in DNS as required by Resend.

- **Deliverability**
  - Monitor bounce and spam rates (Resend dashboard).
  - Keep email content clear and minimal; avoid heavy images where unnecessary.

- **Security**
  - Never log or expose the `RESEND_API_KEY`.
  - Keep the key in environment variables only (Vercel dashboard, not committed).

---

## 9. Summary

- Email is **optional but integrated**: the system functions without it in development, but in production it delivers a polished experience with QR + optional PDF.
- Failures in email **never block** payment or pass creation; they are treated as a separate concern and logged for investigation.
- Centralization via `emailService.ts` ensures:
  - All emails use consistent styling and formats.
  - It is easy to add new templates and debugging instrumentation in one place.

For how email is triggered within the overall payment/pass flow, see `PAYMENT_WORKFLOW.md` and `PASS_QR_SYSTEM.md`.

