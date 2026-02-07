'use client';

import { useEffect, useRef } from 'react';

export default function FabricGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            if (!ctx || !canvas) return;

            ctx.fillStyle = '#0a0a0a'; // Dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#333'; // Grid color
            ctx.lineWidth = 1;

            const gridSize = 40;
            const cols = Math.ceil(canvas.width / gridSize);
            const rows = Math.ceil(canvas.height / gridSize);

            time += 0.01;


            // Optimization: Draw grid by connecting vertices
            const vertices: { x: number, y: number }[][] = [];

            for (let i = 0; i <= cols; i++) {
                vertices[i] = [];
                for (let j = 0; j <= rows; j++) {
                    const xBase = i * gridSize;
                    const yBase = j * gridSize;

                    // Wave function
                    const noise = Math.sin(xBase * 0.005 + time) * Math.cos(yBase * 0.005 + time) * 15;

                    vertices[i][j] = {
                        x: xBase + noise,
                        y: yBase + noise
                    };
                }
            }

            ctx.beginPath();
            // Vertical lines
            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const p1 = vertices[i][j];
                    const p2 = vertices[i][j + 1];
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }

            // Horizontal lines
            for (let j = 0; j <= rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const p1 = vertices[i][j];
                    const p2 = vertices[i + 1][j];
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }

            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-black"
        />
    );
}
