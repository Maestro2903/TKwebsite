#!/usr/bin/env node
/**
 * Test QR Code Generator
 * Generates a test QR code for payment verification testing
 */

const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// QR Secret (matches the one in qrService.ts)
const QR_SECRET = process.env.QR_SECRET_KEY || 'default-secret-change-in-production';

function createSignedQR(passId, expiryDays = 30) {
    const expiry = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    const payload = `${passId}:${expiry}`;

    const signature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16);

    return `${payload}.${signature}`;
}

function createQRPayload(passId, userId, passType) {
    const signedToken = createSignedQR(passId);

    return JSON.stringify({
        passId,
        userId,
        passType,
        token: signedToken,
    });
}

async function generateTestQR() {
    // Test data
    const testPassId = 'test_pass_' + Date.now();
    const testUserId = 'test_user_123';
    const testPassType = 'test_pass'; // For ₹1 test pass

    console.log('Generating test QR code...');
    console.log('Test Pass ID:', testPassId);
    console.log('Test User ID:', testUserId);
    console.log('Test Pass Type:', testPassType);

    // Create QR payload
    const qrData = createQRPayload(testPassId, testUserId, testPassType);
    console.log('\nQR Payload:', qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 500,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });

    // Also generate as PNG file
    const outputDir = path.join(__dirname, 'test-qr-codes');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `test-qr-${Date.now()}.png`);
    await QRCode.toFile(outputPath, qrData, {
        width: 500,
        margin: 2,
    });

    console.log('\n✅ Test QR code generated successfully!');
    console.log('📁 Saved to:', outputPath);
    console.log('\n📋 QR Data URL (first 100 chars):', qrCodeDataUrl.substring(0, 100) + '...');

    // Also save the data and details to a JSON file
    const detailsPath = path.join(outputDir, `test-qr-${Date.now()}.json`);
    fs.writeFileSync(detailsPath, JSON.stringify({
        passId: testPassId,
        userId: testUserId,
        passType: testPassType,
        qrData: qrData,
        qrDataUrl: qrCodeDataUrl,
        generatedAt: new Date().toISOString(),
    }, null, 2));

    console.log('📄 Details saved to:', detailsPath);
    console.log('\n✨ You can now use this QR code to test the payment verification flow!');
}

// Run
generateTestQR().catch(err => {
    console.error('❌ Error generating test QR code:', err);
    process.exit(1);
});
