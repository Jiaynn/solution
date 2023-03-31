export type ElectronBridgeApi = typeof window.electronBridgeApi

export type Platform = Parameters<ElectronBridgeApi['openEditor']>[0]['platform']

export type DownloadFileResult = Awaited<ReturnType<ElectronBridgeApi['downloadFile']>>
