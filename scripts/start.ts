import * as process from 'process';
// @ts-ignore
import prompts from 'prompts';
import { getPackages } from '@manypkg/get-packages';

import { buildDemo, buildSDK, devProject, runShell } from './utils';
import { cyan, red } from 'kolorist';

const preRunTask = {
  // Cube
  'qnweb-cloud-class-demo': {
    title: '云课堂场景',
    async run() {
      await buildSDK('whiteboard');
      await buildSDK('qnweb-whiteboard');
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
    }
  },
  'qnweb-exam-system-demo': {
    title: '监考系统场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
    }
  },
  'qnweb-interview-demo': {
    title: '面试场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
    }
  },
  'qnweb-overhaul-demo': {
    title: '检修场景',
    async run() {
      buildSDK('whiteboard');
      buildSDK('qnweb-whiteboard');
      buildSDK('qnweb-im');
      buildSDK('qnweb-high-level-rtc');
    }
  },
  'qnweb-video-together-demo': {
    title: '一起看视频场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
    }
  },

  // Other
  'qnweb-im-demo': {
    title: 'im demo',
    async run() {
      await buildSDK('qnweb-im');
      await runShell('copy_im');
    }
  },
  'qnweb-rtc-ai-demo': {
    title: 'rtc ai demo',
    async run() {
      await buildSDK('qnweb-rtc-ai');
      await runShell('copy_rtc_ai');
    }
  },
  'qnweb-whiteboard-demo': {
    title: '白板 demo',
    async run() {
      await buildSDK('whiteboard');
      await buildSDK('qnweb-whiteboard');
      await runShell('copy_whiteboard_sdk');
      await runShell('copy_whiteboard_wasm');
    }
  }
};

type PackageName = keyof typeof preRunTask;

async function main() {
  const { packages } = await getPackages(process.cwd());
  const packageNameFromArgs = process.argv[2];
  const packageFromArgs = packages.find(pkg => pkg.packageJson.name === packageNameFromArgs);
  const answerFromArgs = packageFromArgs && {
    demo: {
      ...packageFromArgs,
      preRun: preRunTask[packageFromArgs.packageJson.name as PackageName].run
    }
  };

  const answer = answerFromArgs || await prompts({
    type: 'select',
    name: 'demo',
    message: '选择要运行的demo',
    choices: packages
      .filter(pkg => pkg.packageJson.name.endsWith('-demo'))
      .map(pkg => {
        const packageName = pkg.packageJson.name as PackageName;
        return {
          title: `${packageName}(${preRunTask[packageName].title})`,
          value: {
            ...pkg,
            preRun: preRunTask[packageName].run
          }
        };
      }),
  }, {
    onCancel: () => {
      throw new Error(red('✖') + ' Operation cancelled');
    },
  });

  console.log(cyan('preRun...'));
  await answer.demo.preRun();
  console.log(cyan('preRun ok'));

  if (answerFromArgs) {
    console.log(cyan('buildDemo...'));
    await buildDemo(answer.demo.packageJson.name);
    console.log(cyan('buildDemo ok'));
  } else {
    console.log(cyan('devProject...'));
    await devProject(answer.demo.packageJson.name);
    console.log(cyan('devProject ok'));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
