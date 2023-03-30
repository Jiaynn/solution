export type Platform = Parameters<typeof window.electronBridgeApi.openEditor>[0]['platform']

interface PackageInfo {
  fileName: string
  filePath: string
}

export type ProjectInfo = {
  /**
   * 项目名称
   */
  name: string
  /**
   * 项目描述
   */
  description: string
  /**
   * 场景分类
   * 1: 视频营销/统一消息推送
   */
  sceneType: number
  /**
   * 应用ID
   */
  appId: string
  /**
   * 创建时间
   */
  createTime: number
  /**
   * 包信息
   */
  package: Record<Lowercase<Platform>, PackageInfo | null | undefined>
}
