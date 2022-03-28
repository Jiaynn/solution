import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import { uglify } from 'rollup-plugin-uglify'
import replace from '@rollup/plugin-replace';

const pkg = require('./package.json');

const libraryName = 'QNRTCAI'

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: 'umd',
      sourcemap: false
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: false
    },
    {
      file: `release/${pkg.version}/${pkg.name}.umd.js`,
      name: libraryName,
      format: 'umd',
      sourcemap: false
    },
    {
      file: `release/${pkg.version}/${pkg.name}.esm.js`,
      format: 'esm',
      sourcemap: false
    },
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    replace({
      preventAssignment: true,
      SDK_VERSION: JSON.stringify(pkg.version)
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
    uglify()
  ]
};