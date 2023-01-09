/**
 * @file util methods
 * @author nighca <nighca@live.cn>
 */

// from [redux](https://github.com/reactjs/redux/blob/master/src/compose.js)
export default function compose(...funcs: any) {
  if (funcs.length === 0) { return (arg: any) => arg }
  if (funcs.length === 1) { return funcs[0] }
  return funcs.reduce((a: any, b: any) => (...args: any) => a(b(...args)))
}
