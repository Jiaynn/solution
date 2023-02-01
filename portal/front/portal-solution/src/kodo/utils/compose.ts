/*
 * @file util methods
 * @author nighca <nighca@live.cn>
 */

// from [redux](https://github.com/reactjs/redux/blob/master/src/compose.js)
export default function compose(...funcs) {
  if (funcs.length === 0) { return arg => arg }
  if (funcs.length === 1) { return funcs[0] }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
