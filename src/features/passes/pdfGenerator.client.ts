import { jsPDF } from 'jspdf';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import type { UserProfile } from '@/lib/db/firestoreTypes';

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
            // Set canvas size
            const size = 200;
            canvas.width = size;
            canvas.height = size;

            if (addBackground) {
                // Draw dark circular background for white logo visibility
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw SVG image centered
            const imgSize = size * 0.625; // 90% of canvas size for less padding
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

/**
 * Fetch user profile data from Firestore
 */
async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

interface PassData {
    userId: string;
    passType: string;
    amount: number;
    qrCode: string;
}

/**
 * Generate and download a PDF pass with logo, QR code, and user details
 */
export async function generatePassPDF(passData: PassData): Promise<void> {
    try {
        // Fetch user profile
        const userProfile = await getUserProfile(passData.userId);
        if (!userProfile) {
            throw new Error('User profile not found');
        }

        // Convert logo SVG to PNG with dark background
        const logoDataUrl = await svgToDataURL('/tk-logo.svg', true);

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add dark border/frame
        pdf.setDrawColor(26, 26, 26);
        pdf.setLineWidth(1);
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Add logo at top center with dark background
        const logoSize = 35;
        pdf.addImage(
            logoDataUrl,
            'PNG',
            (pageWidth - logoSize) / 2,
            20,
            logoSize,
            logoSize
        );

        // Add title
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CIT TAKSHASHILA 2026', pageWidth / 2, 65, { align: 'center' });

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text('EVENT PASS', pageWidth / 2, 73, { align: 'center' });

        // Add decorative line
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.5);
        pdf.line(40, 78, pageWidth - 40, 78);

        // Add QR code
        const qrSize = 70;
        pdf.addImage(
            passData.qrCode,
            'PNG',
            (pageWidth - qrSize) / 2,
            85,
            qrSize,
            qrSize
        );

        // Add "Show this QR at entry" text
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Show this QR at entry', pageWidth / 2, 162, { align: 'center' });

        // Add pass details section
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(25, 170, pageWidth - 25, 170);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('PASS DETAILS', pageWidth / 2, 180, { align: 'center' });

        // Pass info
        const startY = 190;
        const lineHeight = 10;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        // Left column labels
        pdf.setFont('helvetica', 'bold');
        pdf.text('Pass Type:', 30, startY);
        pdf.text('Amount:', 30, startY + lineHeight);
        pdf.text('Name:', 30, startY + lineHeight * 2);
        pdf.text('Email:', 30, startY + lineHeight * 3);
        pdf.text('Phone:', 30, startY + lineHeight * 4);
        pdf.text('College:', 30, startY + lineHeight * 5);

        // Right column values
        pdf.setFont('helvetica', 'normal');
        pdf.text(passData.passType, 70, startY);
        pdf.text(`₹${passData.amount}`, 70, startY + lineHeight);
        pdf.text(userProfile.name, 70, startY + lineHeight * 2);
        pdf.text(userProfile.email || 'N/A', 70, startY + lineHeight * 3);
        pdf.text(userProfile.phone, 70, startY + lineHeight * 4);
        pdf.text(userProfile.college, 70, startY + lineHeight * 5);

        // Add footer
        pdf.setDrawColor(200, 200, 200);
        pdf.line(25, 255, pageWidth - 25, 255);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Innovation Meets Culture', pageWidth / 2, 262, { align: 'center' });
        pdf.setFontSize(8);
        pdf.text('Chennai Institute of Technology', pageWidth / 2, 268, { align: 'center' });

        // Download the PDF
        const fileName = `takshashila-pass-${passData.passType.replace(/_/g, '-')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
