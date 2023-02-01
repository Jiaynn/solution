/**
 * @file @qiniu/typed-less-modules config
 * @author Surmon <i@surmon.me>
 * @description 此文件是 @qiniu/typed-less-modules 的配置文件
 * @description @qiniu/typed-less-modules 用于为 less 文件生成 TypeScript 类型定义文件
 */

const path = require('path')

module.exports = {
  pattern: './src/**/*.m.less',
  aliases: {
    '~': [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules')
    ]
  },
  lessRenderOptions: {
    javascriptEnabled: true
  }
}
