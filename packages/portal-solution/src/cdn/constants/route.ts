/*
 * @file route-relative constants
 * @author nighca <nighca@live.cn>
 */

import { appMap, Product } from 'portal-base/common/product'
import { apps, basenameMap } from 'portal-base/common/router'

export const cdnBasename = basenameMap[appMap[Product.Cdn]]

export const dcdnBasename = basenameMap[appMap[Product.Dcdn]]

export const oemBasename = ''

export const notificationBasename = basenameMap[apps.notification]
