/**
 * @file 默认首页
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export enum NoIndexPage {
  Disabled = 0,
  Enabled = 1
}

export const noIndexPageNameMap = {
  [NoIndexPage.Disabled]: '禁用',
  [NoIndexPage.Enabled]: '启用'
}
