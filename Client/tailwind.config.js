/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'Rajdhani': ["Rajdhani","sans-serif"],
        'Shadows_Into_Light': ["Shadows Into Light","cursive"],
      },
      colors:{
        "background": "rgba(20,20,20,1)",
        'primary': 'rgba(35,35,35,1)',
        'secondary': 'rgba(64,64,64,1)',
      }
    },
  },
  plugins: [],
}

