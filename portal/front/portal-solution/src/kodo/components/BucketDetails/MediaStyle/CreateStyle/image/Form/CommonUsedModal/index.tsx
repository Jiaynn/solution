/**
 * @description common used scenarios modal
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { Alert, Drawer } from 'react-icecream-2'

import { scenarios } from './constants'

import styles from './style.m.less'

export interface Props {
  visible: boolean
  onChange: (code: string) => void
  onCancel: () => void
}

export function CommonUsedModal({ visible, onChange, onCancel }: Props) {
  return (
    <Drawer className={styles.drawer} title="导入常用配置" width={800} visible={visible} onCancel={onCancel} footer={null}>
      <Alert className={styles.head} message="根据您的业务需求，选择合适的场景配置，创建样式。" />
      <div className={styles.content}>
        {scenarios.map(scenario => {
          const SVG = scenario.thumbnail
          return (
            <div className={styles.scenario} key={scenario.command} onClick={() => onChange(scenario.command)}>
              <SVG className={styles.image} />
              <div className={styles.info}>
                <div className={styles.title}>{scenario.name}</div>
                <div className={styles.desc}>{scenario.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </Drawer>
  )
}
