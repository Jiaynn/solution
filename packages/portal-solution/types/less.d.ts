/**
 * @file less file typing
 */

/** less with css-module */
// TODO: https://github.com/Jimdo/typings-for-css-modules-loader
declare module '*.m.less' {
  const cssModuleExport: {
    [className: string]: string
  }
  export = cssModuleExport
}

/** less (without css-module) */
declare module '*.less' {
  const lessExport: undefined
  export = lessExport
}
