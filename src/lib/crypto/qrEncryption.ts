/**
 * QR Code Encryption Utilities
 * 
 * Provides AES-256-CBC encryption/decryption for QR code data.
 * Allows offline scanning by embedding encrypted user data in QR codes.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Get encryption key from environment variable
 * @throws Error if key is not configured or invalid length
 */
function getEncryptionKey(): Buffer {
    const key = process.env.QR_ENCRYPTION_KEY;

    if (!key) {
        throw new Error(
            'QR_ENCRYPTION_KEY environment variable is not set. ' +
            'Please add a 32-character secret key to your .env file.'
        );
    }

    if (key.length !== 32) {
        throw new Error(
            `QR_ENCRYPTION_KEY must be exactly 32 characters (256 bits). ` +
            `Current length: ${key.length}`
        );
    }

    return Buffer.from(key, 'utf8');
}

/**
 * Encrypt QR data object to hex string
 * 
 * @param data - Object containing pass data (id, name, passType, events, days, etc.)
 * @returns Encrypted string in format "IV:ENCRYPTED_DATA" (hex encoded)
 * 
 * @example
 * const qrData = {
 *   id: "pass_123",
 *   name: "John Doe",
 *   passType: "day_pass",
 *   events: ["tech-hackathon"],
 *   days: ["2026-02-26"]
 * };
 * const encrypted = encryptQRData(qrData);
 * // Returns: "a3f5b2c8d4e5f6g7:h8i9j0k1l2m3n4o5..."
 */
export function encryptQRData(data: object): string {
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);

        // Convert object to JSON string
        const text = JSON.stringify(data);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt data
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV + encrypted data (both hex encoded)
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        throw new Error(
            `Failed to encrypt QR data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Decrypt QR data from hex string to object
 * 
 * @param encryptedText - Encrypted string in format "IV:ENCRYPTED_DATA"
 * @returns Decrypted object with pass data
 * 
 * @example
 * const encrypted = "a3f5b2c8d4e5f6g7:h8i9j0k1l2m3n4o5...";
 * const passData = decryptQRData(encrypted);
 * // Returns: { id: "pass_123", name: "John Doe", ... }
 */
export function decryptQRData(encryptedText: string): any {
    try {
        const key = getEncryptionKey();

        // Split IV and encrypted data
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format. Expected "IV:DATA"');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        // Validate IV length
        if (iv.length !== IV_LENGTH) {
            throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes, got ${iv.length}`);
        }

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        // Decrypt data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Parse JSON
        return JSON.parse(decrypted);
    } catch (error) {
        throw new Error(
            `Failed to decrypt QR data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Generate a secure random 32-character encryption key
 * Use this to generate a key for QR_ENCRYPTION_KEY environment variable
 * 
 * @returns 32-character random string
 * 
 * @example
 * const key = generateSecretKey();
 * console.log(`QR_ENCRYPTION_KEY=${key}`);
 * // Add this to your .env file
 */
export function generateSecretKey(): string {
    return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex characters
}

/**
 * Validate that encryption/decryption works correctly
 * Used for testing
 */
export function testEncryption(): boolean {
    try {
        const testData = {
            id: 'test_pass_123',
            name: 'Test User',
            passType: 'day_pass',
            events: ['event1', 'event2'],
            days: ['2026-02-26']
        };

        const encrypted = encryptQRData(testData);
        const decrypted = decryptQRData(encrypted);

        return JSON.stringify(testData) === JSON.stringify(decrypted);
    } catch (error) {
        console.error('Encryption test failed:', error);
        return false;
    }
}
