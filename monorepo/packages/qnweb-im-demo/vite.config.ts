import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

const packageJson = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      '/v1': 'https://im-test.qiniuapi.com'
    }
  },
  base: './',
  define: {
    __VERSION__: JSON.stringify(packageJson.version)
  }
});
