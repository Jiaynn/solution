/**
 * @desc Bucket has no tags.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { Tag } from 'react-icecream'

import styles from './style.m.less'

export default function EmptyTag() {
  return (
    <Tag color="grey0" className={styles.emptyTag}>
      未设置标签
    </Tag>
  )
}
