import React from 'react';

const Barcode: React.FC = () => {
    // Generate a semi-random pattern of widths for the barcode
    const bars = [
        2, 1, 3, 1, 1, 4, 1, 2,
        2, 1, 4, 1, 1, 2, 3, 1,
        1, 2, 1, 3, 1, 2, 4, 1,
        2, 1, 1
    ];

    return (
        <div className="flex h-6 items-end gap-[1px]">
            {bars.map((width, idx) => (
                <div
                    key={idx}
                    className="bg-neutral-500"
                    style={{
                        width: `${width * 2}px`,
                        height: `${Math.random() > 0.5 ? '100%' : '80%'}`,
                        opacity: Math.random() > 0.8 ? 0.5 : 1
                    }}
                />
            ))}
        </div>
    );
};

export default Barcode;
