import { jsPDF } from 'jspdf';

/**
 * Convert SVG to PNG data URL with a dark background for logo visibility
 */
async function svgToDataURL(svgPath: string, addBackground = true): Promise<string> {
  const response = await fetch(svgPath);
  const svgText = await response.text();

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const size = 200;
      canvas.width = size;
      canvas.height = size;

      if (addBackground) {
        ctx.fillStyle = '#0a1628';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      const imgSize = size * 0.625;
      const offset = (size - imgSize) / 2;
      ctx.drawImage(img, offset, offset, imgSize, imgSize);

      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}

interface ODLetterData {
  userName: string;
  email: string;
  phone: string;
  college: string;
  passType: string;
  selectedDays: string[];
  selectedEvents: Array<{ id: string; name: string; venue?: string; startTime?: string; endTime?: string }>;
  calculatedAmount: number;
}

// Blue gradient colors (matching login page) — used as literal RGB in drawing functions
// DARK_BG=#0a1628, GRADIENT_TOP=#0f2040, GRADIENT_MID=#132d56
// ACCENT_BLUE=#4a9bd9, LIGHT_BLUE=#7ab8e8, TEXT_WHITE=#e8f0fa

/**
 * Draw a blue gradient background on the full page
 */
function drawGradientBackground(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  // Simulate gradient with horizontal bands
  const steps = 60;
  const bandHeight = pageHeight / steps;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    // Interpolate from DARK_BG (#0a1628) to GRADIENT_MID (#132d56) then darken
    const r = Math.round(10 + ratio * 9);
    const g = Math.round(22 + ratio * 23);
    const b = Math.round(40 + ratio * 46);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i * bandHeight, pageWidth, bandHeight + 0.5, 'F');
  }
}

/**
 * Draw decorative frame and header
 */
function drawFrame(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  // Outer glow border
  pdf.setDrawColor(74, 155, 217); // ACCENT_BLUE
  pdf.setLineWidth(0.8);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Inner subtle border
  pdf.setDrawColor(19, 45, 86); // GRADIENT_MID
  pdf.setLineWidth(0.3);
  pdf.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Corner accents (top-left)
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(1.2);
  pdf.line(12, 22, 12, 12); pdf.line(12, 12, 22, 12);
  // top-right
  pdf.line(pageWidth - 22, 12, pageWidth - 12, 12); pdf.line(pageWidth - 12, 12, pageWidth - 12, 22);
  // bottom-left
  pdf.line(12, pageHeight - 22, 12, pageHeight - 12); pdf.line(12, pageHeight - 12, 22, pageHeight - 12);
  // bottom-right
  pdf.line(pageWidth - 22, pageHeight - 12, pageWidth - 12, pageHeight - 12); pdf.line(pageWidth - 12, pageHeight - 22, pageWidth - 12, pageHeight - 12);
}

/**
 * Format date string: "2026-02-26" → "26 February 2026"
 */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Generate and download an OD Letter PDF for pending registrations
 * Fits on a single A4 page.
 */
