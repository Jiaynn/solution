export type Awaited<T> =
  T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
    T extends object & { then(onfulfilled: infer F): any } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
      F extends ((value: infer V, ...args: any) => any) ? // if the argument to `then` is callable, extracts the first argument
        Awaited<V> : // recursively unwrap the value
        never : // the argument to `then` was not callable
      T; // non-object or non-thenable

export type ElectronBridgeApi = typeof window.electronBridgeApi

export type Platform = Parameters<ElectronBridgeApi['openEditor']>[0]['platform']

export type DownloadFileResult = Awaited<ReturnType<ElectronBridgeApi['downloadFile']>>
