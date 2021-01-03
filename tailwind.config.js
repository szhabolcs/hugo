module.exports = {
  purge: [
    './public/**/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors:{
        background: "#FF979E",
        primary: "#162A40",
        secondary: "#FFFFFF"
      },
      fontFamily:{
        header: ["Pacifico","cursive"],
        body: ["Cabin", "sans-serif"]
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
