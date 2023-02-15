import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import React, { useEffect, useState } from 'react'
import { Select } from 'react-icecream'

import { SelectProps } from 'antd/lib/select'

import styles from './style.m.less'
import { SolutionApis } from 'apis/imageSolution'

interface IProps extends SelectProps {
  defaultBucketName: string;
  onChange: (bucketName: string) => void;
}

export default observer(function SelectBucket(props: IProps) {
  const {
    defaultBucketName
  } = props

  const [bucketNames, setBucketNames] = useState<string[]>([])

  const solutionApis = useInjection(SolutionApis)

  useEffect(() => {
    solutionApis.getBucketList({ page_num: 1, page_size: 100, solution_code: 'image' }).then(res => {
      const buckets = res.list.map(b => b.bucket_id)
      setBucketNames(buckets)
    })
  }, [solutionApis])

  return (
    <div className={styles.wrapper}>
      <div className={styles.blueBar}></div>
      <div className={styles.title}>当前空间：</div>
      <Select
        style={{ width: '200px' }}
        value={defaultBucketName}
        {...props}
      >
        {bucketNames.map(bucketName => (
          <Select.Option key={bucketName} value={bucketName}>
            {bucketName}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
})
