import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(let(--border))",
        input: "hsl(let(--input))",
        ring: "hsl(let(--ring))",
        background: "hsl(let(--background))",
        foreground: "hsl(let(--foreground))",
        primary: {
          DEFAULT: "hsl(let(--primary))",
          foreground: "hsl(let(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(let(--secondary))",
          foreground: "hsl(let(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(let(--destructive))",
          foreground: "hsl(let(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(let(--muted))",
          foreground: "hsl(let(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(let(--accent))",
          foreground: "hsl(let(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(let(--popover))",
          foreground: "hsl(let(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(let(--card))",
          foreground: "hsl(let(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "let(--radius)",
        md: "calc(let(--radius) - 2px)",
        sm: "calc(let(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "let(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "let(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  extend: {
    keyframes: {
      "shine": {
        from: { backgroundPosition: '200% 0' },
        to: { backgroundPosition: '-200% 0' },
      },
    },
    animation: {
      "shine": "shine 8s ease-in-out infinite",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config