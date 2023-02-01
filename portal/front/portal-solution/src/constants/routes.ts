/**
 * @file route & current app relative constants
 * @author nighca <nighca@live.cn>
 */

import { basenameMap, getAppEntry } from 'portal-base/common/router'
import { appMap } from 'portal-base/common/product'

import product from './product'

export const app = appMap[product]
export const basename = basenameMap[app]
export const entry = getAppEntry(app)
