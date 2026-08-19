import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages project site uses /fiori-awb/; Vercel serves from /. */
function productionBase(): string {
  if (
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    Boolean(process.env.VERCEL_ENV)
  ) {
    return '/'
  }
  return '/fiori-awb/'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? productionBase() : '/',
  plugins: [react()],
}))
