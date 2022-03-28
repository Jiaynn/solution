const fs = require('fs');
const ora = require('ora');
const inquirer = require('inquirer');
const shell = require('shelljs');
const path = require('path');

const pkgPath = '../package.json';
const pkg = require(pkgPath);

const readPath = path.resolve(__dirname, pkgPath);

const prevVersion = pkg.version;

/**
 * 重写 package.json
 */
function rewritePackageJSON(nextVersion) {
  const spinner = ora(`开始更新 ${pkg.name} 版本号：${prevVersion} => ${nextVersion}`).start();
  // const nextVersionFileName = `${pkg.name}-${nextVersion}`;

  fs.writeFileSync(readPath, JSON.stringify({
    ...pkg,
    version: nextVersion,
    // main: `build/${nextVersionFileName}.umd.js`,
    // module: `build/${nextVersionFileName}.esm.js`
  }, null, 2));

  spinner.succeed(`${pkg.name}版本更新成功，当前版本：${nextVersion}`);
}

function runBuild(pkg) {
  const isNeedUpdateVersionQuestion = {
    name: 'isNeedUpdateVersion', type: 'confirm', message: `${pkg.name} 当前版本：${pkg.version}，是否需要更新版本`,
    default: false
  };
  const nextVersionQuestion = {
    name: 'nextVersion', type: 'input', message: '请输入版本号',
    default: pkg.version
  };
  const buildEnvironmentQuestion = {
    name: 'buildEnvironment', type: 'list',
    message: '请选择构建环境', choices: ['prod'],
    default: 'dev'
  };
  inquirer.prompt([
    isNeedUpdateVersionQuestion
  ]).then(answers => {
    // 需要更新版本号
    if (answers.isNeedUpdateVersion) {
      // 输入更新的版本号
      return inquirer.prompt([
        nextVersionQuestion
      ]).then(answers => {
        rewritePackageJSON(answers.nextVersion);
        return inquirer.prompt([buildEnvironmentQuestion]);
      });
    }
    // 不需要更新版本号
    return inquirer.prompt([buildEnvironmentQuestion]);
  }).then(answers => {
    const { buildEnvironment } = answers;
    const packageJSONData = fs.readFileSync(readPath, 'utf-8');
    const packJSON = JSON.parse(packageJSONData);
    const spinner = ora(`正在构建${packJSON.name}，当前环境：${buildEnvironment}`).start();
    shell.exec(`pnpm build:${buildEnvironment}`, (code, stdout, stderr) => {
      const name = `${packJSON.name}-${packJSON.version}`;
      if (code === 0) {
        spinner.succeed(`${buildEnvironment} 环境下${name}  构建成功~`);
      } else {
        spinner.fail(`${buildEnvironment} 环境下${name}  构建失败！！！`);
        console.log(stderr);
      }
    });
  });
}

runBuild(pkg);