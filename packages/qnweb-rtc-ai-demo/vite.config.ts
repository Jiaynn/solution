import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

const packageJson = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [reactRefresh()],
  define: {
    __VERSION__: JSON.stringify(packageJson.version)
  },
});
