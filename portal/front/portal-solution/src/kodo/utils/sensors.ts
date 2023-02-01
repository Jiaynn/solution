/*
 * @file sensors report helper
 */

import sensors from 'sa-sdk-javascript'

export function sensorsTagFlag(...keys: string[]) {
  return {
    // 添加 data-sensors-click 使 censor 自动统计该标签的点击事件
    // ref: https://manual.sensorsdata.cn/sa/latest/tech_sdk_client_web_all_use-34537687.html
    'data-sensors-click': true,
    name: `sensors-${keys.join('-')}`
  }
}

export function sensorsTrack(event: string, data: object) {
  const { href, pathname } = window.location
  sensors.track(`Kodo${event}`, {
    $url: href,
    $url_path: pathname,
    $title: window.document.title || '',
    ...data
  })
}
