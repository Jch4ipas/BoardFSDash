/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // EPFL palette — https://inside.epfl.ch/corp-id/
        "epfl-red":       "var(--epfl-red)",
        "epfl-groseille": "var(--epfl-groseille)",
        "epfl-turquoise": "var(--epfl-turquoise)",
        "epfl-canard":    "var(--epfl-canard)",
        "epfl-montrose":  "var(--epfl-montrose)",
        "epfl-perle":     "var(--epfl-perle)",
        "epfl-vertdeau":  "var(--epfl-vertdeau)",
        "epfl-rose":      "var(--epfl-rose)",
        "epfl-acier":     "var(--epfl-acier)",
        "epfl-soufre":    "var(--epfl-soufre)",
        "epfl-carotte":   "var(--epfl-carotte)",
        "epfl-zinzolin":  "var(--epfl-zinzolin)",
        "epfl-chartreuse":"var(--epfl-chartreuse)",
        "epfl-marron":    "var(--epfl-marron)",
        "epfl-ardoise":   "var(--epfl-ardoise)",
        "epfl-taupe":     "var(--epfl-taupe)",
      },
    },
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      "light",
      {
        // EPFL backoffice theme — maps DaisyUI semantic tokens to EPFL colors
        epfl: {
          "primary":         "#FF0000",
          "primary-content": "#ffffff",
          "secondary":       "#00A79F",
          "secondary-content": "#ffffff",
          "accent":          "#4F8FCC",
          "accent-content":  "#ffffff",
          "neutral":         "#453A4C",
          "neutral-content": "#ffffff",
          "base-100":        "#ffffff",
          "base-200":        "#F8F8F8",
          "base-300":        "#E5E5E5",
          "base-content":    "#413D3A",
          "info":            "#4F8FCC",
          "info-content":    "#ffffff",
          "success":         "#00A79F",
          "success-content": "#ffffff",
          "warning":         "#EC6608",
          "warning-content": "#ffffff",
          "error":           "#B51F1F",
          "error-content":   "#ffffff",
        },
      },
    ],
  },
};
