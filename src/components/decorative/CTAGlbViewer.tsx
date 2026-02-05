'use client';

import React, { useRef, useEffect, useState } from 'react';

const GLB_URL = '/assets/TK-logo.glb';

export default function CTAGlbViewer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mountedRef = useRef(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationId: number;
        let renderer: import('three').WebGLRenderer;
        let scene: import('three').Scene;
        let camera: import('three').PerspectiveCamera;
        let model: import('three').Group | null = null;

        const init = async () => {
            const THREE = await import('three');
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
            camera.position.set(0, 0, 4);
            camera.lookAt(0, 0, 0);

            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambient);
            const dir = new THREE.DirectionalLight(0xffffff, 0.8);
            dir.position.set(2, 2, 2);
            scene.add(dir);

            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;

            const loader = new GLTFLoader();
            loader.load(
                GLB_URL,
                (gltf) => {
                    model = gltf.scene;

                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());

                    model.position.sub(center);
                    model.position.x = 0;
                    model.position.z = 0;
                    model.position.y = -center.y;

                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2.2 / maxDim;
                    model.scale.setScalar(scale);

                    scene.add(model);
                },
                undefined,
                (e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load model')
            );

            const onResize = () => {
                if (!canvas.parentElement) return;
                const w = canvas.parentElement.clientWidth;
                const h = canvas.parentElement.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            };
            window.addEventListener('resize', onResize);

            const tick = () => {
                if (!mountedRef.current) return;
                animationId = requestAnimationFrame(tick);
                if (model) {
                    model.rotation.y += 0.004;
                }
                renderer.render(scene, camera);
            };
            tick();

            return () => {
                window.removeEventListener('resize', onResize);
                cancelAnimationFrame(animationId);
                renderer.dispose();
            };
        };

        let cleanup: (() => void) | undefined;
        init().then((fn) => {
            if (mountedRef.current) cleanup = fn;
            else fn?.();
        });
        return () => {
            mountedRef.current = false;
            cleanup?.();
        };
    }, []);

    if (error) {
        return (
            <div className="_3d_absolute hide-mobile" style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Failed to load 3D model
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className="_3d_absolute hide-mobile"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-hidden
        />
    );
}
