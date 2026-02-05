/**
 * Server-side SVG to PNG converter using Sharp
 * Creates a PNG with dark circular background for logo visibility
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function convertSvgToBase64Png(svgPath: string): Promise<string> {
    // Read SVG file
    const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', svgPath));

    // Convert SVG to PNG with dark circular background
    const size = 200; // Size in pixels
    const circleRadius = size / 2;

    // Create dark circle background
    const circleSvg = `
    <svg width="${size}" height="${size}">
      <circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius}" fill="#1a1a1a"/>
    </svg>
  `;

    // Convert logo SVG to PNG
    const logoPng = await sharp(svgBuffer)
        .resize(Math.floor(size * 0.625), Math.floor(size * 0.625)) // 62.5% of canvas size
        .png()
        .toBuffer();

    // Create circle background PNG
    const circlePng = await sharp(Buffer.from(circleSvg))
        .resize(size, size)
        .png()
        .toBuffer();

    // Composite logo on top of circle
    const compositePng = await sharp(circlePng)
        .composite([
            {
                input: logoPng,
                top: Math.floor(size * 0.1875), // Center vertically
                left: Math.floor(size * 0.1875), // Center horizontally
            },
        ])
        .png()
        .toBuffer();

    // Convert to base64 data URL
    const base64 = compositePng.toString('base64');
    return `data:image/png;base64,${base64}`;
}
