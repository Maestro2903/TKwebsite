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

    // Split text into words to prevent awkward mid-word breaks on mobile
    const words = text.split(' ');

    const renderCharacter = (char: string, index: number, wordIndex: number) => {
        const imageSrc = getCharImage(char);
        const key = `word-${wordIndex}-char-${index}`;

        if (imageSrc) {
            return (
                <img
                    key={key}
                    src={imageSrc}
                    alt={char}
                    style={{ height: `${height}px`, width: 'auto' }}
                    className="select-none pointer-events-none flex-shrink-0"
                />
            );
        } else {
            return (
                <span 
                    key={key} 
                    className="text-white font-bold flex-shrink-0" 
                    style={{ fontSize: `${height}px`, lineHeight: 1 }}
                >
                    {char}
                </span>
            );
        }
    };

    return (
        <div className={`flex flex-wrap justify-center items-center gap-x-1 gap-y-2 ${className}`} aria-label={text}>
            {words.map((word, wordIndex) => (
                <div 
                    key={`word-${wordIndex}`} 
                    className="flex items-center gap-[2px] flex-shrink-0"
                >
                    {word.split('').map((char, charIndex) => 
                        renderCharacter(char, charIndex, wordIndex)
                    )}
                </div>
            ))}
        </div>
    );
}
