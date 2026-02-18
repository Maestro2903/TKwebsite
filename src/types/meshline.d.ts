/**
 * Type declaration for meshline components extended in @react-three/fiber.
 * Used by Lanyard.tsx (meshLineGeometry, meshLineMaterial).
 */
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Record<string, unknown>;
      meshLineMaterial: Record<string, unknown>;
    }
  }
}
