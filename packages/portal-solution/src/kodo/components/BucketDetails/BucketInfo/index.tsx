
import { addListener, removeListener } from 'resize-detector'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { Spin, Tooltip } from 'react-icecream/lib'
import { useInjection } from 'qn-fe-core/di'
import React, { useRef, useState, useEffect, isValidElement } from 'react'

import { humanizeStorageSize, humanizeBigNumber } from 'kodo/transforms/unit'
import { getStringWithSpace } from 'kodo/transforms/bucket'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore, Loading as BucketLoading } from 'kodo/stores/bucket'

import { useEvent } from 'kodo/hooks'

import { shareNameMapForConsumer } from 'kodo/constants/bucket/setting/authorization'
import { privateNameMap } from 'kodo/constants/bucket/setting/access'
import { bucketSysTagNameMap } from 'kodo/constants/bucket'

import { IBucket } from 'kodo/apis/bucket'

import styles from './style.m.less'

type BucketInfoProps = {
  bucketName: string
}

export default observer(function BucketInfo({ bucketName }: BucketInfoProps) {
  const configStore = useInjection(ConfigStore)
  const bucketStore = useInjection(BucketStore)

  const isSharedBucket = bucketStore.isShared(bucketName)
  const bucket = bucketStore.getDetailsByName(bucketName)
  const bucketStorageInfo = bucketStore.getStorageInfoByName(bucketName)
  const {
    private: privateType = undefined,
    perm = undefined,
    oemail = undefined,
    region = undefined,
    systags = undefined,
    remark = ''
  } = bucket || {}

  const isShared = isSharedBucket != null ? isSharedBucket : false // 确定才显示

  const regionConfig = region && configStore.getRegion({ region })
  const regionName = regionConfig ? regionConfig.name : region

  const counter = { fileCount: 0, storageSize: 0 }

  Object.values(bucketStorageInfo || {}).forEach(storageInfo => {
    if (!storageInfo) { return }
    counter.storageSize += storageInfo.storageSize
    counter.fileCount += storageInfo.fileCount
  })

  const isDetailsLoading = bucketStore.isLoading(BucketLoading.Details)
  const isStorageLoading = bucketStore.isLoading(BucketLoading.ArchiveStorage)
    || bucketStore.isLoading(BucketLoading.LineStorage)
    || bucketStore.isLoading(BucketLoading.StandardStorage)

  const sysTagsName = Array.isArray(systags) ? systags.map(sysTag => bucketSysTagNameMap[sysTag]).join('；') : null

  const children = [
    <BucketInfoItem key="1" label="存储区域" value={regionName} isLoading={isDetailsLoading} />,
    <BucketInfoItem key="2" label="存储量" value={counter.storageSize} isLoading={isStorageLoading} humanizer={humanizeStorageSize} />,
    <BucketInfoItem key="3" label="对象数" value={counter.fileCount} isLoading={isStorageLoading} humanizer={humanizeBigNumber} />,
    <BucketInfoItem key="4" label="访问控制" value={privateType != null ? privateNameMap[privateType] : '--'} isLoading={isDetailsLoading} />,
    <BucketInfoItem key="5" label="空间类型" value={perm != null ? shareNameMapForConsumer[perm] : '--'} isLoading={isDetailsLoading} />,
    regionConfig && regionConfig.objectStorage.bucketRemark.enable
    && remark && remark !== ''
    && <BucketInfoItem key="6" label="空间备注" value={remark} humanizer={getStringWithSpace} isLoading={isDetailsLoading} canEllipsis remark />,
    sysTagsName && <BucketInfoItem key="7" label="场景" value={sysTagsName} isLoading={isDetailsLoading} canEllipsis />,
    isShared && oemail && <BucketInfoItem key="8" label="所属用户" value={oemail} isLoading={isDetailsLoading} canEllipsis />
  ]
  const childrenCount = children.reduce<number>((acc, child) => {
    if (isValidElement(child) && child.type === BucketInfoItem) {
      return acc + 1
    }
    return acc
  }, 0)

  return (
    <div className={styles.baseInfoCard}>
      <div className={classnames(styles.left, childrenCount > 6 && styles.compact)}>
        {children}
      </div>
    </div>
  )
})

