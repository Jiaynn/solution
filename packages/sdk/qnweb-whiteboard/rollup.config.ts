import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const pkg = require('./package.json');

const libraryName = 'QNWhiteboard';

const buildEnvironment = process.env.NODE_ENV;

console.log(`白板 SDK 打包中，当前环境：${buildEnvironment}`);

export default {
  input: './src/index.ts',
  plugins: [
    commonjs(),
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript'),
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    uglify(),
    replace({
      preventAssignment: true,
      SDK_VERSION: JSON.stringify(pkg.version)
    }),
    nodeResolve(),
    // terser({
    //   compress: {
    //     pure_funcs: ['console.log'] // 去掉 console.log 函数
    //   }
    // })
  ],
  output: [
    {
      format: 'umd',
      file: pkg.main,
      name: libraryName
    },
    {
      format: 'esm',
      file: pkg.module,
      name: libraryName
    }
  ]
};
