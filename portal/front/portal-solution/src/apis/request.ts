export const mockRequest = <TData>(data: TData): Promise<TData> => new Promise(resolve => {
  setTimeout(() => {
    resolve(data)
  }, 1000)
})