type BucketInfoItemProps = {
  label: string
  value: IBucket[keyof IBucket]
  isLoading?: boolean
  humanizer?: (...args: any[]) => string
  canEllipsis?: boolean
  remark?: boolean
}

// 布局说明：
// 超过 6 个紧凑模式，紧凑模式有两行
// 非 canEllipsis 的 item 不允许被挤压，宽度是内容宽度
// canEllipsis 的 item 要在剩余宽度足够的情况下能展示完内容不出省略号，内容超出宽度后出省略号
function BucketInfoItem({ label, value, isLoading, humanizer, canEllipsis = false, remark = false }
: BucketInfoItemProps) {
  // eslint-disable-next-line no-nested-ternary
  const safetyValue = (value == null || value === '')
    ? '--'
    : (humanizer ? humanizer(value) : value)

  const ref = useRef<HTMLDivElement>(null)
  const valueEleRef = useRef<HTMLSpanElement>(null)
  const [isEllipsis, setIsEllipsis] = useState(canEllipsis)

  const [shouldForceUpdate, setForceUpdate] = useState(true)

  // 状态变更，dom 高宽变更都会触发
  const onChange = useEvent(() => {
    if (valueEleRef.current == null) return
    const ele = valueEleRef.current
    setIsEllipsis(ele.offsetWidth < ele.scrollWidth)
    if (canEllipsis) setForceUpdate(false)
  })

  // 处理隔壁 item 异步加载导致的宽度被压缩
  // 处理 item 个数变更导致的被压缩
  // 检测到后检查一下是否 ellipsis 了
  useEffect(() => {
    if (ref.current == null) return
    const ele = ref.current
    onChange()
    addListener(ele, onChange)
    return () => {
      removeListener(ele, onChange)
    }
  }, [onChange])

  // 强制刷新相关逻辑，等新状态生成布局后，判断是否 ellipsis
  useEffect(() => {
    if (shouldForceUpdate) {
      onChange()
    }
  }, [onChange, shouldForceUpdate])

  // 检测能导致宽度变更的状态
  // 状态变更后，强制把 setIsEllipsis 重置到初始状态，强制刷新
  // 如果当前是 ellipsis 的，则因为 canEllipsis 导致的 flex 撑满剩余空间
  // 这个时候切换到更短的内容，宽度没有感知到变化，导致本应宽度要紧贴内容却出现宽度是撑开的情况
  // 所以如果是 canEllipsis 的，强制用新内容检测一次是否有出省略号
  const isMountRef = useRef(false)
  useEffect(() => {
    // 如果依赖有变更，重置 isEllipsis，从头开始计算
    if (isMountRef.current === true) {
      if (canEllipsis) setForceUpdate(true)
      return
    }
    isMountRef.current = true
  }, [canEllipsis, label, value])

  const itemView = (
    <span className={styles.infoItem}>
      <span className={styles.label}>{label}：</span>
      <span ref={valueEleRef} className={styles.value}>{safetyValue}</span>
    </span>
  )

  function renderItem() {
    if (isEllipsis) {
      return (
        // 空间备注时按原始数据展示，tooltip保留换行和空格
        <Tooltip title={remark ? value : safetyValue}>
          {itemView}
        </Tooltip>
      )
    }
    return itemView
  }

  const classname = classnames(
    styles.spin,
    canEllipsis && styles.canEllipsis,
    canEllipsis && !isEllipsis && styles.noEllipsis
  )
  return (
    <div ref={ref} className={classname}>
      <Spin spinning={isLoading}>
        {renderItem()}
      </Spin>
    </div>
  )
}
