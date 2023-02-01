/**
 * @file 神策埋点
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export const prefix = 'sensors - 空间设置主页'

export function injectMainBtnClickHookProps(id?: string | null) {
  return id && { name: `${prefix} - ${id} - main btn` }
}
