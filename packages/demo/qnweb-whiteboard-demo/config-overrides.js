const { override, addWebpackResolve } = require('customize-cra');
const packageJSON = require('./package.json');
const path = require('path');
const paths = require('react-scripts/config/paths');

console.log('白板 Demo 版本：', packageJSON.version);

const addCustomize = () => config => {
  config.devtool = false;
  config.output.path = path.resolve(__dirname, `dist/${packageJSON.version}`);
  return config;
}

module.exports = {
  paths: function () {
    paths.appBuild = path.join(path.dirname(paths.appBuild), `dist/${packageJSON.version}`);
    return paths;
  },
  webpack: override(
    addCustomize(),
    addWebpackResolve({
      modules: ['node_modules'],
    })
  )
}
