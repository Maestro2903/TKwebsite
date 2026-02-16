'use client';

import React from 'react';

interface FlipLinkProps {
  href: string;
  children: string;
  className?: string;
}

export function FlipLink({ href, children, className = '' }: FlipLinkProps) {
  const letters = children.split('');

  return (
    <a
      href={href}
      className={`group relative block overflow-hidden whitespace-nowrap text-xl font-bold uppercase tracking-wide text-white transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none sm:text-2xl ${className}`}
      style={{ lineHeight: 0.75 }}
    >
      <div className="flex">
        {letters.map((letter, i) => (
          <span
            key={`top-${i}`}
            className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-[110%]"
            style={{ transitionDelay: `${i * 25}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="absolute inset-0 flex">
        {letters.map((letter, i) => (
          <span
            key={`bottom-${i}`}
            className="inline-block translate-y-[110%] transition-transform duration-300 ease-in-out group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 25}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
    </a>
  );
}
