/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// Assets served from /public/assets/lanyard/
const cardGLB = '/assets/lanyard/card.glb';
const lanyardTexture = '/assets/lanyard/lanyard.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  /** Data-URL or URL of the QR code image to render on the card face */
  qrCode?: string | null;
  /** User's display name rendered on the card */
  userName?: string;
  /** User's college rendered on the card */
  college?: string;
  /** Pass type label rendered on the card */
  passType?: string;
}

// ── roundRect polyfill for older browsers ──
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Generates the card-face artwork as a PNG data-URL.
 * Runs entirely in normal DOM context (outside R3F Canvas).
 */
function generateCardFaceDataUrl(
  qrCode: string,
  userName?: string,
  college?: string,
  passType?: string
): Promise<string> {
  return new Promise((resolve) => {
    // ── Texture dimensions (power-of-2 for GPU) ──
    const TEX = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = TEX;
    canvas.height = TEX;
    const ctx = canvas.getContext('2d')!;

    // ── card.glb UV mapping ──
    // Front face UVs: U [0.011, 0.489], V [0.0105, 0.748]
    // So the front face occupies the LEFT HALF, top 75% of the texture.
    const FX = Math.round(0.011 * TEX);   // ~11
    const FY = Math.round(0.0105 * TEX);  // ~11
    const FW = Math.round((0.489 - 0.011) * TEX); // ~490
    const FH = Math.round((0.748 - 0.0105) * TEX); // ~755
    const CX = FX + FW / 2; // center X of front face

    const drawAll = (qrImg?: HTMLImageElement, logoImg?: HTMLImageElement) => {
      // Fill entire texture black
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, TEX, TEX);

      // ── Front face background ──
      const bgGrad = ctx.createLinearGradient(FX, FY, FX, FY + FH);
      bgGrad.addColorStop(0, '#111111');
      bgGrad.addColorStop(0.5, '#0a0a0a');
      bgGrad.addColorStop(1, '#111111');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(FX, FY, FW, FH);

      // Top accent bar
      const accentGrad = ctx.createLinearGradient(FX, 0, FX + FW, 0);
      accentGrad.addColorStop(0, 'rgba(0,0,0,0)');
      accentGrad.addColorStop(0.3, '#3b82f6');
      accentGrad.addColorStop(0.5, '#8b5cf6');
      accentGrad.addColorStop(0.7, '#3b82f6');
      accentGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = accentGrad;
      ctx.fillRect(FX, FY, FW, 6);

      // ── Hole punch ──
      ctx.beginPath();
      ctx.arc(CX, FY + 35, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── TK Logo (above the header, replaces generic branding) ──
      if (logoImg) {
        const logoSize = 50;
        const logoX = CX - logoSize / 2;
        const logoY = FY + 50;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      // ── Header text: TAKSHASHILA ──
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '700 22px sans-serif';
      ctx.fillText('T A K S H A S H I L A', CX, FY + 115);

      // Year
      const yearGrad = ctx.createLinearGradient(CX - 60, 0, CX + 60, 0);
      yearGrad.addColorStop(0, '#60a5fa');
      yearGrad.addColorStop(1, '#a78bfa');
      ctx.fillStyle = yearGrad;
      ctx.font = '800 42px sans-serif';
      ctx.fillText('2026', CX, FY + 165);

      // ── Divider ──
      const divGrad = ctx.createLinearGradient(FX + FW * 0.15, 0, FX + FW * 0.85, 0);
      divGrad.addColorStop(0, 'rgba(0,0,0,0)');
      divGrad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      divGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = divGrad;
      ctx.fillRect(FX + FW * 0.15, FY + 185, FW * 0.7, 1);

      // ── QR Code ──
      const qrSize = Math.round(FW * 0.55);
      const qrX = CX - qrSize / 2;
      const qrY = FY + 210;
      const pad = 16;

      // White QR background
      ctx.fillStyle = '#ffffff';
      drawRoundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 14);
      ctx.fill();

      if (qrImg) {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      // ── Decorative corner brackets around QR ──
      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 2;
      const bLen = 22;
      const bOff = 8;
      // top-left
      ctx.beginPath();
      ctx.moveTo(qrX - pad - bOff, qrY - pad - bOff + bLen);
      ctx.lineTo(qrX - pad - bOff, qrY - pad - bOff);
      ctx.lineTo(qrX - pad - bOff + bLen, qrY - pad - bOff);
      ctx.stroke();
      // top-right
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + pad + bOff - bLen, qrY - pad - bOff);
      ctx.lineTo(qrX + qrSize + pad + bOff, qrY - pad - bOff);
      ctx.lineTo(qrX + qrSize + pad + bOff, qrY - pad - bOff + bLen);
      ctx.stroke();
      // bottom-left
      ctx.beginPath();
      ctx.moveTo(qrX - pad - bOff, qrY + qrSize + pad + bOff - bLen);
      ctx.lineTo(qrX - pad - bOff, qrY + qrSize + pad + bOff);
      ctx.lineTo(qrX - pad - bOff + bLen, qrY + qrSize + pad + bOff);
      ctx.stroke();
      // bottom-right
      ctx.beginPath();
      ctx.moveTo(qrX + qrSize + pad + bOff - bLen, qrY + qrSize + pad + bOff);
      ctx.lineTo(qrX + qrSize + pad + bOff, qrY + qrSize + pad + bOff);
      ctx.lineTo(qrX + qrSize + pad + bOff, qrY + qrSize + pad + bOff - bLen);
      ctx.stroke();

      // ── Instruction text ──
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '500 14px sans-serif';
      ctx.fillText('Show this QR code at entry', CX, qrY + qrSize + pad + bOff + 35);

      // ── User name ──
      const infoY = qrY + qrSize + pad + bOff + 75;
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px sans-serif';
      const displayName = (userName || 'ATTENDEE').toUpperCase();
      let nameText = displayName;
      const maxTextW = FW - 40;
      if (ctx.measureText(nameText).width > maxTextW) {
        while (ctx.measureText(nameText + '\u2026').width > maxTextW && nameText.length > 0) {
          nameText = nameText.slice(0, -1);
        }
        nameText += '\u2026';
      }
      ctx.fillText(nameText, CX, infoY);

      // ── College ──
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '600 14px sans-serif';
      const collegeText = (college || '').toUpperCase();
      let colText = collegeText;
      if (ctx.measureText(colText).width > maxTextW) {
        while (ctx.measureText(colText + '\u2026').width > maxTextW && colText.length > 0) {
          colText = colText.slice(0, -1);
        }
        colText += '\u2026';
      }
      ctx.fillText(colText, CX, infoY + 28);

      // ── Pass type badge ──
      if (passType) {
        const badgeY = infoY + 65;
        const badgeText = passType.toUpperCase();
        ctx.font = '700 13px sans-serif';
        const badgeW = ctx.measureText(badgeText).width + 40;
        const badgeH = 32;
        const badgeX = CX - badgeW / 2;

        ctx.fillStyle = 'rgba(59,130,246,0.12)';
        drawRoundRect(ctx, badgeX, badgeY - badgeH / 2 - 4, badgeW, badgeH, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(165,180,252,0.9)';
        ctx.fillText(badgeText, CX, badgeY + 3);
      }

      // ── Bottom barcode decoration ──
      const barcodeY = FY + FH - 30;
      for (let i = 0; i < 40; i++) {
        const x = CX - 80 + i * 4;
        const h = 6 + Math.random() * 14;
        ctx.fillStyle = `rgba(255,255,255,${(0.12 + Math.random() * 0.2).toFixed(2)})`;
        ctx.fillRect(x, barcodeY - h, 2, h);
      }

      // ── Scanline overlay (front face only) ──
      for (let y = FY; y < FY + FH; y += 4) {
        ctx.fillStyle = 'rgba(255,255,255,0.008)';
        ctx.fillRect(FX, y, FW, 2);
      }

      resolve(canvas.toDataURL('image/png'));
    };

    // Pre-load both QR image and logo image, then draw
    let qrImg: HTMLImageElement | undefined;
    let logoImg: HTMLImageElement | undefined;
    let loaded = 0;
    const totalToLoad = 2;

    const onAssetReady = () => {
      loaded++;
      if (loaded < totalToLoad) return;
      drawAll(qrImg, logoImg);
    };

    // Load QR
    const qi = new Image();
    qi.crossOrigin = 'anonymous';
    qi.onload = () => { qrImg = qi; onAssetReady(); };
    qi.onerror = () => { onAssetReady(); };
    qi.src = qrCode;

    // Load TK logo
    const li = new Image();
    li.crossOrigin = 'anonymous';
    li.onload = () => { logoImg = li; onAssetReady(); };
    li.onerror = () => { onAssetReady(); };
    li.src = '/assets/images/tk-logo.webp';
  });
}

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  qrCode,
  userName,
  college,
  passType,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [cardFaceUrl, setCardFaceUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate card-face image as a data-URL (runs in normal DOM, outside Canvas)
  useEffect(() => {
    if (!qrCode) {
      setCardFaceUrl(null);
      return;
    }
    let cancelled = false;
    generateCardFaceDataUrl(qrCode, userName, college, passType).then((url) => {
      if (!cancelled) setCardFaceUrl(url);
    });
    return () => { cancelled = true; };
  }, [qrCode, userName, college, passType]);

  // Prevent unrecoverable WebGL context loss
  const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault(); // tells the browser we want to restore
      console.warn('[Lanyard] WebGL context lost — waiting for restore');
    };
    const onRestored = () => {
      console.info('[Lanyard] WebGL context restored');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
  };

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={handleCreated}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} cardFaceUrl={cardFaceUrl} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  cardFaceUrl?: string | null;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, cardFaceUrl }: BandProps) {
  // Load the custom card-face texture from a data-URL (safe inside R3F)
  const [cardTex, setCardTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!cardFaceUrl) {
      setCardTex(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const tex = new THREE.Texture(img);
      tex.flipY = false;       // GLTF UV convention — card.glb expects no flip
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setCardTex((prev) => {
        // Dispose previous only AFTER the new one is ready
        if (prev) prev.dispose();
        return tex;
      });
    };
    img.src = cardFaceUrl;
    return () => { cancelled = true; };
  }, [cardFaceUrl]);

  // Clean up drei caches on unmount so remounts get fresh GPU resources
  useEffect(() => {
    return () => {
      useGLTF.clear(cardGLB);
    };
  }, []);

  // Using "any" for refs since the exact types depend on Rapier's internals
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  // Persistent temp vectors — allocated once, reused every frame
  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;

  const segmentProps: any = {
    type: 'dynamic' as RigidBodyProps['type'],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture(lanyardTexture);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardTex ?? materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={cardTex ? 0.5 : 0.9}
                metalness={cardTex ? 0.1 : 0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
