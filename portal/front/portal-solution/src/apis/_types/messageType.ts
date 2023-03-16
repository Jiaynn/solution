/**
 * 接口 [统一消息推送列表↗](http://portalv4.dev.qiniu.io/api/solution/push/list)
 *
 *  @请求头 `POST /api/proxy/unifiedmessage/list`
 */
export interface GetMessageListOptions {
  page_num: number
  page_size: number
}
export interface GetMessageListResultDataList {
  id: number
  icon_image_url: string
  title: string
  describe: string
  bottom_list: Array<{
    link_mark: string
    link_url: string
  }>
}
export interface GetMessageListResult {
  page_total?: number
  end_page?: boolean
  total_count?: number
  list?: GetMessageListResultDataList[]
}

