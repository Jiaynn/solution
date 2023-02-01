/**
 * @file charts of bucket-overview
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'

import { StorageType } from 'kodo/constants/statistics'
import { Granularity } from 'kodo/constants/date-time'
import { RegionSymbolWithAll } from 'kodo/constants/region'
import BaseFlow from './BaseFlow'
import BucketFlow from './BucketFlow'
import BucketBandwidth from './BucketBandwidth'
import Storage from './Storage'
import APIRequest from './APIRequest'

import styles from './style.m.less'

export interface IProps {
  bucketName: string
  region?: RegionSymbolWithAll
  ftype: StorageType
}

function Charts(props: IProps) {
  return (
    <div className={styles.charts}>
      <div className={styles.chartBoxLeft}>
        <BaseFlow
          {...props}
          granularity={Granularity.OneDay}
          title="空间流量"
          render={(data, isLoading) => <BucketFlow data={data} isLoading={isLoading} />}
        />
      </div>
      <div className={styles.chartBoxRight}>
        <BaseFlow
          {...props}
          granularity={Granularity.FiveMinutes}
          title="空间带宽"
          render={(data, isLoading) => <BucketBandwidth data={data} isLoading={isLoading} />}
        />
      </div>
      <div className={styles.chartBoxLeft}>
        <Storage {...props} />
      </div>
      <div className={styles.chartBoxRight}>
        <APIRequest {...props} />
      </div>
    </div>
  )
}

export default observer(Charts)
