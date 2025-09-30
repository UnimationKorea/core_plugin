import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        builder: 'src/builder/index.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})