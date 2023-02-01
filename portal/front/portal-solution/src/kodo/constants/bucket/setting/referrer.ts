/**
 * @file 防盗链
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export enum AntiLeechMode {
  Disabled = 0,
  WhiteList = 1,
  BlackList = 2
}

export const antiLeechModeNameMap = {
  [AntiLeechMode.Disabled]: '关闭',
  [AntiLeechMode.WhiteList]: '白名单',
  [AntiLeechMode.BlackList]: '黑名单'
}

export enum NoReferrer {
  Disallow = 0,
  Allow = 1
}

export const noReferrerNameMap = {
  [NoReferrer.Disallow]: '禁止',
  [NoReferrer.Allow]: '允许'
}
