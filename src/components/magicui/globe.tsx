"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef } from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

const DEFAULT_CONFIG: COBEOptions = {
  devicePixelRatio: 2,
  width: 800,
  height: 800,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.18, 0.28, 0.45],
  markerColor: [0.97, 0.45, 0.08], // Orange accent
  glowColor: [0.1, 0.25, 0.55],
  // ── Airport hub markers ──
  markers: [
    { location: [25.2048, 55.2708], size: 0.04 },  // Dubai (DXB)
    { location: [51.5074, -0.1278], size: 0.035 }, // London (LHR)
    { location: [41.0082, 28.9784], size: 0.035 }, // Istanbul (IST)
    { location: [21.4858, 39.1925], size: 0.035 }, // Jeddah (JED)
    { location: [24.8607, 67.0011], size: 0.03 },  // Karachi (KHI)
    { location: [31.5204, 74.3587], size: 0.03 },  // Lahore (LHE)
    { location: [33.6844, 73.0479], size: 0.03 },  // Islamabad (ISB)
    { location: [48.8566, 2.3522],  size: 0.03 },  // Paris (CDG)
    { location: [40.7128, -74.0060], size: 0.035 }, // New York (JFK)
    { location: [35.6762, 139.6503], size: 0.03 },  // Tokyo (HND)
  ],
  // ── Flight Route Arcs (Glowing trajectory lines connecting routes) ──
  arcs: [
    { from: [24.8607, 67.0011], to: [25.2048, 55.2708] },  // Karachi → Dubai
    { from: [31.5204, 74.3587], to: [25.2048, 55.2708] },  // Lahore → Dubai
    { from: [33.6844, 73.0479], to: [21.4858, 39.1925] },  // Islamabad → Jeddah
    { from: [25.2048, 55.2708], to: [51.5074, -0.1278] },  // Dubai → London
    { from: [25.2048, 55.2708], to: [21.4858, 39.1925] },  // Dubai → Jeddah
    { from: [51.5074, -0.1278], to: [40.7128, -74.0060] }, // London → New York
    { from: [41.0082, 28.9784], to: [48.8566, 2.3522] },   // Istanbul → Paris
    { from: [25.2048, 55.2708], to: [35.6762, 139.6503] }, // Dubai → Tokyo
  ],
  arcColor: [0.97, 0.48, 0.1], // Bright orange flight trajectory arcs
  arcWidth: 0.8,
  arcHeight: 0.28,
};

export function Globe({ className, config }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animFrameId: number;

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        ...DEFAULT_CONFIG,
        ...config,
        width: width * 2 || 800,
        height: width * 2 || 800,
      });

      const loop = () => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.004;
        }
        if (globe) {
          globe.update({
            phi: phiRef.current + pointerInteractionMovement.current,
          });
        }
        animFrameId = requestAnimationFrame(loop);
      };

      loop();
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      globe?.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[600px] flex items-center justify-center pointer-events-auto", className)}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grabbing";
          }
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 200;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 200;
          }
        }}
        className="h-full w-full cursor-grab outline-none transition-opacity duration-1000"
      />

      {/* ── Overlay Flight Route Badges with Animated Airplanes ── */}

      {/* Flight Badge 1: KHI → DXB */}
      <div className="absolute top-[18%] left-[10%] z-20 pointer-events-none animate-bounce duration-[3000ms]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-orange-500/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-orange-400 transform -rotate-45 animate-pulse" />
          <span>KHI → DXB</span>
        </div>
      </div>

      {/* Flight Badge 2: LHR → JFK */}
      <div className="absolute top-[38%] right-[8%] z-20 pointer-events-none animate-pulse duration-[2500ms]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-amber-400 transform rotate-12" />
          <span>LHR → JFK</span>
        </div>
      </div>

      {/* Flight Badge 3: ISB → JED */}
      <div className="absolute bottom-[22%] left-[14%] z-20 pointer-events-none animate-bounce duration-[4000ms]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-emerald-400 transform -rotate-12" />
          <span>ISB → JED</span>
        </div>
      </div>
    </div>
  );
}

export default Globe;
