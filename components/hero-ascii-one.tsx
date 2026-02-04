'use client';

interface HeroAsciiOneProps {
  title: string;
  subtitle?: string;
}

/**
 * Hero ASCII One – cinematic ASCII-style hero for the Registration page.
 * Black bg, monospace typography, no color violations.
 */
export function HeroAsciiOne({ title, subtitle }: HeroAsciiOneProps) {
  return (
    <div
      className="hero-ascii-one"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace',
        color: 'white',
        textAlign: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Top line accent */}
      <span
        className="hero-ascii-one__line"
        style={{
          display: 'block',
          fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          letterSpacing: '0.3em',
          opacity: 0.5,
          marginBottom: '1rem',
        }}
        aria-hidden
      >
        ─────────────────
      </span>

      <h1
        className="hero-ascii-one__title"
        style={{
          margin: 0,
          fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
          fontWeight: 600,
          letterSpacing: '0.15em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="hero-ascii-one__subtitle"
          style={{
            margin: '0.75rem 0 0',
            fontSize: 'clamp(0.75rem, 2vw, 1rem)',
            letterSpacing: '0.2em',
            opacity: 0.7,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Bottom line accent */}
      <span
        className="hero-ascii-one__line"
        style={{
          display: 'block',
          fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          letterSpacing: '0.3em',
          opacity: 0.5,
          marginTop: '1rem',
        }}
        aria-hidden
      >
        ─────────────────
      </span>
    </div>
  );
}
