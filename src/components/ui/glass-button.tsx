'use client';

import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const glassButtonVariants = cva(
  'glass-button relative isolate cursor-pointer rounded-full transition-[transform,opacity,box-shadow]',
  {
    variants: {
      size: {
        default: 'text-base font-medium',
        sm: 'text-sm font-medium',
        lg: 'text-lg font-medium',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const glassButtonTextVariants = cva(
  'glass-button-text relative block select-none tracking-tighter',
  {
    variants: {
      size: {
        default: 'px-6 py-3.5',
        sm: 'px-4 py-2',
        lg: 'px-8 py-4',
        icon: 'flex h-10 w-10 items-center justify-center',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface GlassButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
  /** When set, renders as Next.js Link instead of button */
  href?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      children,
      size,
      contentClassName,
      href,
      type = 'button',
      ...props
    },
    ref
  ) => {
    if (href) {
      return (
        <div className={cn('glass-button-wrap', className)}>
          <Link
            href={href}
            className={glassButtonVariants({ size })}
            aria-label={typeof children === 'string' ? children : undefined}
          >
            <span
              className={cn(
                glassButtonTextVariants({ size }),
                contentClassName
              )}
            >
              {children}
            </span>
          </Link>
          <div className="glass-button-shadow rounded-full" aria-hidden />
        </div>
      );
    }

    return (
      <div className={cn('glass-button-wrap', className)}>
        <button
          type={type}
          className={glassButtonVariants({ size })}
          ref={ref}
          {...props}
        >
          <span
            className={cn(glassButtonTextVariants({ size }), contentClassName)}
          >
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-full" aria-hidden />
      </div>
    );
  }
);
GlassButton.displayName = 'GlassButton';

export { GlassButton, glassButtonVariants };
