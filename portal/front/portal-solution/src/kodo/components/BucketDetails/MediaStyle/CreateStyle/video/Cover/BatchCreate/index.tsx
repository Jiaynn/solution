import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'

import BaseBatchCreateForm from '../../../common/BatchCreateForm'

import { sourceFormatList } from '../../utils'
import { StyleConfigFormStateType } from '../style-config-form'
import { BatchCreateFormStateType, createBatchCreateChildFormState } from '../batch-create-form'

type Props = {
  isEditMode: boolean
  styleConfigFormState: StyleConfigFormStateType
  formState: BatchCreateFormStateType
}

export default observer(function BatchCreate({ isEditMode, styleConfigFormState, formState }: Props) {

  const handleAddRow = () => {
    const styleConfigSourceFormat = styleConfigFormState.$.sourceFormat.value
    const availableSuffixes = sourceFormatList.filter(
      v => v !== styleConfigSourceFormat
        && formState.$.find(field => field.$.sourceFormat.value === v) == null
    )

    const index = formState.value.length > 0
      ? Math.max(...formState.value.map(i => i.index)) + 1
      : 0

    const rowState = createBatchCreateChildFormState({
      styleConfigFormState,
      initSourceFormat: availableSuffixes[0],
      index,
      isEditMode,
      formState
    })

    runInAction(() => {
      formState.$.push(rowState)
    })
  }

  return (
    <BaseBatchCreateForm
      state={formState}
      disabled={isEditMode}
      onAddNew={handleAddRow}
      sourceFormatList={sourceFormatList}
      title={`批量${isEditMode ? '修改' : '创建'}`}
      sourceFormat={styleConfigFormState.$.sourceFormat.$}
      description={isEditMode ? '复用以上配置对类似的样式进行快速的批量修改。' : '复用以上配置批量创建多种视频格式文件的封面样式。'}
    />
  )
})
