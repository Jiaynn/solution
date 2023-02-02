const fs = require('fs-extra');

const pkg = require('../package.json');

const sourceDir = `dist/${pkg.version}`;
const targetDir = 'dist';

const runDistVersion = () => {
  return fs.ensureDir(targetDir).then((result) => {
    console.log('ensureDir result', result);
    return fs.copy(sourceDir, targetDir);
  }).then(result => {
    console.log('dist-version successfully: ', result);
  });
};

runDistVersion().catch(err => {
  console.log('dist-version err: ', err);
});
