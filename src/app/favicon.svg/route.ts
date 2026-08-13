import fs from "fs";
import path from "path";

function parseCssColorToHex(primaryColor: string): string {
  primaryColor = primaryColor.trim();

  // 1) Hex e.g. #465fff
  if (primaryColor.startsWith("#")) return primaryColor;

  // 2) RGB e.g. rgb(70 95 255) or rgb(70, 95, 255)
  const rgbMatch = primaryColor.match(/rgb\(\s*(\d+)[,\s]+\s*(\d+)[,\s]+\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // 3) HSL bare numbers e.g. "24 100% 62%" or "262 83% 58%"
  const parts = primaryColor.split(/[\s,]+/).map((p) => parseFloat(p.replace("%", "")));
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

  return "#ff8a3d"; // default fallback
}

export async function GET() {
  let hexColor = "#ff8a3d";

  try {
    const { prisma } = await import("@/lib/prisma");
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "public_website_cms" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (parsed?.themePrimaryColor) {
        hexColor = parseCssColorToHex(parsed.themePrimaryColor);
      }
    }
  } catch {
    try {
      const globalsPath = path.join(process.cwd(), "src", "app", "globals.css");
      const cssContent = fs.readFileSync(globalsPath, "utf-8");
      const match = cssContent.match(/--primary:\s*([^;]+);/);
      if (match && match[1]) {
        hexColor = parseCssColorToHex(match[1]);
      }
    } catch {}
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="${hexColor}"/><circle cx="18" cy="18" r="10" stroke="white" stroke-width="1.8" stroke-dasharray="4 2.5" opacity="0.5"/><path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95"/><path d="M10 18.5 Q18 10 26 18.5" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4"/></svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
