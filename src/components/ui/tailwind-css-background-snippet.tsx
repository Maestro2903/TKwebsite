import { cn } from "@/lib/utils";

type GradientVariant = "purple" | "blue";

const gradientStyles: Record<GradientVariant, string> = {
  purple:
    "radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)",
  blue:
    "radial-gradient(125% 125% at 50% 10%, #000 40%, #2563eb 100%)",
};

interface RadialGradientBgProps {
  variant?: GradientVariant;
  className?: string;
}

/** Reusable radial gradient background for Hero, Footer, etc. */
export function RadialGradientBg({
  variant = "purple",
  className,
}: RadialGradientBgProps) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 h-full w-full", className)}
      style={{ background: gradientStyles[variant] }}
    />
  );
}

export const Hero = () => {
  return (
    <div className={cn("w-full relative h-screen")}>
      <div className="absolute inset-0">
        <RadialGradientBg variant="purple" className="items-center px-5 py-24" />
      </div>
    </div>
  );
};
