import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-outfit)", "Outfit", "sans-serif"],
        body: ["var(--font-outfit)", "Outfit", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--primary))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          25: "color-mix(in srgb, hsl(var(--primary)) 5%, transparent)",
          50: "color-mix(in srgb, hsl(var(--primary)) 10%, transparent)",
          100: "color-mix(in srgb, hsl(var(--primary)) 20%, transparent)",
          200: "color-mix(in srgb, hsl(var(--primary)) 30%, transparent)",
          300: "color-mix(in srgb, hsl(var(--primary)) 50%, transparent)",
          400: "color-mix(in srgb, hsl(var(--primary)) 80%, transparent)",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--primary))",
          800: "hsl(var(--primary))",
          900: "hsl(var(--primary))",
          950: "hsl(var(--primary))",
        },
        "gray-dark": "#1a2231",
      },
      borderRadius: {
        sm:    "8px",
        md:    "10px",
        lg:    "10px",
        xl:    "10px",
        "2xl": "10px",
        "3xl": "10px",
        full:  "9999px",
      },
      boxShadow: {
        card: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
        "card-hover": "rgba(0, 0, 0, 0.1) 0px 10px 50px",
        glass: "0 8px 32px hsl(var(--glass-shadow) / 0.12)",
      },
      backdropBlur: {
        glass: "16px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0%)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
