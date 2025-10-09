import tailwindcss from '@tailwindcss/postcss'

export default {
  plugins: [
    tailwindcss({
      // Enable or disable Lightning CSS
      optimize: false,
    }),
  ],
}