import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import * as path from 'path';

const pkg = require('./package.json');

const buildEnvironment = process.env.NODE_ENV;

const isProd = buildEnvironment === 'prod';

const sourcemap = !isProd;

const libraryName = 'qnweb-exam-sdk';

const outputName = 'QNExamSDK'

console.log(`Building ${libraryName} in environment: ${buildEnvironment}`);

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      name: outputName,
      format: 'umd',
      sourcemap
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap,
      name: outputName
    }
  ],
  external: [
    "qnweb-rtc",
    "qnweb-rtc-ai",
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        }
      ],
    }),
    replace({
      VERSION: JSON.stringify(pkg.version)
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript'),
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve(),
    uglify(),
  ]
};
