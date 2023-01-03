import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path';
import postcssPxToViewport from 'postcss-px-to-viewport'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [
        postcssPxToViewport({
          unitToConvert: "px",
          viewportWidth: 375,
          unitPrecision: 5,
          propList: [
            "*"
          ],
          viewportUnit: "vw",
          fontViewportUnit: "vw",
          selectorBlackList: [],
          minPixelValue: 1,
          mediaQuery: false,
          replace: true,
          exclude: /(\/|\\)(node_modules)(\/|\\)/,
        })
      ]
    }
  },
})
