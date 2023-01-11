/**
 * @file icecream relative types
 * @author yinxulai <me@yinxulai.com>
 */

import { TableProps, ColumnProps } from 'react-icecream/lib/table'

export type Filters<T> = { [K in keyof T]: Array<T[K]> }

export type OnChange<T extends object> = TableProps<T>['onChange']
export type Pagination<T extends object> = TableProps<T>['pagination']

export type ColumnFilters<T extends object> = ColumnProps<T>['filters']
export type ColumnSorterOrder<T extends object> = ColumnProps<T>['sorter']
export type ColumnSortOrder<T extends object> = ColumnProps<T>['sortOrder']

export interface IColumnFiltersProps<T extends object> {
  filteredValue: Array<T[keyof T]> // TODO: antd/icecream 类型错误
  onFilter(value: T[keyof T], record: T): boolean // TODO: antd/icecream 类型错误
  filters: ColumnFilters<T>
}

export interface IColumnSortProps<T extends object> {
  sortOrder: ColumnSortOrder<T>
  sorter: ColumnSorterOrder<T>
}
