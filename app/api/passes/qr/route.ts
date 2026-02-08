import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import { createQRPayload } from '@/features/passes/qrService';

/**
 * GET /api/passes/qr?passId=xxx
 * Dynamically generates a QR code for a given pass
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const passId = searchParams.get('passId');

        if (!passId) {
            return NextResponse.json({ error: 'Missing passId' }, { status: 400 });
        }

        const db = getAdminFirestore();
        const passDoc = await db.collection('passes').doc(passId).get();

        if (!passDoc.exists) {
            return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
        }

        const passData = passDoc.data();

        // Generate QR code dynamically
        const qrData = createQRPayload(
            passId,
            passData?.userId as string,
            passData?.passType as string
        );

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return NextResponse.json({
            success: true,
            passId,
            qrCode: qrCodeDataUrl,
            passType: passData?.passType,
            userId: passData?.userId,
            status: passData?.status,
        });
    } catch (error: unknown) {
        console.error('Generate QR error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/passes/qr
 * Generates a test QR code with custom data (for testing only)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { passId, userId, passType } = body;

        if (!passId || !userId || !passType) {
            return NextResponse.json(
                { error: 'Missing required fields: passId, userId, passType' },
                { status: 400 }
            );
        }

        // Generate test QR code dynamically
        const qrData = createQRPayload(passId, userId, passType);

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return NextResponse.json({
            success: true,
            passId,
            userId,
            passType,
            qrCode: qrCodeDataUrl,
            qrData: JSON.parse(qrData),
        });
    } catch (error: unknown) {
        console.error('Generate test QR error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}
