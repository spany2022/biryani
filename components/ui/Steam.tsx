import { cn } from "@/lib/utils";

type Plume = { x: string; w: number; h: number; dur: number; delay: number; sway: number; peak: number };

const presets: Record<"soft" | "rich", Plume[]> = {
  soft: [
    { x: "42%", w: 110, h: 220, dur: 7, delay: 0, sway: 16, peak: 0.45 },
    { x: "56%", w: 130, h: 260, dur: 8.5, delay: 2.4, sway: -20, peak: 0.4 },
    { x: "49%", w: 90, h: 200, dur: 6.5, delay: 4.6, sway: 12, peak: 0.35 },
  ],
  rich: [
    { x: "38%", w: 140, h: 280, dur: 7.5, delay: 0, sway: 22, peak: 0.6 },
    { x: "52%", w: 170, h: 320, dur: 9, delay: 1.6, sway: -26, peak: 0.55 },
    { x: "62%", w: 120, h: 260, dur: 7, delay: 3.2, sway: 18, peak: 0.5 },
    { x: "46%", w: 110, h: 240, dur: 6.5, delay: 4.8, sway: -14, peak: 0.5 },
    { x: "57%", w: 150, h: 300, dur: 8, delay: 6, sway: 20, peak: 0.45 },
  ],
};

/**
 * Soft, blurred steam plumes rising from a point. Pure CSS — no particles, no JS.
 * Freezes to a faint static haze for reduced motion.
 */
export default function Steam({ className, intensity = "soft" }: { className?: string; intensity?: "soft" | "rich" }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      {presets[intensity].map((p, i) => (
        <span
          key={i}
          className="steam-plume"
          style={
            {
              "--x": p.x,
              "--w": `${p.w}px`,
              "--h": `${p.h}px`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--sway": `${p.sway}px`,
              "--peak": p.peak,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
