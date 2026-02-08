import React from 'react';
import Image from 'next/image';

interface Font1TextProps {
    text: string;
    className?: string;
    height?: number; // Height in pixels
}

export default function Font1Text({ text, className = '', height = 60 }: Font1TextProps) {
    // Map characters to image paths
    // Images are in /assets/font1/ and named A1.png, B1.png, etc.
    const getCharImage = (char: string) => {
        const uppercaseChar = char.toUpperCase();
        if (uppercaseChar >= 'A' && uppercaseChar <= 'Z') {
            return `/assets/font1/${uppercaseChar}1.png`;
        }
        return null;
    };

    return (
        <div className={`flex flex-wrap justify-center items-center gap-1 ${className}`} aria-label={text}>
            {text.split('').map((char, index) => {
                const imageSrc = getCharImage(char);

                if (imageSrc) {
                    // Need to determine aspect ratio or just let it be auto width with fixed height?
                    // Since we don't know exact dimensions of each letter, we can use h-full and w-auto if the parent has height.
                    // Or use next/image with height and width 'auto' (which is tricky).
                    // Let's use standard img tag for simplicity with these assets if NextImage is too strict on dimensions, 
                    // BUT we should use Next/Image for performance if possible. 
                    // Given I don't have dimensions, I'll use standard <img> with loading="lazy" or height constrained.
                    // Actually, for consistency and performance, let's try to use Next/Image but we might need width.
                    // Let's stick to <img> for variable width assets where we want fixed height, unless we know aspect ratios.

                    return (
                        <img
                            key={`${char}-${index}`}
                            src={imageSrc}
                            alt={char}
                            style={{ height: `${height}px`, width: 'auto' }}
                            className="select-none pointer-events-none"
                        />
                    );
                } else if (char === ' ') {
                    return <span key={`space-${index}`} style={{ width: `${height * 0.4}px` }} />;
                } else {
                    // Check if it's a number 0-9 
                    // Are there numbers? The file listing showed A1-Z1. No numbers found.
                    // So just render the char as text for symbols/numbers
                    return (
                        <span key={`char-${index}`} className="text-white font-bold" style={{ fontSize: `${height}px`, lineHeight: 1 }}>
                            {char}
                        </span>
                    );
                }
            })}
        </div>
    );
}
