import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import React from 'react'
import { Select } from 'react-icecream'

import { SelectProps } from 'antd/lib/select'

import ImageSolutionStore from 'store/imageSolution'

import styles from './style.m.less'

export default observer(function SelectBucket(props: SelectProps) {
  const imageSolutionStore = useInjection(ImageSolutionStore)
  const { bucketNames } = imageSolutionStore

  return (
    <div className={styles.wrapper}>
      <div className={styles.blueBar}></div>
      <div className={styles.title}>当前空间：</div>
      <Select
        style={{ width: '200px' }}
        {...props}
        disabled={!imageSolutionStore.hasBucket}
      >
        {
          bucketNames.map(bucketName => (
            <Select.Option key={bucketName} value={bucketName}>
              {bucketName}
            </Select.Option>
          ))
        }
      </Select>
    </div>
  )
})
