/**
 * @file app constants
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { apps } from 'portal-base/common/router'

export enum App {
  Platform = 'platform',
  Kodo = 'kodo',
  Fog = 'fog'
}

export const appNameMap = {
  [App.Platform]: apps.platform,
  [App.Kodo]: apps.kodov2,
  [App.Fog]: apps.fog
} as const
