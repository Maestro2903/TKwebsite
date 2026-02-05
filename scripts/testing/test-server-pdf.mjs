/**
 * Test script to verify server-side PDF generator with logo
 * This uses the ACTUAL pdfGeneratorServer.ts that will be used in production
 */

// Use ES modules
import 'dotenv/config';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { generatePassPDFBuffer } from '../backend/lib/pdfGeneratorServer.ts';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testServerPDFWithLogo() {
    console.log('📧 Testing server-side PDF generator with logo...');
    console.log('API Key:', process.env.RESEND_API_KEY ? '✓ Found' : '✗ Missing');

    // Generate sample QR code
    console.log('🔲 Generating QR code...');
    const sampleData = JSON.stringify({
        passId: 'TEST-' + Date.now(),
        userId: 'test-user-123',
        passType: 'day_pass',
        timestamp: new Date().toISOString()
    });

    const qrCodeDataUrl = await QRCode.toDataURL(sampleData, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });
    console.log('✓ QR code generated');

    // Generate PDF using server-side generator (with logo!)
    console.log('📄 Generating PDF with logo using pdfGeneratorServer.ts...');
    const pdfBuffer = await generatePassPDFBuffer({
        passType: 'Day Pass',
        amount: 500,
        userName: 'Test User',
        email: 'takshashila@citchennai.net',
        phone: '1234567890',
        college: 'Test College',
        qrCode: qrCodeDataUrl,
    });
    console.log('✓ PDF generated with logo');

    // Send email
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'takshashila@citchennai.net',
            subject: 'Test: Server-Side PDF with Logo',
            attachments: [
                {
                    filename: 'takshashila-pass-with-logo.pdf',
                    content: pdfBuffer,
                },
            ],
            html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="color: #7c3aed; font-size: 24px; font-weight: 800; margin-bottom: 16px;">
            Server-Side PDF Test ✅
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            This email contains a PDF generated using the <strong>server-side PDF generator</strong> 
            (pdfGeneratorServer.ts) that includes the Takshashila logo.
          </p>
          
          <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 12px;">Test Details:</h2>
            <ul style="color: #4b5563; padding-left: 20px;">
              <li>Generator: <strong>pdfGeneratorServer.ts</strong></li>
              <li>Logo: <strong>tk-logo.svg (converted to PNG)</strong></li>
              <li>Background: <strong>Dark circular background</strong></li>
              <li>Position: <strong>Y=20mm, Size=35mm</strong></li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              📎 <strong>Check the attached PDF</strong> - It should include the Takshashila logo at the top!
            </p>
          </div>

          <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            This is the same PDF generator used in production webhooks.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            return;
        }

        console.log('✅ Email sent successfully!');
        console.log('Email ID:', data.id);
        console.log('Check inbox: takshashila@citchennai.net');
        console.log('');
        console.log('📎 PDF attachment: takshashila-pass-with-logo.pdf');
        console.log('✓ This PDF should include the Takshashila logo!');
    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
}

testServerPDFWithLogo();
