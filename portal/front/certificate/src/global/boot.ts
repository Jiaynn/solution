/*
 * @file basic boot behavior
 * @author nighca <nighca@live.cn>
 */

import { configure } from 'mobx'

import './icecream-v1-style.less'
import './style.less'

export default function boot() {
  configure({ enforceActions: 'observed' })
}
