import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import * as path from 'path';

const packageJson = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  // @ts-ignore
  plugins: [reactRefresh()],
  define: {
    __VERSION__: JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
});
