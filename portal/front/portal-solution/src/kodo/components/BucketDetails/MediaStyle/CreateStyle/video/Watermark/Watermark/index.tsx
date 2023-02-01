/**
 * @description video watermark component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'

import { Origin } from '../../../common/constants'

import WatermarkFormCard, {
  createWatermarkFormItemState,
  WatermarkForm
} from './WatermarkFormCard'
import { useCommands } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'

interface Props {
  bucketName: string
  defaultExpanded: boolean
  activeIndex: FieldState<number>
  watermarkForm: FormState<WatermarkForm[]>
}

export default observer(function VideoWatermarkForm(props: Props) {
  const { activeIndex, watermarkForm, bucketName, defaultExpanded } = props

  const commands = useCommands()

  const handleAddWatermarkItem = React.useCallback(() => {
    runInAction(() => {
      const length = watermarkForm.$.length
      watermarkForm.$.push(createWatermarkFormItemState())
      activeIndex.onChange(length)
    })
  }, [watermarkForm, activeIndex])

  const handleRemoveWatermarkItem = React.useCallback((index: number) => {
    runInAction(() => {
      watermarkForm.$[index].dispose()
      watermarkForm.$.splice(index, 1)
      if (activeIndex.value > index) {
        // 前面被删除了，后面的序号跟着变
        activeIndex.onChange(activeIndex.value - 1)
      } else if (activeIndex.value === index) {
        activeIndex.onChange(Math.max(activeIndex.value - 1, 0))
      }
    })
  }, [activeIndex, watermarkForm.$])

  const handleOffsetChange = React.useCallback((origin: Origin, offsetX: number, offsetY: number) => {
    runInAction(() => {
      watermarkForm.$[activeIndex.value]?.$.origin.onChange(origin)
      watermarkForm.$[activeIndex.value]?.$.horizontal.onChange(offsetX)
      watermarkForm.$[activeIndex.value]?.$.vertical.onChange(offsetY)
    })
  }, [activeIndex, watermarkForm.$])

  const handleSelectMostUsedCommand = React.useCallback(async (selectedCommand: string) => {
    const parsedOptions = await commands.videoWatermark.parse(
      { name: '', commands: selectedCommand }
    )

    watermarkForm.$[activeIndex.value].dispose()
    runInAction(() => {
      watermarkForm.$.splice(
        activeIndex.value,
        1,
        createWatermarkFormItemState(parsedOptions.watermarkForm?.[0])
      )
    })
  }, [commands, activeIndex, watermarkForm.$])

  return (
    <WatermarkFormCard
      bucketName={bucketName}
      formState={watermarkForm}
      activeIndex={activeIndex}
      defaultExpanded={defaultExpanded}
      onAddItem={handleAddWatermarkItem}
      onDeleteItem={handleRemoveWatermarkItem}
      onOffsetChange={handleOffsetChange}
      onSelectMostUsedCommand={handleSelectMostUsedCommand}
    />
  )
})
