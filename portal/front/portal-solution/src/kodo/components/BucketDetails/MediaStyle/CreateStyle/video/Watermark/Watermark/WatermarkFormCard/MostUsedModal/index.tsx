/**
 * @description modal of most used watermark
 * @author duli <duli@qiniu.com>
 */

import React, { useEffect, useMemo, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loading, Modal, ModalFooter, Table, TableType } from 'react-icecream-2'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { WatermarkMode, watermarkOriginTextMap } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'
import { useCommands } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'
import Prompt from 'kodo/components/common/Prompt'

import { ImageStyleApis, Watermark } from 'kodo/apis/bucket/image-style'

import { timelineTextMap } from '../Timeline'
import { WatermarkFormItemValue } from '..'

import styles from './style.m.less'

interface Props {
  visible: boolean
  onOk: (command: string) => void
  onCancel: () => void
}

type WatermarkRecord = WatermarkFormItemValue & Omit<Watermark, 'id'> & { id: string }

const WatermarkTable: TableType<WatermarkRecord> = Table

export default function MostUsedModal(props: Props) {
  const { visible, onOk, onCancel } = props

  const commands = useCommands()
  const apis = useInjection(ImageStyleApis)
  const toasterStore = useInjection(ToasterStore)
  const [isLoading, setIsLoading] = useState(false)
  const [watermarks, setWatermarks] = useState<WatermarkRecord[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function handleSelect(nextSelectedIds: string[]) {
    setSelectedIds(nextSelectedIds)
  }

  const isSelected = selectedIds.length > 0

  const selection = useMemo(() => ({
    type: 'single',
    selectedIds,
    onChange: handleSelect
  } as const), [selectedIds])

  const handleOk = () => {
    const found = watermarks.find(item => (item.id === selectedIds[0]))

    // 这里只是给的 watermark，不知道会不会影响后面的解析
    onOk(found?.command ?? '')
  }

  useEffect(() => {
    if (!visible) {
      setWatermarks([])
      setSelectedIds([])
      return
    }
    let ignore = false
    setIsLoading(true)
    apis.getMostUsedWatermarks()
      .then(list => {
        Promise.all(list.map(i => (
          commands.videoWatermark.parse({ name: '', commands: i.command })
            .then(data => ({ ...data.watermarkForm[0], ...i } as WatermarkRecord))
            .catch(() => null)
        ))).then(data => !ignore && setWatermarks(data.filter(Boolean) as WatermarkRecord[]))
      })
      .catch(e => toasterStore.error(e))
      .finally(() => !ignore && setIsLoading(false))

    return () => { ignore = true }
  }, [apis, commands.videoWatermark, toasterStore, visible])

  const footerView = <ModalFooter okButtonProps={{ disabled: !isSelected }} />

  return (
    <Modal title="导入常用水印" width={880} visible={visible} footer={footerView} onCancel={onCancel} onOk={handleOk}>
      <Loading loading={isLoading}>
        <Prompt type="normal" className={styles.prompt}>
          请从以下最近使用的水印配置中，选择想要导入的配置
        </Prompt>
        <WatermarkTable records={watermarks} recordIdAccessor="id" selection={selection as any}>
          <WatermarkTable.Column
            accessor="lastUsedTime"
            title="名称"
            render={lastUsedTime => `watermark-${humanizeTimestamp(lastUsedTime, 'YYYYMMDDHHmmss')}`}
          />
          <WatermarkTable.Column
            title="水印类型"
            accessor="mode"
            render={mode => (mode === WatermarkMode.Picture ? '图片水印' : '文字水印')}
          />
          <WatermarkTable.Column
            title="尺寸/字体大小"
            accessor="ratio"
            render={(ratio, record) => {
              if (record.mode === WatermarkMode.Picture) {
                return ratio != null ? `自适应大小：${ratio}` : '原始大小'
              }
              return `${record.fontSize} PX`
            }}
          />
          <WatermarkTable.Column
            title="位置"
            accessor="origin"
            render={origin => (
              <span>{watermarkOriginTextMap[origin]}</span>
            )}
          />
          <WatermarkTable.Column
            title="时长"
            accessor="timelineType"
            render={timelineType => timelineTextMap[timelineType]}
          />
        </WatermarkTable>
      </Loading>
    </Modal>
  )
}
