import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: `dist/${pkg.version}`,
  }
});