export async function generateODLetterPDF(data: ODLetterData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  // Blue gradient background
  drawGradientBackground(pdf, pw, ph);
  drawFrame(pdf, pw, ph);

  // Logo — centered properly
  try {
    const logoDataUrl = await svgToDataURL('/tk-logo.svg', true);
    const logoSize = 22;
    pdf.addImage(logoDataUrl, 'PNG', (pw - logoSize) / 2, 16, logoSize, logoSize);
  } catch {
    // skip logo if unavailable
  }

  let y = 42;

  // Header: TAKSHASHILA 2026
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(232, 240, 250);
  pdf.text('CIT TAKSHASHILA 2026', pw / 2, y, { align: 'center' });
  y += 6;

  // Subheader
  pdf.setFontSize(11);
  pdf.setTextColor(74, 155, 217);
  pdf.text('ON DUTY LETTER', pw / 2, y, { align: 'center' });
  y += 3;
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(0.5);
  pdf.line(pw / 2 - 22, y, pw / 2 + 22, y);
  y += 7;

  // === Email-style FROM / TO block ===
  const boxH = 30;
  pdf.setFillColor(15, 32, 64);
  pdf.roundedRect(20, y, pw - 40, boxH, 2, 2, 'F');
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(20, y, pw - 40, boxH, 2, 2, 'S');

  // FROM
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 155, 217);
  pdf.text('FROM', 25, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(232, 240, 250);
  pdf.setFontSize(9);
  pdf.text('CIT Takshashila Committee', 25, y + 11);
  pdf.setFontSize(7);
  pdf.setTextColor(122, 184, 232);
  pdf.text('cittakshashila@citchennai.net', 25, y + 15);

  // TO
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 155, 217);
  pdf.text('TO', 25, y + 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(232, 240, 250);
  pdf.setFontSize(9);
  pdf.text(data.userName, 25, y + 27);
  pdf.setFontSize(7);
  pdf.setTextColor(122, 184, 232);
  pdf.text(data.email, 75, y + 27);

  y += boxH + 5;

  // Date
  pdf.setFontSize(7);
  pdf.setTextColor(122, 184, 232);
  pdf.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 25, y);
  y += 6;

  // === Subject line ===
  pdf.setFillColor(19, 45, 86);
  pdf.roundedRect(20, y, pw - 40, 9, 2, 2, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(232, 240, 250);
  pdf.text('Subject: Request for On Duty Leave – CIT Takshashila 2026', 25, y + 6);
  y += 13;

  // === Body (compact) ===
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 215, 235);

  const passLabel = data.passType.replace(/_/g, ' ').toUpperCase();
  const bodyText = `Dear Sir/Madam,\n\nThis is to certify that ${data.userName} from ${data.college} has registered for CIT Takshashila 2026, the annual techno-cultural fest of Chennai Institute of Technology.\n\nThe student has opted for a ${passLabel} and will be attending the events listed below. Kindly grant On Duty leave for the duration of the fest.`;

  const bodyLines = pdf.splitTextToSize(bodyText, pw - 50);
  for (const line of bodyLines) {
    pdf.text(line, 25, y);
    y += 4.5;
  }
  y += 3;

  // === Registration Details (inline compact grid) ===
  pdf.setFillColor(15, 32, 64);
  pdf.roundedRect(20, y, pw - 40, 7, 2, 2, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 155, 217);
  pdf.text('REGISTRATION DETAILS', 25, y + 5);
  y += 10;

  const addRow = (label: string, value: string) => {
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 155, 217);
    pdf.text(label, 27, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(232, 240, 250);
    pdf.setFontSize(8);
    pdf.text(value, 60, y);
    y += 5.5;
  };

  addRow('Name:', data.userName);
  addRow('Email:', data.email);
  addRow('Phone:', data.phone);
  addRow('College:', data.college);
  addRow('Pass Type:', passLabel);
  addRow('Amount:', `${data.calculatedAmount}`);
  if (data.selectedDays.length > 0) {
    addRow('Days:', data.selectedDays.map(formatDate).join(', '));
  }
  y += 2;

  // === Events List (compact) ===
  if (data.selectedEvents.length > 0) {
    pdf.setFillColor(15, 32, 64);
    pdf.roundedRect(20, y, pw - 40, 7, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 155, 217);
    pdf.text('REGISTERED EVENTS', 25, y + 5);
    y += 10;

    for (let i = 0; i < data.selectedEvents.length; i++) {
      const evt = data.selectedEvents[i];

      pdf.setFillColor(10, 22, 40);
      pdf.roundedRect(24, y - 3, pw - 48, 8, 1, 1, 'F');
      pdf.setDrawColor(74, 155, 217);
      pdf.setLineWidth(0.12);
      pdf.roundedRect(24, y - 3, pw - 48, 8, 1, 1, 'S');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(232, 240, 250);
      pdf.text(`${i + 1}. ${evt.name}`, 27, y + 2);

      if (evt.venue || evt.startTime) {
        const detail = [evt.venue, evt.startTime].filter(Boolean).join(' • ');
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(122, 184, 232);
        pdf.text(detail, pw - 27, y + 2, { align: 'right' });
      }
      y += 9;
    }
  }
  y += 3;

  // === Closing ===
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 215, 235);
  pdf.text('We kindly request you to grant the necessary permission.', 25, y);
  y += 6;
  pdf.text('Thanking you,', 25, y);
  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(232, 240, 250);
  pdf.text('CIT Takshashila 2026 Committee', 25, y);
  y += 4;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(122, 184, 232);
  pdf.text('cittakshashila@citchennai.net  |  Chennai Institute of Technology, Kundrathur, Chennai - 600069', 25, y);

  // Footer bar
  pdf.setFillColor(10, 22, 40);
  pdf.rect(12, ph - 18, pw - 24, 6, 'F');
  pdf.setFontSize(6);
  pdf.setTextColor(74, 155, 217);
  pdf.text('INNOVATION MEETS CULTURE  •  CIT TAKSHASHILA 2026  •  cittakshashila@citchennai.net', pw / 2, ph - 14, { align: 'center' });

  pdf.save(`OD-Letter-${data.userName.replace(/\s+/g, '-')}-Takshashila2026.pdf`);
}
