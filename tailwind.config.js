/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff9ff",
          100: "#dff2ff",
          200: "#b8e6ff",
          300: "#86d6ff",
          400: "#4ec1fb",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e"
        }
      },
      boxShadow: {
        float: "0 16px 45px -20px rgba(14, 116, 144, 0.38)",
        soft: "0 10px 30px -15px rgba(15, 23, 42, 0.22)"
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up .55s ease-out both"
      }
    }
  },
  plugins: []
};
