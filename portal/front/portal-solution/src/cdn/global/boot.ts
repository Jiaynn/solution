/**
 * @file basic boot behavior
 * @author nighca <nighca@live.cn>
 */

import { configure } from 'mobx'
import moment from 'moment'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import 'moment/locale/zh-cn'

export default function boot() {
  configure({ enforceActions: 'observed' })

  moment.locale('zh-cn')

  dayjs.extend(isBetween)
  dayjs.extend(customParseFormat)
}
