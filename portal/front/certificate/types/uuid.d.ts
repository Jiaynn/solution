interface UUid {
  v1(): string
  v4(): string
}

declare const uuid: UUid

declare module 'uuid' {
  export = uuid
}
