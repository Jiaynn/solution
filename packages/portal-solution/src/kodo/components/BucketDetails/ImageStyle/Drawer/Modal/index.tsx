/**
 * @description common used scenarios modal
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { Modal } from 'react-icecream/lib'

import { scenarios } from '../constants'

import styles from './style.m.less'

export interface Props {
  visible: boolean
  onChange: (code: string) => void
  onCancel: () => void
}

export default function CommonUsedModal({ visible, onChange, onCancel }: Props) {
  return (
    <Modal title="常用使用场景" width={800} visible={visible} onCancel={onCancel} footer={null} centered>
      <div className={styles.head}>根据您的业务需求，选择合适的场景，创建样式。</div>
      {scenarios.map(scenario => {
        const SVG = scenario.thumbnail
        return (
          <div className={styles.scenario} key={scenario.command} onClick={() => onChange(scenario.command)}>
            <SVG className={styles.image} />
            <div className={styles.info}>
              <div className={styles.title}>{scenario.name}</div>
              <p className={styles.desc}>{scenario.description}</p>
            </div>
          </div>
        )
      })}
    </Modal>
  )
}
