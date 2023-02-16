/**
 * @file route & current app relative constants
 * @author nighca <nighca@live.cn>
 */

import { apps, basenameMap, getAppEntry } from 'portal-base/common/router'

export const app = apps.solutions
export const basename = basenameMap[app]
export const entry = getAppEntry(app)
export const name = '图片存储分发处理解决方案'
