/**
 * @file concurrency limit request
 * @source https://gist.github.com/nighca/6562d098ac01814b6e1c1718b16d4abc
 */

export default function concurrency<T>(process: (_: any) => Promise<T>, limit = -1) {
  return function batchProcess(tasks: unknown[] = []): Promise<T[]> {
    const results: T[] = []
    let finished = 0
    let current = 0
    let rejected = false

    function tryProcess(resolve: (...args: any) => any, reject: (...args: any) => any) {
      if (rejected) return
      if (finished >= tasks.length) return resolve(results)
      if (current >= tasks.length) return

      const index = current++
      process(tasks[index]).then(
        result => {
          results[index] = result
          finished++
          tryProcess(resolve, reject)
        },
        err => {
          reject(err)
          rejected = true
        }
      )
    }

    return new Promise((resolve, reject) => {
      const realLimit = limit > 0 ? limit : tasks.length
      for (let i = 0; i < realLimit; i++) {
        tryProcess(resolve, reject)
      }
    })
  }
}
