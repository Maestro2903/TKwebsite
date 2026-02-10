'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CanvasSpiralProps {
  className?: string;
}

const Y2K_IMAGES = [
  '/assets/y2k-icons/AI_generated_3D_star_icon_created_from_metallic_chrome_liquid_material_PNG-removebg-preview.png',
  '/assets/y2k-icons/CHROMESTARS-removebg-preview.png',
  '/assets/y2k-icons/Download_premium_png_of_Human_skull_png_icon_sticker__3D_rendering__transparent-removebg-preview.png',
  '/assets/y2k-icons/Holographic_Vinyl-removebg-preview.png',
  '/assets/y2k-icons/Silver_3D_Polaris-removebg-preview.png',
  '/assets/y2k-icons/_chrome_stars__Sticker_for_Sale_by_metallirakas-removebg-preview.png',
  '/assets/y2k-icons/download__2_-removebg-preview (1).png',
  '/assets/y2k-icons/download__2_-removebg-preview.png',
  '/assets/y2k-icons/download__3_-removebg-preview.png',
  '/assets/y2k-icons/pic_is_not_mine_-removebg-preview.png',
];

interface Particle {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  img: HTMLImageElement;
}

export default function CanvasSpiral({ className = '' }: CanvasSpiralProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isMountedRef.current = true;
    ctxRef.current = ctx;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/92517cc6-1bca-44ee-bc7d-aef960e370cf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `log_${Date.now()}_mount`,
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'CanvasSpiral.tsx:useEffect',
        message: 'CanvasSpiral mounted',
        data: { width: canvas.width, height: canvas.height },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // Set canvas size
    let cw = (canvas.width = window.innerWidth);
    let ch = (canvas.height = window.innerHeight);
    let radius = Math.max(cw, ch);

    // Initialize particles
    const particles: Particle[] = Array(99)
      .fill(null)
      .map((_, i) => ({
        x: 0,
        y: 0,
        scale: 0,
        rotate: 0,
        img: new Image(),
      }));

    // Load images (cycle through Y2K_IMAGES)
    particles.forEach((p, i) => {
      p.img.src = Y2K_IMAGES[i % Y2K_IMAGES.length];
    });

    particlesRef.current = particles;

    // Draw function
    const draw = () => {
      if (!isMountedRef.current || !ctxRef.current || !canvasRef.current) return;

      const ctx = ctxRef.current;
      const canvas = canvasRef.current;

      // Sort by scale for z-indexing
      particles.sort((a, b) => a.scale - b.scale);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(p.rotate);
        ctx.drawImage(
          p.img,
          p.x - (p.img.width * p.scale) / 2,
          p.y - (p.img.height * p.scale) / 2,
          p.img.width * p.scale,
          p.img.height * p.scale
        );
        ctx.resetTransform();
      });
    };

    // Create GSAP timeline
    const tl = gsap.timeline({ onUpdate: draw });

    tl.fromTo(
      particles,
      {
        x: (i) => {
          const angle = (i / particles.length) * Math.PI * 2 - Math.PI / 2;
          return Math.cos(angle * 10) * radius;
        },
        y: (i) => {
          const angle = (i / particles.length) * Math.PI * 2 - Math.PI / 2;
          return Math.sin(angle * 10) * radius;
        },
        scale: 1.1,
        rotate: 0,
      },
      {
        duration: 5,
        ease: 'sine',
        x: 0,
        y: 0,
        scale: 0,
        rotate: -3,
        stagger: { each: -0.05, repeat: -1 },
      },
      0
    ).seek(99);

    timelineRef.current = tl;

    // Resize handler
    const handleResize = () => {
      if (!isMountedRef.current || !canvasRef.current) return;
      cw = canvasRef.current.width = window.innerWidth;
      ch = canvasRef.current.height = window.innerHeight;
      radius = Math.max(cw, ch);
      if (tl && !tl.isActive()) {
        tl.invalidate();
      }
    };

    // Click handler for pause/play
    const handleClick = () => {
      if (!isMountedRef.current || !timelineRef.current) return;

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/92517cc6-1bca-44ee-bc7d-aef960e370cf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_click`,
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'CanvasSpiral.tsx:handleClick',
          message: 'CanvasSpiral click toggle',
          data: {
            timeScale: timelineRef.current.timeScale(),
            isActive: timelineRef.current.isActive(),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      gsap.to(timelineRef.current, {
        timeScale: timelineRef.current.isActive() ? 0 : 1,
      });
    };

    // Pointer enter/leave to debug cursor region
    const handlePointerEnter = (event: PointerEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/92517cc6-1bca-44ee-bc7d-aef960e370cf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_enter`,
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'CanvasSpiral.tsx:handlePointerEnter',
          message: 'Pointer entered canvas',
          data: { x: event.clientX, y: event.clientY },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    const handlePointerLeave = (event: PointerEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/92517cc6-1bca-44ee-bc7d-aef960e370cf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_leave`,
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'CanvasSpiral.tsx:handlePointerLeave',
          message: 'Pointer left canvas',
          data: { x: event.clientX, y: event.clientY },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('pointerup', handleClick);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('pointerup', handleClick);
        canvas.removeEventListener('pointerenter', handlePointerEnter);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
      }
      
      // Kill GSAP timeline
      if (tl) {
        tl.kill();
      }
      
      // Clear refs
      timelineRef.current = null;
      ctxRef.current = null;
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ cursor: 'pointer' }}
    />
  );
}
