/**
 * @file current product
 * @author nighca <nighca@live.cn>
 */

import { Product, nameMap } from 'portal-base/common/product'

const product = Product.Kodo // TODO: 需要换成自己对应的产品，还包括 `build-config.json` 等其他包含了指向 kodo 内容的东西
export default product

export const name = nameMap[product]
