"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef } from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

// Convert HSL (0-360, 0-100%, 0-100%) to normalized RGB floats [0..1, 0..1, 0..1]
function hslToNormalizedRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(f(0) * 1000) / 1000,
    Math.round(f(8) * 1000) / 1000,
    Math.round(f(4) * 1000) / 1000,
  ];
}

// Universal parser for RGB rgb(70 95 255), Hex #465fff, or HSL 262 83% 58%
function parseCssColorToRgbFloats(colorStr: string): [number, number, number] {
  colorStr = colorStr.trim().toLowerCase();

  // 1) Check rgb(r g b) or rgb(r, g, b)
  const rgbMatch = colorStr.match(/rgb\(\s*(\d+)[,\s]+\s*(\d+)[,\s]+\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return [
      Math.round((parseInt(rgbMatch[1]) / 255) * 1000) / 1000,
      Math.round((parseInt(rgbMatch[2]) / 255) * 1000) / 1000,
      Math.round((parseInt(rgbMatch[3]) / 255) * 1000) / 1000,
    ];
  }

  // 2) Check Hex #ffffff or #fff
  if (colorStr.startsWith("#")) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return [
        Math.round(((num >> 16) / 255) * 1000) / 1000,
        Math.round((((num >> 8) & 255) / 255) * 1000) / 1000,
        Math.round(((num & 255) / 255) * 1000) / 1000,
      ];
    }
  }

  // 3) Check bare HSL numbers e.g. "262 83% 58%"
  const parts = colorStr.split(/\s+/).map((p) => parseFloat(p.replace("%", "")));
  if (parts.length >= 3 && !parts.some(isNaN)) {
    return hslToNormalizedRgb(parts[0], parts[1], parts[2]);
  }

  return [0.97, 0.48, 0.1]; // default fallback
}

const DEFAULT_CONFIG: COBEOptions = {
  devicePixelRatio: 1,
  width: 600,
  height: 600,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 8000,
  mapBrightness: 6,
  baseColor: [0.18, 0.28, 0.45],
  markerColor: [0.97, 0.45, 0.08], // Fallback default
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
  arcColor: [0.97, 0.48, 0.1], // Fallback default
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
    window.addEventListener("resize", onResize, { passive: true });
    onResize();

    // Dynamically resolve --primary color (Hex, RGB, or HSL) from document root
    let primaryRgb: [number, number, number] = [0.97, 0.48, 0.1];
    if (typeof window !== "undefined") {
      const primaryStr = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      if (primaryStr) {
        primaryRgb = parseCssColorToRgbFloats(primaryStr);
      }
    }

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animFrameId: number;

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        ...DEFAULT_CONFIG,
        markerColor: primaryRgb,
        arcColor: primaryRgb,
        ...config,
        width: (width || 400) * 1.5,
        height: (width || 400) * 1.5,
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-primary/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-primary transform -rotate-45 animate-pulse" />
          <span>KHI → DXB</span>
        </div>
      </div>

      {/* Flight Badge 2: LHR → JFK */}
      <div className="absolute top-[38%] right-[8%] z-20 pointer-events-none animate-pulse duration-[2500ms]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-primary/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-primary transform rotate-12" />
          <span>LHR → JFK</span>
        </div>
      </div>

      {/* Flight Badge 3: ISB → JED */}
      <div className="absolute bottom-[22%] left-[14%] z-20 pointer-events-none animate-bounce duration-[4000ms]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-primary/40 text-white shadow-lg text-xs font-semibold">
          <Plane className="h-3.5 w-3.5 text-primary transform -rotate-12" />
          <span>ISB → JED</span>
        </div>
      </div>
    </div>
  );
}

export default Globe;
