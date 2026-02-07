import React from 'react';

const AbstractWave: React.FC = () => {
    return (
        <svg viewBox="0 0 100 50" className="w-full h-full text-neutral-600 fill-none stroke-current">
            {/* Sharp aggressive lines like the reference */}
            <path d="M0,25 Q20,0 40,25 T80,25" strokeWidth="0.5" className="opacity-50" />
            <path d="M10,50 L30,10 L40,40 L60,0 L80,50" strokeWidth="1" className="text-neutral-400" />
            <path d="M0,40 C20,40 20,10 50,10 S80,40 100,40" strokeWidth="0.5" className="opacity-30" />

            {/* Tech Circles */}
            <circle cx="80" cy="15" r="5" strokeWidth="1" className="text-neutral-500" />
            <circle cx="20" cy="35" r="3" strokeWidth="0.5" />

            {/* Grid accents */}
            <line x1="90" y1="0" x2="90" y2="50" strokeWidth="0.2" strokeDasharray="2 2" />
            <line x1="10" y1="0" x2="10" y2="50" strokeWidth="0.2" strokeDasharray="2 2" />
        </svg>
    );
};

export default AbstractWave;
