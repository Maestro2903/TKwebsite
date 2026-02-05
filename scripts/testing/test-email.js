/**
 * Test script to send a test email via Resend
 * Run with: node scripts/test-email.js
 */

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');
const QRCode = require('qrcode');
const { jsPDF } = require('jspdf');
const fs = require('fs');

const sharp = require('sharp');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

async function convertSvgToBase64Png(svgPath) {
  const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', svgPath));
  const size = 200;
  const circleRadius = size / 2;
  const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius}" fill="#1a1a1a"/></svg>`;

  const logoPng = await sharp(svgBuffer)
    .resize(Math.floor(size * 0.625), Math.floor(size * 0.625))
    .png()
    .toBuffer();

  const circlePng = await sharp(Buffer.from(circleSvg)).resize(size, size).png().toBuffer();

  const compositePng = await sharp(circlePng)
    .composite([{ input: logoPng, top: Math.floor(size * 0.1875), left: Math.floor(size * 0.1875) }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${compositePng.toString('base64')}`;
}

async function generateSamplePDF() {
  console.log('📄 Generating sample PDF with logo...');

  const qrCodeDataUrl = await generateSampleQRCode();
  const logoDataUrl = await convertSvgToBase64Png('/tk-logo.svg');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Dark border
  pdf.setDrawColor(26, 26, 26);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Logo
  const logoSize = 35;
  pdf.addImage(logoDataUrl, 'PNG', (pageWidth - logoSize) / 2, 20, logoSize, logoSize);

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CIT TAKSHASHILA 2026', pageWidth / 2, 65, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('EVENT PASS - SAMPLE', pageWidth / 2, 73, { align: 'center' });

  // Decorative line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  pdf.line(40, 78, pageWidth - 40, 78);

  // QR code
  const qrSize = 70;
  pdf.addImage(qrCodeDataUrl, 'PNG', (pageWidth - qrSize) / 2, 85, qrSize, qrSize);

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Show this QR at entry', pageWidth / 2, 162, { align: 'center' });

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(25, 170, pageWidth - 25, 170);

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('PASS DETAILS', pageWidth / 2, 180, { align: 'center' });

  const startY = 190;
  const lineHeight = 10;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pass Type:', 30, startY);
  pdf.text('Amount:', 30, startY + lineHeight);
  pdf.text('Name:', 30, startY + lineHeight * 2);
  pdf.text('Email:', 30, startY + lineHeight * 3);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Day Pass', 70, startY);
  pdf.text('₹500', 70, startY + lineHeight);
  pdf.text('Sample User', 70, startY + lineHeight * 2);
  pdf.text('test@example.com', 70, startY + lineHeight * 3);

  pdf.setDrawColor(200, 200, 200);
  pdf.line(25, 255, pageWidth - 25, 255);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Innovation Meets Culture', pageWidth / 2, 262, { align: 'center' });

  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  console.log('✓ PDF generated');
  return pdfBuffer;
}

async function generateSampleQRCode() {
  // Generate a sample QR code as data URL
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

async function sendTestEmail() {
  console.log('📧 Sending test email...');
  console.log('API Key:', process.env.RESEND_API_KEY ? '✓ Found' : '✗ Missing');

  // Generate sample QR code
  console.log('🔲 Generating sample QR code...');
  const qrCodeDataUrl = await generateSampleQRCode();
  console.log('✓ QR code generated');

  // Generate sample PDF
  const pdfBuffer = await generateSamplePDF();

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'takshashila@citchennai.net', // Resend test mode only allows sending to account owner email
      subject: 'Test Email with QR Code & PDF - CIT Takshashila 2026',
      attachments: [
        {
          filename: 'takshashila-sample-pass.pdf',
          content: pdfBuffer,
        },
      ],
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="color: #7c3aed; font-size: 24px; font-weight: 800; margin-bottom: 16px;">
            Email Service Test ✅
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            This is a test email from CIT Takshashila 2026 registration system.
          </p>
          
          <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 12px;">Test Details:</h2>
            <ul style="color: #4b5563; padding-left: 20px;">
              <li>Email service: <strong>Resend</strong></li>
              <li>Sender: <strong>onboarding@resend.dev</strong></li>
              <li>Status: <strong>Active</strong></li>
              <li>Time: <strong>${new Date().toLocaleString()}</strong></li>
              <li>Attachment: <strong>Sample PDF Pass ✅</strong></li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <p style="font-weight: 600; margin-bottom: 16px; color: #1f2937;">Sample Entry QR Code:</p>
            <img src="${qrCodeDataUrl}" alt="Sample QR Code" style="width: 250px; height: 250px; border: 4px solid #7c3aed; border-radius: 12px;" />
            <p style="font-size: 14px; color: #ef4444; margin-top: 12px;">*This is a sample QR code for testing purposes.</p>
          </div>

          <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            If you received this email, the SMTP service is working correctly! 🎉<br>
            <strong>Team Takshashila</strong>
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
    console.log('⚠️  NOTE: Resend test mode only allows sending to account owner email.');
    console.log('   To send to other addresses, verify a domain at resend.com/domains');
  } catch (err) {
    console.error('❌ Fatal error:', err);
  }
}

sendTestEmail();
