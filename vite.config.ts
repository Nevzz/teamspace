import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your repo name for GitHub Pages, e.g. '/teamspace/'
// Using '/' works for a custom domain or a user/organization root page.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/teamspace/',
})
