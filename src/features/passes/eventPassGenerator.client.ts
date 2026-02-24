import { jsPDF } from 'jspdf';

/**
 * Convert SVG to a high-res PNG data URL (transparent background).
 */
async function svgToDataURL(svgPath: string): Promise<string> {
  const response = await fetch(svgPath);
  const svgText = await response.text();

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No canvas context')); return; }

    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const size = 400; // high-res for crisp PDF rendering
      canvas.width = size;
      canvas.height = size;
      // Transparent background — blends with whatever PDF colour is underneath
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

interface EventPassPDFData {
  userName: string;
  email: string;
  phone: string;
  college: string;
  passType: string;
  amount: number;
  qrCode: string;
  selectedDays: string[];
  selectedEvents: Array<{ id: string; name: string; venue?: string; startTime?: string; endTime?: string }>;
  teamName?: string;
  members?: Array<{ name: string; isLeader?: boolean }>;
}

/**
 * Draw blue gradient background
 */
function drawGradientBg(pdf: jsPDF, w: number, h: number) {
  const steps = 60;
  const bh = h / steps;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    pdf.setFillColor(
      Math.round(10 + ratio * 9),
      Math.round(22 + ratio * 23),
      Math.round(40 + ratio * 46)
    );
    pdf.rect(0, i * bh, w, bh + 0.5, 'F');
  }
}

/**
 * Draw decorative frame with corner accents
 */
function drawFrame(pdf: jsPDF, w: number, h: number) {
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(0.8);
  pdf.rect(12, 12, w - 24, h - 24);
  pdf.setDrawColor(19, 45, 86);
  pdf.setLineWidth(0.3);
  pdf.rect(14, 14, w - 28, h - 28);

  // Corner accents
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(1.2);
  pdf.line(12, 22, 12, 12); pdf.line(12, 12, 22, 12);
  pdf.line(w - 22, 12, w - 12, 12); pdf.line(w - 12, 12, w - 12, 22);
  pdf.line(12, h - 22, 12, h - 12); pdf.line(12, h - 12, 22, h - 12);
  pdf.line(w - 22, h - 12, w - 12, h - 12); pdf.line(w - 12, h - 22, w - 12, h - 12);
}

