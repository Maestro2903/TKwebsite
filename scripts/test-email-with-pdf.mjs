/**
 * Test script to send confirmation email with PDF attachment
 * Run with: node --loader ts-node/esm scripts/test-email-with-pdf.mjs
 */

import 'dotenv/config';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

const resend = new Resend(process.env.RESEND_API_KEY);

async function generateSampleQRCode() {
    const sampleData = JSON.stringify({
        passId: 'TEST-' + Date.now(),
        userId: 'test-user-123',
        passType: 'day_pass',
        timestamp: new Date().toISOString()
    });

    return await QRCode.toDataURL(sampleData, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });
}

async function generatePassPDF(qrCodeDataUrl) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add border
    pdf.setDrawColor(26, 26, 26);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Add title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CIT TAKSHASHILA 2026', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('EVENT PASS', pageWidth / 2, 40, { align: 'center' });

    // Add QR code
    const qrSize = 70;
    pdf.addImage(qrCodeDataUrl, 'PNG', (pageWidth - qrSize) / 2, 55, qrSize, qrSize);

    // Add pass details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PASS DETAILS', pageWidth / 2, 140, { align: 'center' });

    const startY = 150;
    const lineHeight = 10;
    pdf.setFontSize(11);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass Type:', 30, startY);
    pdf.text('Amount:', 30, startY + lineHeight);
    pdf.text('Name:', 30, startY + lineHeight * 2);
    pdf.text('Email:', 30, startY + lineHeight * 3);

    pdf.setFont('helvetica', 'normal');
    pdf.text('Day Pass', 70, startY);
    pdf.text('₹500', 70, startY + lineHeight);
    pdf.text('Test User', 70, startY + lineHeight * 2);
    pdf.text('takshashila@citchennai.net', 70, startY + lineHeight * 3);

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Innovation Meets Culture', pageWidth / 2, 250, { align: 'center' });

    return Buffer.from(pdf.output('arraybuffer'));
}

async function sendTestEmail() {
    console.log('📧 Sending test confirmation email with PDF...');
    console.log('API Key:', process.env.RESEND_API_KEY ? '✓ Found' : '✗ Missing');

    // Generate QR code
    console.log('🔲 Generating QR code...');
    const qrCodeDataUrl = await generateSampleQRCode();
    console.log('✓ QR code generated');

    // Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBuffer = await generatePassPDF(qrCodeDataUrl);
    console.log('✓ PDF generated');

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'takshashila@citchennai.net',
            subject: 'Your Pass for CIT Takshashila 2026',
            attachments: [
                {
                    filename: 'takshashila-pass-day_pass.pdf',
                    content: pdfBuffer,
                },
            ],
            html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="color: #7c3aed; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Registration Confirmed!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Hi <strong>Test User</strong>, your payment of <strong>₹500</strong> has been successfully processed.
          </p>
          
          <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>Pass Type:</strong> Day Pass</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>College:</strong> Test College</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Phone:</strong> 1234567890</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <p style="font-weight: 600; margin-bottom: 16px;">Your Entry QR Code:</p>
            <img src="${qrCodeDataUrl}" alt="Registration QR Code" style="width: 250px; height: 250px; border: 4px solid #7c3aed; border-radius: 12px;" />
            <p style="font-size: 14px; color: #ef4444; margin-top: 12px;">*Please keep this QR code secure and present it at the venue.</p>
          </div>

          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              📎 <strong>Your pass is attached as a PDF</strong> - Download and save it for offline access!
            </p>
          </div>

          <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            See you at CIT Takshashila 2026!<br>
            <a href="https://takshashila26.in" style="color: #7c3aed; text-decoration: none;">takshashila26.in</a>
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
        console.log('📎 PDF attachment included: takshashila-pass-day_pass.pdf');
    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
}

sendTestEmail();
