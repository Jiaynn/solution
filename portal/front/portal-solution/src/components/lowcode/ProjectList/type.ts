export type Record = {
  /**
   * 项目icon
   */
  icon?: string
  /**
   * 项目名称
   */
  name?: string
  /**
   * 项目描述
   */
  description?: string
  /**
   * 链路
   */
  linkPath?: string
  /**
   * 场景分类
   */
  scene?: string
  /**
   * 应用ID
   */
  appId?: string
  /**
   * 更新时间
   */
  updateTime?: number
  /**
   * 端类型
   */
  platform?: string
}

export type Platform = Parameters<typeof window.electronBridgeApi.openEditor>[0]['platform']

