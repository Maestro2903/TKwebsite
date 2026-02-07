const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const sourceDir = '/Users/mtejeshx37/TKwebsite/public/images/peeps/Bust';
const outputFile = '/Users/mtejeshx37/TKwebsite/public/images/peeps/all-peeps.png';

async function createSpriteSheet() {
    // Get all peep files
    const files = fs.readdirSync(sourceDir)
        .filter(f => f.startsWith('peep-') && f.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        })
        .slice(0, 105); // 15 cols x 7 rows = 105 images

    if (files.length === 0) {
        console.error('No peep files found!');
        process.exit(1);
    }

    console.log(`Found ${files.length} peep images`);

    // Load first image to get dimensions
    const firstImg = await loadImage(path.join(sourceDir, files[0]));
    const imgWidth = firstImg.width;
    const imgHeight = firstImg.height;
    console.log(`Individual peep size: ${imgWidth}x${imgHeight}`);

    // Sprite sheet dimensions (15 cols x 7 rows)
    const cols = 15;
    const rows = 7;
    const spriteWidth = imgWidth * cols;
    const spriteHeight = imgHeight * rows;

    console.log(`Creating sprite sheet: ${spriteWidth}x${spriteHeight} (${cols} cols x ${rows} rows)`);

    // Create canvas
    const canvas = createCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext('2d');

    // Draw each peep
    for (let idx = 0; idx < Math.min(files.length, cols * rows); idx++) {
        const img = await loadImage(path.join(sourceDir, files[idx]));

        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * imgWidth;
        const y = row * imgHeight;

        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        if ((idx + 1) % 10 === 0) {
            console.log(`Processed ${idx + 1} images...`);
        }
    }

    // Save sprite sheet
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputFile, buffer);
    console.log(`Sprite sheet saved to: ${outputFile}`);
    console.log(`Total images in sprite: ${Math.min(files.length, cols * rows)}`);
}

createSpriteSheet().catch(console.error);
