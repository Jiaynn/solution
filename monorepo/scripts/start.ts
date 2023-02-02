import { getPackages } from '@manypkg/get-packages';
import { cyan, red } from 'kolorist';
import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import prompts from 'prompts';

import { preRunTask, TPackageName } from './task';
import { devProject } from './utils';

async function main() {
	const { packages } = await getPackages(process.cwd());
	const packageNameFromArgs = process.argv[2];
	const packageFromArgs = packages.find(
		(pkg) => pkg.packageJson.name === packageNameFromArgs
	);
	const answerFromArgs = packageFromArgs && {
		demo: {
			...packageFromArgs,
			preRun: preRunTask[packageFromArgs.packageJson.name as TPackageName].run
		}
	};

	const answer =
		answerFromArgs ||
		(await prompts(
			{
				type: 'select',
				name: 'demo',
				message: '选择要运行的demo',
				choices: packages
					.filter((pkg) => pkg.packageJson.name.endsWith('-demo'))
					.filter((pkg) => {
						const packageName = pkg.packageJson.name as TPackageName;
						return !!preRunTask[packageName];
					})
					.map((pkg) => {
						const packageName = pkg.packageJson.name as TPackageName;
						return {
							title: `${packageName}(${preRunTask[packageName].title})`,
							value: {
								...pkg,
								preRun: preRunTask[packageName].run
							}
						};
					})
			},
			{
				onCancel: () => {
					throw new Error(red('✖') + ' Operation cancelled');
				}
			}
		));

	console.log(cyan('preRun...'));
	await answer.demo.preRun();
	console.log(cyan('preRun ok'));

	if (!answerFromArgs) {
		console.log(cyan('devProject...'));
		await devProject(answer.demo.packageJson.name);
		console.log(cyan('devProject ok'));
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
