/**
 * @file component 信息卡片组件
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */
import React, { ReactNode, PropsWithChildren } from 'react'
import Button from 'react-icecream/lib/button'

import './style.less'

export interface IProps {
  title: ReactNode
  children: ReactNode
  onEdit?: () => void
}

export default function InfoCard(props: IProps) {
  const { title, children, onEdit } = props

  return (
    <div className="comp-info-card">
      <div className="info-body">
        <h3 className="info-title">{title}</h3>
        {children}
      </div>
      {onEdit && (
        <div className="info-footer">
          <Button onClick={onEdit} type="link">编辑</Button>
        </div>
      )}
    </div>
  )
}

export function AddInfoCard(props: PropsWithChildren<{}>) {
  return (
    <div className="comp-add-info-card">
      {props.children}
    </div>
  )
}
