import { jsPDF } from 'jspdf';
import { convertSvgToBase64Png } from '@/lib/utils/svgConverter';

interface PassPDFData {
    passType: string;
    amount: number;
    userName: string;
    email: string;
    phone: string;
    college: string;
    qrCode: string; // Data URL
    logoDataUrl?: string; // Optional pre-converted logo
}

/**
 * Generate PDF pass as Buffer for email attachment (server-side)
 * This version doesn't require DOM/Canvas and works in Node.js
 */
export async function generatePassPDFBuffer(data: PassPDFData): Promise<Buffer> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add dark border/frame (EXACT MATCH)
    pdf.setDrawColor(26, 26, 26);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Add logo at top center with dark background (EXACT MATCH)
    let logoDataUrl = data.logoDataUrl;
    if (!logoDataUrl) {
        // Convert SVG to PNG with dark background
        logoDataUrl = await convertSvgToBase64Png('/tk-logo.svg');
    }

    const logoSize = 35;
    pdf.addImage(
        logoDataUrl,
        'PNG',
        (pageWidth - logoSize) / 2,
        20,
        logoSize,
        logoSize
    );

    // Add title (EXACT MATCH)
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CIT TAKSHASHILA 2026', pageWidth / 2, 65, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('EVENT PASS', pageWidth / 2, 73, { align: 'center' });

    // Add decorative line (EXACT MATCH)
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(40, 78, pageWidth - 40, 78);

    // Add QR code (EXACT MATCH)
    const qrSize = 70;
    pdf.addImage(
        data.qrCode,
        'PNG',
        (pageWidth - qrSize) / 2,
        85,
        qrSize,
        qrSize
    );

    // Add "Show this QR at entry" text (EXACT MATCH)
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Show this QR at entry', pageWidth / 2, 162, { align: 'center' });

    // Add pass details section (EXACT MATCH)
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(25, 170, pageWidth - 25, 170);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('PASS DETAILS', pageWidth / 2, 180, { align: 'center' });

    // Pass info (EXACT MATCH)
    const startY = 190;
    const lineHeight = 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Left column labels (EXACT MATCH)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pass Type:', 30, startY);
    pdf.text('Amount:', 30, startY + lineHeight);
    pdf.text('Name:', 30, startY + lineHeight * 2);
    pdf.text('Email:', 30, startY + lineHeight * 3);
    pdf.text('Phone:', 30, startY + lineHeight * 4);
    pdf.text('College:', 30, startY + lineHeight * 5);

    // Right column values (EXACT MATCH)
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.passType, 70, startY);
    pdf.text(`₹${data.amount}`, 70, startY + lineHeight);
    pdf.text(data.userName, 70, startY + lineHeight * 2);
    pdf.text(data.email || 'N/A', 70, startY + lineHeight * 3);
    pdf.text(data.phone, 70, startY + lineHeight * 4);
    pdf.text(data.college, 70, startY + lineHeight * 5);

    // Add footer (EXACT MATCH)
    pdf.setDrawColor(200, 200, 200);
    pdf.line(25, 255, pageWidth - 25, 255);

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Innovation Meets Culture', pageWidth / 2, 262, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text('Chennai Institute of Technology', pageWidth / 2, 268, { align: 'center' });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    return pdfBuffer;
}
