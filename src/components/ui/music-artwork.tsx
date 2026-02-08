"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Component-specific styles
const componentStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface MusicArtworkProps {
  artist: string;
  music: string;
  albumArt: string;
  isSong: boolean;
  isLoading?: boolean;
  isActive?: boolean;
}

export default function MusicArtwork({
  artist,
  music,
  albumArt,
  isSong,
  isLoading = false,
  isActive = false
}: MusicArtworkProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const vinylRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  // Calculate spin duration based on type: songs (0.75 rev/sec) vs albums (0.55 rev/sec)
  const spinDuration = isSong ? (1 / 0.75) : (1 / 0.55); // Convert rev/sec to seconds per revolution

  // Auto-play when active
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      setIsHovered(true);
    } else {
      setIsPlaying(false);
      setIsHovered(false);
    }
  }, [isActive]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause: capture current rotation
      if (vinylRef.current) {
        const computedStyle = window.getComputedStyle(vinylRef.current);
        const transform = computedStyle.transform;
        if (transform && transform !== 'none') {
          const matrix = new DOMMatrix(transform);
          const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
          setRotation(angle < 0 ? angle + 360 : angle);
        }
      }
    } else {
      // Resume: set start time for animation
      startTimeRef.current = Date.now();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const tooltipWidth = 300;
        const tooltipHeight = 60;
        const offset = 20;
        
        let x = e.clientX + offset;
        let y = e.clientY - tooltipHeight - 10;
        
        if (x + tooltipWidth > window.innerWidth) {
          x = e.clientX - tooltipWidth - offset;
        }
        
        if (y < 0) {
          y = e.clientY + offset;
        }
        
        if (y + tooltipHeight > window.innerHeight) {
          y = e.clientY - tooltipHeight - offset;
        }
        
        setMousePosition({ x, y });
      });
    };

    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="relative group">
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <style jsx>{componentStyles}</style>
      
      <div className="relative group flex items-center justify-center min-w-[500px] min-h-[500px]">
        {/* Vinyl record - behind album, on the left side, extends out */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[30%] transition-all duration-500 ease-out z-0 ${
            isHovered
              ? 'opacity-100'
              : 'opacity-0 translate-x-4'
          }`}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 0 1px rgba(255,255,255,0.15))',
          }}
        >
          <div className="relative w-[380px] h-[380px] sm:w-[460px] sm:h-[460px]">
           <div
             ref={vinylRef}
             className="w-full h-full"
             style={{
               transform: isPlaying ? undefined : `rotate(${rotation}deg)`,
               animation: isPlaying ? `spin ${spinDuration}s linear infinite` : 'none',
               animationDelay: isPlaying ? `${-rotation / (360 / spinDuration)}s` : undefined
             }}
           >
             <Image
               src="https://pngimg.com/d/vinyl_PNG95.png"
               alt="Vinyl Record"
               width={460}
               height={460}
               className="w-full h-full object-contain"
               unoptimized
             />
           </div>
         </div>
        </div>

        {/* Album artwork - in front of vinyl */}
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-3xl cursor-pointer w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] z-10"
          onClick={handlePlayPause}
        >
          <Image
            src={albumArt}
            alt={`${music} Cover`}
            width={500}
            height={500}
            className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-110 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
            }}
            unoptimized
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          )}
          
          {/* Play/Pause button */}
          <div className={`absolute bottom-4 left-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                {isPlaying ? (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white rounded"></div>
                    <div className="w-1 h-4 bg-white rounded"></div>
                  </div>
                ) : (
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                )}
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}
