module.exports = {
  content: [
    "./views/*.ejs",
    "./views/*.html",
    "./public/**/*.html",
    "./public/**/*.js",
    // Add additional file types or paths as needed
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'], // Add Roboto font
      },
    },
  },
  plugins: [],
};
