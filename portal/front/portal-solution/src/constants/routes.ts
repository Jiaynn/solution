/**
 * @file route & current app relative constants
 * @author nighca <nighca@live.cn>
 */

import { apps, basenameMap, getAppEntry } from 'portal-base/common/router'

export const app = apps.kodov2
export const basename = basenameMap[app]
export const entry = getAppEntry(app)
export const name = '解决方案'
