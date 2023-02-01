import React from 'react'
import { observer } from 'mobx-react'

export interface IStatisticsPanelProps {
  title?: string | React.ReactNode
  children?: React.ReactNode
}

export default observer(function StatisticsPanel(props: IStatisticsPanelProps) {
  return (
    <div className="statistics-panel">
      {props.title && <div className="statistics-panel-title">{props.title}</div>}
      <div className="statistics-panel-content">{ props.children }</div>
    </div>
  )
})
