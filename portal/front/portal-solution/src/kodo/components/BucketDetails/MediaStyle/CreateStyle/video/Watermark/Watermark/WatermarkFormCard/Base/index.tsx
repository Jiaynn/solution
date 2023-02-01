/**
 * @description watermark base component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { range } from 'lodash'
import { FieldState } from 'formstate-x'
import { TabPane, Tabs } from 'react-icecream-2'
import { DeleteIcon, AddThinIcon } from 'react-icecream-2/icons'

import Drag, { Props as DragProps } from './Drag'

import styles from './style.m.less'

type Props = DragProps & {
  amount: number // 水印数量
  activeIndex: FieldState<number>
  onAdd?: () => void
  onDelete?: (index: number) => void
}

export default function Base(props: Props) {
  const { amount, activeIndex, onAdd, onDelete } = props

  const renderName = (index: number) => (
    <div className={styles.nameWrapper}>
      <span className={styles.name} onClick={() => activeIndex.set(index)}>视频水印-{index + 1}</span>
      <DeleteIcon className={styles.deleteIcon} onClick={e => { e.stopPropagation(); onDelete?.(index) }} />
    </div>
  )

  const handleChange = React.useCallback((index: number) => {
    if (typeof index === 'number') activeIndex.set(index)
  }, [activeIndex])

  const addView = (
    <div className={styles.addBtn} onClick={onAdd}>
      <AddThinIcon className={styles.addIcon} />
      <span>添加水印</span>
    </div>
  )

  return (
    <div className={styles.base}>
      <Tabs type="vertical" size="small" className={styles.tabs} value={activeIndex.value} onChange={handleChange}>
        {range(0, amount).map(index => (
          <TabPane name={renderName(index)} key={index} value={index}>
            {null}
          </TabPane>
        ))}
        <TabPane name={addView} value="never">
          {null}
        </TabPane>
      </Tabs>
      <Drag {...props} />
    </div>
  )
}
