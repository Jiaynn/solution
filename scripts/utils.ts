import type { Options as ExecaOptions } from 'execa';
// @ts-ignore
import execa from 'execa';

// https://github.com/vitejs/vite/blob/main/scripts/releaseUtils.ts#L68-L74
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
  return run(
    'pnpm',
    ['--filter', name, command]
  );
}

/**
 * dev
 * @param name
 */
export async function devProject(name: string) {
  return pnpmFilter(name, 'dev');
}

/**
 * build demo
 * @param name
 */
export async function buildDemo(name: string) {
  return pnpmFilter(name, 'build');
}

/**
 * build sdk
 * @param name
 */
export async function buildSDK(name: string) {
  return pnpmFilter(name, 'build:prod');
}

/**
 * run shell
 * @param name
 */
export async function runShell(name: string) {
  return run(
    'sh',
    [`shell/${name}.sh`],
  );
}

/**
 * install dependencies
 * @param packageManager
 */
export async function installDependencies(packageManager?: string) {
  return run(
    packageManager || 'pnpm',
    ['install'],
  )
}

