/*
 * @file api-relative constants
 * @author nighca <nighca@live.cn>
 */

export const prefix = '/api/fusion'

export const oemPrefix = '/api/oem'

export const gaeaPrefix = '/api/gaea'

export interface IListWithPageOf<T> {
  list: T[]
  total: number
}
