/**
 * @file css module
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: with IDE
// https://github.com/Jimdo/typings-for-css-modules-loader

declare module '*.less' {
  const cssModuleExport: {
    [className: string]: string
  }

  export = cssModuleExport
}
