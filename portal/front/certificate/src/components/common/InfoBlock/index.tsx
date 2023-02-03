/**
 * @file component 信息展示组件
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */
import React, { CSSProperties } from 'react'
import { chunk } from 'lodash'
import classNames from 'classnames'

import './style.less'

export type InfoRowData = {
  label: string
  field: string
}

export interface IProps {
  data: InfoRowData[]
  /**
   * 一行展示几项
   * @default 2
   */
  columnChunk?: number
  style?: CSSProperties
  className?: string
}

// 生成用于显示的数据
export function getDisplayData(formData: object): InfoRowData[] {
  return Object.keys(formData).map(key => ({ label: key, field: (formData as any)[key] }))
}

export default function InfoBlock(props: IProps) {
  const { data, columnChunk = 2, style, className } = props

  return (
    <div className={classNames('comp-info-block', className)} style={style}>
      {chunk(data, columnChunk).map((rowData, rowIndex) => (
        <div className="info-row" key={rowIndex}>
          {rowData.map(({ label, field }) => (
            <div className="info-item" key={label}>
              <label className="info-item-label">{label}</label>
              <div className="info-item-content">{field}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
