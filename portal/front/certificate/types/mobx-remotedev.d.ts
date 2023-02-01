interface StoreClass {
  (): void
}

interface Remotedev {
  (store: any, config?: any): StoreClass
}

declare const remotedev: Remotedev

declare module 'mobx-remotedev' {
  export = remotedev
}
