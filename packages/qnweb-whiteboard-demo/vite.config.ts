import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

const pkg = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  console.log('当前环境: ', process.env.VITE_NODE_ENV);

  return {
    plugins: [react()],
    base: './',
    build: {
      rollupOptions: {
        output: [
          { dir: `dist/${pkg.version}` },
          { dir: 'dist' }
        ]
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    define: {
      mainVersion: JSON.stringify(pkg.version)
    }
  };
});
