import type { Config } from "tailwindcss"

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(220, 91%, 56%)",
          50: "hsl(220, 91%, 97%)",
          100: "hsl(220, 91%, 94%)",
          200: "hsl(220, 91%, 87%)",
          300: "hsl(220, 91%, 76%)",
          400: "hsl(220, 91%, 66%)",
          500: "hsl(220, 91%, 56%)",
          600: "hsl(220, 91%, 46%)",
          700: "hsl(220, 91%, 36%)",
          800: "hsl(220, 91%, 26%)",
          900: "hsl(220, 91%, 16%)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(160, 84%, 39%)",
          50: "hsl(160, 84%, 97%)",
          100: "hsl(160, 84%, 94%)",
          200: "hsl(160, 84%, 87%)",
          300: "hsl(160, 84%, 76%)",
          400: "hsl(160, 84%, 56%)",
          500: "hsl(160, 84%, 39%)",
          600: "hsl(160, 84%, 29%)",
          700: "hsl(160, 84%, 19%)",
          800: "hsl(160, 84%, 14%)",
          900: "hsl(160, 84%, 9%)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        blue: {
          25: "hsl(220, 91%, 98%)",
          50: "hsl(220, 91%, 95%)",
          100: "hsl(220, 91%, 90%)",
          200: "hsl(220, 91%, 80%)",
          300: "hsl(220, 91%, 70%)",
          400: "hsl(220, 91%, 60%)",
          500: "hsl(220, 91%, 50%)",
          600: "hsl(220, 91%, 40%)",
          700: "hsl(220, 91%, 30%)",
          800: "hsl(220, 91%, 20%)",
          900: "hsl(220, 91%, 10%)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
