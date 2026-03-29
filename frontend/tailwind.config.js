export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Named palette
        cream:         "#F5F0E8",
        sand:          "#EDE4D8",
        rose:          "#E8C4C4",
        terracotta:    "#C4856A",
        sage:          "#B5CFC0",
        "forest-sage": "#6E9E87",
        lavender:      "#C9C4E8",
        espresso:      "#2C2420",

        // Semantic tokens (used throughout components)
        brand:         "#C4856A",   // terracotta — primary CTA
        gold:          "#C4856A",   // terracotta — accent bars/badges
        "brand-bg":    "#F5F0E8",   // cream — page background
        "brand-dark":  "#2C2420",   // espresso — sidebar
        "brand-tint":  "#EDE4D8",   // sand — selected state bg
        border:        "#DDD5C8",   // warm light border

        text: {
          main:  "#2C2420",   // espresso
          muted: "#9B8578",   // warm mid-tone
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "serif"],
        serif:   ["DM Serif Display", "serif"],
        sans:    ["DM Sans", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        phone: "40px",
      },
    },
  },
  plugins: [],
}
