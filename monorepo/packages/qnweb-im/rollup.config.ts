import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

const pkg = require('./package.json');

const buildEnvironment = process.env.NODE_ENV;

console.log('buildEnvironment', buildEnvironment);

const isProd = buildEnvironment === 'prod';

const sourcemap = !isProd;

const outputLibraryName = 'QNIM';

const mapEnvironment = {
	dev: {
		output: []
	},
	staging: {
		output: [
			{
				format: 'umd',
				file: `preRelease/${pkg.version}/${pkg.name}.umd.js`,
				name: outputLibraryName,
				sourcemap
			},
			{
				format: 'esm',
				file: `preRelease/${pkg.version}/${pkg.name}.esm.js`,
				name: outputLibraryName,
				sourcemap
			}
		]
	},
	prod: {
		output: [
			{
				format: 'umd',
				file: `release/${pkg.version}/${pkg.name}.umd.js`,
				name: outputLibraryName,
				sourcemap
			},
			{
				format: 'esm',
				file: `release/${pkg.version}/${pkg.name}.esm.js`,
				name: outputLibraryName,
				sourcemap
			}
		]
	}
};

export default {
	input: 'src/index.ts',
	output: [
		{
			file: pkg.main,
			name: outputLibraryName,
			format: 'umd',
			sourcemap
		},
		{
			file: pkg.module,
			format: 'esm',
			sourcemap,
			name: outputLibraryName
		},
		...mapEnvironment[buildEnvironment || 'dev'].output
	],
	external: [],
	watch: {
		include: 'src/**'
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
		uglify(),
		isProd &&
			terser({
				compress: {
					pure_funcs: ['console.log'] // remove console.log
				}
			}),
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled'
		})
	]
};
