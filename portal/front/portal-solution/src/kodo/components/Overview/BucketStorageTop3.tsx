import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import classnames from 'classnames'

import ReactChart from 'portal-base/common/components/ReactHighcharts'
import { useInjection } from 'qn-fe-core/di'
import { Empty } from 'react-icecream-2'
import { ToasterStore } from 'portal-base/common/toaster'

import merge from 'kodo/utils/merge'

import { useSafeState } from 'kodo/utils/hooks'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { getColumnChartBaseConfig } from 'kodo/transforms/chart'

import { BucketListApis, IV3BucketListItem } from 'kodo/apis/bucket/list'

import styles from './style.m.less'

export default function BucketStorageTop3() {
  const toaster = useInjection(ToasterStore)
  const bucketListApi = useInjection(BucketListApis)
  const [buckets, setBuckets] = useSafeState<IV3BucketListItem[]>([])
  const [bucketsLength, setBucketsLength] = useSafeState<number | null>(null)
  const [loading, setLoading] = useSafeState(true)
  const [chart, setChart] = useSafeState<Highcharts.Chart | undefined | null>(null)

  useEffect(() => {
    toaster.promise(bucketListApi.getBucketNameList().then(names => setBucketsLength(names.length)))
  }, [bucketListApi, setBucketsLength, toaster])

  useEffect(() => {
    if (bucketsLength != null) {
      if (bucketsLength <= 200) {
        const promise = Promise.all([
          bucketListApi.getV3BucketList({ shared: true, line: true }),
          bucketListApi.getV3BucketList({ shared: true, line: false })
        ])
          .then(([lineBuckets, noLineBuckets]) => lineBuckets.concat(noLineBuckets))

        toaster.promise(
          promise
            .then(bucketList => bucketList.sort((a, b) => b.storage_size - a.storage_size))
            .then(bucketList => bucketList.slice(0, 3))
            .then(bucketList => bucketList.filter(bucket => bucket.storage_size > 0))
            .then(setBuckets)
            .finally(() => setLoading(false))
        )
      } else {
        setLoading(false)
      }
    }
  }, [bucketListApi, bucketsLength, setBuckets, setLoading, toaster])

  const config = useMemo<Highcharts.Options>(() => merge(
    getColumnChartBaseConfig((input: number) => humanizeStorageSize(input, 0)), {
      chart: {
        // loading 的时候让图表撑满宽度，让"加载中..."居中
        width: loading ? null : 160,
        height: 160,
        events: {
          render() {
            // 类型没有此方法，运行时有
            // 隐藏 NoData，防止"加载中..."和"暂无数据"叠在一起
            // loading 结束如果真的没有数据会显示成其他组件
            (this as any).hideNoData()
          }
        }
      },
      xAxis: {
        crosshair: false,
        tickWidth: 0,
        labels: {
          enabled: false
        }
      },
      tooltip: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        column: {
          pointWidth: 20,
          groupPadding: 0
        }
      },
      series: buckets.map(bucket => ({
        type: 'column',
        name: bucket.tbl,
        data: [bucket.storage_size]
      }))
    } as Highcharts.Options
  ), [buckets, loading])

  const content = useReturnValue(() => {
    if (loading === false && (bucketsLength === null || bucketsLength > 200 || buckets.length === 0)) {
      const subtitle = bucketsLength != null && bucketsLength > 200 ? '空间数太多，不支持排序' : undefined
      return (
        <div className={styles.emptyWrapper}>
          <Empty image="chart" subtitle={subtitle} />
        </div>
      )
    }
    return (
      <div className={classnames(styles.chartWrapper, loading && styles.loading)}>
        <ReactChart
          ref={ref => {
            setChart(ref?.chart)
          }}
          config={config}
          isChartUpdateDisabled
          isLoading={loading}
        />
      </div>
    )
  })

  const legendItems = buckets.map((bucket, idx) => (
    <LegendItem
      key={idx}
      idx={idx}
      name={bucket.tbl}
      num={bucket.storage_size}
      color={config.colors![idx]}
      chart={chart}
    />
  ))

  const showLegend = bucketsLength != null && bucketsLength <= 200 && loading === false

  return (
    <div className={styles.top3Chart}>
      <div className={styles.title}>空间存储量 TOP3</div>
      <div className={styles.content}>
        {content}
        {showLegend && <Legend>{legendItems}</Legend>}
      </div>
    </div >
  )
}

function useReturnValue<T>(callback: () => T): T {
  return callback()
}

function Legend({ children }: { children: ReactNode }) {
  return (
    <div className={styles.legend}>
      {children}
    </div>
  )
}

type LegendItemProps = {
  idx: number
  name: string
  num: number
  color: string
  chart: Highcharts.Chart | null | undefined
}

function LegendItem({ idx, chart, name, num, color }: LegendItemProps) {
  const [hideSerie, setHideSerie] = useState(false)
  const itemClassnames = classnames(styles.legendItem, hideSerie && styles.grey)
  function handleClick() {
    if (hideSerie) {
      chart?.series[idx].show()
      setHideSerie(false)
    } else {
      chart?.series[idx].hide()
      setHideSerie(true)
    }
  }
  return (
    <div key={idx} className={itemClassnames} onClick={handleClick}>
      <span className={styles.legendItemIcon} style={{ background: color }}></span>
      <span className={styles.legendItemName}>{name}</span>
      <span className={styles.legendItemNum}>{humanizeStorageSize(num)}</span>
    </div>
  )
}
