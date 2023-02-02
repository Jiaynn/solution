import type { Options as ExecaOptions } from 'execa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import execa from 'execa';

// https://github.com/vitejs/vite/blob/main/scripts/releaseUtils.ts#L77-L83
export async function run(
	bin: string,
	args: string[],
	opts: ExecaOptions<string> = {}
) {
	return execa(bin, args, { stdio: 'inherit', ...opts });
}

/**
 * pnpm --filter
 * @param name
 * @param command
 */
export async function pnpmFilter(name: string, command: string) {
	return run('pnpm', ['--filter', name, command]);
}

/**
 * dev
 * @param name
 */
export async function devProject(name: string) {
	return pnpmFilter(name, 'dev');
}

/**
 * build
 * @param name
 */
export async function runBuild(name: string) {
	return pnpmFilter(name, 'build');
}

/**
 * run shell
 * @param name
 */
export async function runShell(name: string) {
	return run('sh', [`shell/${name}.sh`]);
}

/**
 * install dependencies
 * @param packageManager
 */
export async function installDependencies(packageManager?: string) {
	return run(packageManager || 'pnpm', ['install']);
}