function newPage(pdf: jsPDF, w: number, h: number) {
  pdf.addPage();
  drawGradientBg(pdf, w, h);
  drawFrame(pdf, w, h);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

/**
 * Generate and download an event pass PDF with QR code + event details.
 * Blue gradient template matching the OD letter.
 */
export async function generateEventPassPDF(data: EventPassPDFData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  drawGradientBg(pdf, pw, ph);
  drawFrame(pdf, pw, ph);

  // Logo — centred horizontally, 24 mm square
  try {
    const logoDataUrl = await svgToDataURL('/tk-logo.svg');
    const logoSize = 24;
    pdf.addImage(logoDataUrl, 'PNG', (pw - logoSize) / 2, 20, logoSize, logoSize);
  } catch { /* skip */ }

  let y = 48;

  // Title
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(232, 240, 250);
  pdf.text('CIT TAKSHASHILA 2026', pw / 2, y, { align: 'center' });
  y += 8;
  pdf.setFontSize(13);
  pdf.setTextColor(74, 155, 217);
  pdf.text('EVENT PASS', pw / 2, y, { align: 'center' });
  y += 3;
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(0.5);
  pdf.line(pw / 2 - 25, y, pw / 2 + 25, y);
  y += 8;

  // === QR Code Box ===
  const qrBoxW = 62;
  const qrBoxH = 68;
  const qrBoxX = (pw - qrBoxW) / 2;

  // Background for QR area
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrBoxX, y, qrBoxW, qrBoxH, 3, 3, 'F');

  // QR code
  const qrSize = 52;
  pdf.addImage(data.qrCode, 'PNG', (pw - qrSize) / 2, y + 3, qrSize, qrSize);

  // "Scan at entry" label
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(10, 22, 40);
  pdf.text('SCAN AT ENTRY', pw / 2, y + qrBoxH - 5, { align: 'center' });

  // Blue border on QR box
  pdf.setDrawColor(74, 155, 217);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(qrBoxX, y, qrBoxW, qrBoxH, 3, 3, 'S');

  y += qrBoxH + 8;

  // === Attendee Details ===
  pdf.setFillColor(15, 32, 64);
  pdf.roundedRect(20, y, pw - 40, 8, 2, 2, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 155, 217);
  pdf.text('ATTENDEE DETAILS', 26, y + 5.5);
  y += 13;

  const addRow = (label: string, value: string) => {
    if (y > 268) { newPage(pdf, pw, ph); y = 25; }
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 155, 217);
    pdf.text(label, 28, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(232, 240, 250);
    pdf.setFontSize(9);
    pdf.text(value, 68, y);
    y += 6.5;
  };

  addRow('Name:', data.userName);
  addRow('Email:', data.email);
  addRow('Phone:', data.phone);
  addRow('College:', data.college);
  addRow('Pass Type:', data.passType.replace(/_/g, ' ').toUpperCase());
  addRow('Amount Paid:', `${data.amount}`);

  if (data.selectedDays.length > 0) {
    addRow('Days:', data.selectedDays.map(formatDate).join(', '));
  }

  // Team details
  if (data.teamName) {
    addRow('Team:', data.teamName);
  }
  if (data.members && data.members.length > 0) {
    addRow('Members:', data.members.map((m, i) => `${i + 1}. ${m.name}${m.isLeader ? ' (L)' : ''}`).join(', '));
  }

  y += 4;

  // === Events ===
  if (data.selectedEvents.length > 0) {
    if (y > 250) { newPage(pdf, pw, ph); y = 25; }

    pdf.setFillColor(15, 32, 64);
    pdf.roundedRect(20, y, pw - 40, 8, 2, 2, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 155, 217);
    pdf.text('REGISTERED EVENTS', 26, y + 5.5);
    y += 13;

    for (let i = 0; i < data.selectedEvents.length; i++) {
      const evt = data.selectedEvents[i];
      if (y > 264) {
        newPage(pdf, pw, ph);
        y = 25;
        pdf.setFillColor(15, 32, 64);
        pdf.roundedRect(20, y, pw - 40, 8, 2, 2, 'F');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(74, 155, 217);
        pdf.text('REGISTERED EVENTS (CONT.)', 26, y + 5.5);
        y += 13;
      }

      // Event row
      pdf.setFillColor(10, 22, 40);
      pdf.roundedRect(24, y - 3.5, pw - 48, 11, 1, 1, 'F');
      pdf.setDrawColor(74, 155, 217);
      pdf.setLineWidth(0.15);
      pdf.roundedRect(24, y - 3.5, pw - 48, 11, 1, 1, 'S');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(232, 240, 250);
      pdf.text(`${i + 1}. ${evt.name}`, 28, y + 3);

      if (evt.venue || evt.startTime) {
        const detail = [evt.venue, evt.startTime].filter(Boolean).join(' • ');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(122, 184, 232);
        pdf.text(detail, pw - 28, y + 3, { align: 'right' });
      }
      y += 13;
    }
  }

  // Footer
  pdf.setFillColor(10, 22, 40);
  pdf.rect(12, ph - 18, pw - 24, 6, 'F');
  pdf.setFontSize(6);
  pdf.setTextColor(74, 155, 217);
  pdf.text('INNOVATION MEETS CULTURE  •  CIT TAKSHASHILA 2026  •  SHOW QR AT ENTRY', pw / 2, ph - 14, { align: 'center' });

  pdf.save(`Event-Pass-${data.userName.replace(/\s+/g, '-')}-Takshashila2026.pdf`);
}
