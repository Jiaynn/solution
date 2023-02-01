interface UploadBaseOptions {
  uphost: string[]
  upprotocol: 'http' | 'https'
}

export function getUploadBaseOptions(inputUrls: string | string[]): UploadBaseOptions {
  const urls = Array.isArray(inputUrls) ? inputUrls : [inputUrls]
  const uphost = urls.map(url => url.replace(/^https?:\/\//, ''))

  const everyHttp = urls.every(url => /^http:\/\//.test(url))
  const everyHttps = urls.every(url => /^https:\/\//.test(url))
  const currentProtocol = window.location.protocol.replace(/:$/, '') as 'http' | 'https'
  // eslint-disable-next-line no-nested-ternary
  const upprotocol = everyHttps ? 'https' : everyHttp ? 'http' : currentProtocol

  return { uphost, upprotocol }
}
