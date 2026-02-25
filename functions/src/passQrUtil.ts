import QRCode from "qrcode";
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.QR_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "QR_ENCRYPTION_KEY environment variable is not set. " +
        "Please configure a 32-character secret key in your Cloud Functions environment."
    );
  }

  if (key.length !== 32) {
    throw new Error(
      `QR_ENCRYPTION_KEY must be exactly 32 characters (256 bits). Current length: ${key.length}`
    );
  }

  return Buffer.from(key, "utf8");
}

export function encryptQRData(data: Record<string, unknown>): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const text = JSON.stringify(data);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export async function generatePassQRImage(options: {
  passId: string;
  name: string;
  passType: string;
  events: string[];
  days: string[];
}): Promise<{ qrDataUrl: string; qrBase64: string }> {
  const { passId, name, passType, events, days } = options;

  const qrPayload = {
    id: passId,
    name,
    passType,
    events,
    days,
  };

  const encrypted = encryptQRData(qrPayload);

  const qrDataUrl = await QRCode.toDataURL(encrypted, {
    errorCorrectionLevel: "H",
    width: 400,
  });

  const base64 = qrDataUrl.split(",")[1] ?? "";

  return {
    qrDataUrl,
    qrBase64: base64,
  };
}

