"use client";

import React, { useEffect, useState, createContext, useContext } from "react";

// Convert Hex Color (#ff8a3d) to HSL Bare String ("24 100% 62%") for CSS Variables
export function hexToHslBare(hex: string): string {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return "24 100% 62%"; // fallback default orange

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

// Accepts either Hex ("#ff8a3d") or HSL bare string ("24 100% 62%") and returns bare HSL string
export function formatColorToHslBare(colorStr: string): string {
  if (!colorStr) return "24 100% 62%";
  const str = colorStr.trim();
  if (str.startsWith("#")) {
    return hexToHslBare(str);
  }
  const parts = str.split(/[\s,]+/).map((p) => p.replace("%", "").trim());
  if (parts.length >= 3 && !parts.some((p) => isNaN(parseFloat(p)))) {
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
  }
  return "24 100% 62%";
}

// Accepts Hex or HSL bare string and returns standard Hex string "#rrggbb"
export function parseColorToHex(colorStr: string): string {
  if (!colorStr) return "#ff8a3d";
  const str = colorStr.trim();
  if (str.startsWith("#")) return str;

  const parts = str.split(/[\s,]+/).map((p) => parseFloat(p.replace("%", "").trim()));
  if (parts.length >= 3 && !parts.some(isNaN)) {
    const h = parts[0];
    const s = parts[1] / 100;
    const l = parts[2] / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  return "#ff8a3d";
}

interface ThemeColorContextType {
  primaryColor: string;
  hslString: string;
  hexColor: string;
  setPrimaryColor: (color: string) => void;
  applyThemeColor: (color: string) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  primaryColor: "24 100% 62%",
  hslString: "24 100% 62%",
  hexColor: "#ff8a3d",
  setPrimaryColor: () => {},
  applyThemeColor: () => {},
});

export const useThemeColor = () => useContext(ThemeColorContext);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState("24 100% 62%");
  const [hslString, setHslString] = useState("24 100% 62%");
  const [hexColor, setHexColor] = useState("#ff8a3d");

  const applyThemeColor = (colorInput: string) => {
    if (!colorInput) return;

    const bareHsl = formatColorToHslBare(colorInput);
    const hex = parseColorToHex(colorInput);

    setPrimaryColor(colorInput);
    setHslString(bareHsl);
    setHexColor(hex);

    // Update root CSS variables dynamically
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--primary", bareHsl);
      document.documentElement.style.setProperty("--ring", bareHsl);
      document.documentElement.style.setProperty("--sidebar-primary", bareHsl);
      document.documentElement.style.setProperty("--sidebar-ring", bareHsl);
      document.documentElement.style.setProperty("--brand-hex", hex);

      // Dispatch custom event so DynamicFavicon and active tabs update live
      window.dispatchEvent(
        new CustomEvent("theme-color-change", {
          detail: { hsl: bareHsl, hex: hex, original: colorInput },
        })
      );
    }
  };

  useEffect(() => {
    // 1. Check localStorage for 0ms instant display
    try {
      const savedColor = localStorage.getItem("site_theme_primary_color");
      if (savedColor) {
        applyThemeColor(savedColor);
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Fetch ground truth theme color from Database
    async function loadThemeFromDb() {
      try {
        const res = await fetch("/api/admin/cms/settings");
        const json = await res.json();
        if (json?.success && json?.settings?.themePrimaryColor) {
          applyThemeColor(json.settings.themePrimaryColor);
          localStorage.setItem("site_theme_primary_color", json.settings.themePrimaryColor);
        }
      } catch (err) {
        console.error("Failed to load theme color from DB:", err);
      }
    }

    loadThemeFromDb();
  }, []);

  return (
    <ThemeColorContext.Provider
      value={{
        primaryColor,
        hslString,
        hexColor,
        setPrimaryColor,
        applyThemeColor,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}
