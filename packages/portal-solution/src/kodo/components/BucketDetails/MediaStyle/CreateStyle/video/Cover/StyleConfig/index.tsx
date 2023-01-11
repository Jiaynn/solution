import React, { useState } from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { HelpIcon } from 'react-icecream-2/icons'
import { Drawer, InputGroup, InputGroupItem, Link, SelectOption, Switch } from 'react-icecream-2'
import { FormItem, Select, NumberInput } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import Prompt from 'kodo/components/common/Prompt'

import { BaseOptionsForm } from '../../../common/BaseOptionsForm'
import {
  sourceFormatList,
  CoverType, coverScaleTypes,
  coverScaleTypeNameMap, CoverScaleType, staticCoverSuffixes,
  dynamicCoverSuffixes, coverAutoScaleTypes, coverAutoScaleTypeNameMap
} from '../../utils'

import { StyleConfigFormStateType } from '../style-config-form'

import styles from './styles.m.less'

const formItemLayout = {
  labelWidth: '90px',
  layout: 'horizontal'
} as const

type Props = {
  isEditMode: boolean
  sourceFormatDisabled: boolean
  persistenceFileKey: string | undefined
  formState: StyleConfigFormStateType
}

export default observer(function StyleConfig(props: Props) {
  const { persistenceFileKey, isEditMode, formState, sourceFormatDisabled } = props
  const [scaleHelpDrawerVisible, setScaleHelpDrawerVisible] = useState(false)
  const handleDimensionChange = (type: 'width' | 'height') => {
    const max = 3840
    const min = 20
    const heightValue = formState.$.coverScaleHeight.value || 0
    const widthValue = formState.$.coverScaleWidth.value || 0
    runInAction(() => {
      if (widthValue < min) {
        formState.$.coverScaleWidth.onChange(min)
      }
      if (heightValue < min) {
        formState.$.coverScaleHeight.onChange(min)
      }

      if (widthValue > max) {
        formState.$.coverScaleWidth.onChange(max)
      }
      if (heightValue > max) {
        formState.$.coverScaleHeight.onChange(max)
      }

      if (heightValue > 2160 && widthValue > 2160) {
        if (type === 'width') {
          formState.$.coverScaleWidth.onChange(2160)
        } else {
          formState.$.coverScaleHeight.onChange(2160)
        }
      }
    })
  }

  // 持久化保存提示
  const persistenceTipView = React.useMemo(() => {
    const fileNameView = (
      <MiddleEllipsisSpan
        style={{ color: '#e28b00' }}
        title={persistenceFileKey}
        text={persistenceFileKey || ''}
        key={persistenceFileKey}
        maxRows={2}
      />
    )
    return (
      <span className={styles.persistenceTip}>
        处理后的文件会保存到当前空间{persistenceFileKey ? <span>，文件名示例：{fileNameView}</span> : null}
        <br />
        包含音视频相关处理时、将强制开启自动保存，避免重复触发处理、提升访问体验
      </span>
    )
  }, [persistenceFileKey])

  return (
    <>
      <BaseOptionsForm
        state={formState}
        outputFormatList={[]}
        isEditMode={isEditMode}
        sourceFormatDisabled={sourceFormatDisabled}
        outputFormatInvisible
        sourceFormatList={sourceFormatList}
        formLabelWidth={formItemLayout.labelWidth}
      />
      {/* 动态封面隐藏了，所以这个 RadioGroup 就暂时没必要了 */}
      {/* <FormItem className={styles.baseFormGap} label="封面类型" {...formItemLayout}>
        <div style={{ marginTop: 5 }}>
          <RadioGroup state={formState.$.coverType} disabled={isEditMode}>
            {coverTypes.map(type => <Radio key={type} value={type}>{coverTypeNameMap[type]}</Radio>)}
          </RadioGroup>
        </div>
      </FormItem> */}
      <FormItem label="封面格式" className={styles.baseFormGap} {...formItemLayout}>
        <Select
          className={styles.expandedInput}
          state={formState.$.outputFormat}
          disabled={isEditMode || formState.$.coverType.value === CoverType.Dynamic}
        >
          {(formState.$.coverType.value === CoverType.Static ? staticCoverSuffixes : dynamicCoverSuffixes)
            .map(suffix => (
              <SelectOption
                key={suffix}
                value={suffix}
              >
                {suffix}
              </SelectOption>
            ))}
        </Select>
      </FormItem>
      {
        formState.$.coverType.value === CoverType.Static && (
          <FormItem label="截图时间" {...formItemLayout}>
            <div className={styles.alignCenter}>
              <InputGroup className={styles.cutPicMinutes} style={{ width: '140px' }}>
                <NumberInput
                  emptyValue={0}
                  min={0}
                  digits={0}
                  state={formState.$.cutPicMinutes}
                />
                <InputGroupItem>分</InputGroupItem>
              </InputGroup>
              <InputGroup className={styles.cutPicSeconds} style={{ width: '140px' }}>
                <NumberInput
                  emptyValue={0}
                  step={0.1}
                  max={59}
                  min={0}
                  digits={3}
                  state={formState.$.cutPicSeconds}
                />
                <InputGroupItem>秒</InputGroupItem>
              </InputGroup>
            </div>
          </FormItem>
        )
      }
      {
        formState.$.coverType.value === CoverType.Dynamic && (
          <FormItem label="片段截取" {...formItemLayout}>
            <div className={styles.cutPartStartTime}>
              <span className={styles.inputLabel}>开始时间</span>
              <InputGroup className={styles.cutPartStartTimeMinutes} style={{ width: '140px' }}>
                <NumberInput
                  min={0}
                  digits={0}
                  state={formState.$.cutPartStartTimeMinutes}
                />
                <InputGroupItem>分</InputGroupItem>
              </InputGroup>
              <InputGroup style={{ width: '140px' }}>
                <NumberInput
                  step={0.1}
                  max={60}
                  min={0}
                  digits={3}
                  state={formState.$.cutPartStartTimeSeconds}
                />
                <InputGroupItem>秒</InputGroupItem>
              </InputGroup>
            </div>
            <div className={styles.cutPartStartTimeDuration}>
              <span className={styles.inputLabel}>截取长度</span>
              <InputGroup style={{ width: '140px' }}>
                <NumberInput
                  min={0.001}
                  max={5}
                  step={0.1}
                  digits={3}
                  state={formState.$.cutPartStartTimeDuration}
                />
                <InputGroupItem>秒</InputGroupItem>
              </InputGroup>
            </div>
            {/* TODO 支持私有云 */}
            <Prompt>限截取 5 秒。更长时间的动图，请采用异步处理方式，<Link href="https://portal.qiniu.com/dora/media-gate/template/recommend">配置视频转动图工作流</Link></Prompt>
          </FormItem>
        )
      }
      <FormItem label="封面缩放" {...formItemLayout}>
        <Select state={formState.$.coverScaleType} className={styles.expandedInput}>
          {coverScaleTypes.map(type => (
            <SelectOption key={type} value={type}>{coverScaleTypeNameMap[type]}</SelectOption>
          ))}
        </Select>
        {
          formState.$.coverScaleType.value !== CoverScaleType.None && (
            <div style={{ display: 'flex', marginTop: '12px' }}>
              {
                [
                  CoverScaleType.ScaleWidth,
                  CoverScaleType.ScaleWidthHeight
                ].includes(formState.$.coverScaleType.value)
                && (
                  <>
                    <FormItem
                      state={formState.$.coverScaleWidth}
                      className={styles.coverScaleTypeSubFormItem}
                    >
                      <div className={styles.coverScaleTypeSubFormItemContent}>
                        <span className={styles.inputLabel}>宽度</span>
                        <InputGroup style={{ width: '140px' }}>
                          <NumberInput
                            min={20}
                            digits={0}
                            state={formState.$.coverScaleWidth}
                            inputProps={{ onBlur: () => handleDimensionChange('width') }}
                          />
                          <InputGroupItem>PX</InputGroupItem>
                        </InputGroup>
                      </div>
                    </FormItem>
                  </>
                )
              }
              {
                [
                  CoverScaleType.ScaleHeight,
                  CoverScaleType.ScaleWidthHeight
                ].includes(formState.$.coverScaleType.value)
                && (
                  <>
                    <FormItem
                      state={formState.$.coverScaleHeight}
                      className={styles.coverScaleTypeSubFormItem}
                    >
                      <div className={styles.coverScaleTypeSubFormItemContent}>
                        <span className={styles.inputLabel}>高度</span>
                        <InputGroup style={{ width: '140px' }}>
                          <NumberInput
                            min={20}
                            digits={0}
                            state={formState.$.coverScaleHeight}
                            inputProps={{ onBlur: () => handleDimensionChange('height') }}
                          />
                          <InputGroupItem>PX</InputGroupItem>
                        </InputGroup>
                      </div>
                    </FormItem>
                  </>
                )
              }
            </div>
          )
        }
      </FormItem>
      {
        formState.$.coverType.value === CoverType.Dynamic && (
          <FormItem
            {...formItemLayout}
            label={<>缩放自适应 <HelpIcon onClick={() => setScaleHelpDrawerVisible(true)} className={styles.helpIcon} /></>}
          >
            <Select state={formState.$.scaleAutoAdapt} className={styles.expandedInput}>
              {coverAutoScaleTypes.map(type => (
                <SelectOption key={type} value={type}>{coverAutoScaleTypeNameMap[type]}</SelectOption>
              ))}
            </Select>
          </FormItem>
        )
      }
      <FormItem label="结果自动保存" {...formItemLayout} labelWidth="90px" className={styles.persistence} tip={persistenceTipView}>
        <div style={{ marginTop: 5 }}>
          <Switch checked disabled />
        </div>
      </FormItem>
      <Drawer
        width={560}
        footer={null}
        title="缩放自适应"
        visible={scaleHelpDrawerVisible}
        onCancel={() => setScaleHelpDrawerVisible(false)}
      >
        <div className={styles.scaleHelpContent}>
          <p>1、不启用时，会强制缩放到目标分辨率，可能造成视频变形。</p>
          <p>2、autoscale/1，原视频比例(A)和目标分辨率比例(B)进行比对，比例=宽/高；</p>
          <ul>
            <li>若 A&#62;B，原视频按照目标分辨率的高进行缩放</li>
            <li>若 A&#62;B，原视频按照目标分辨率的宽进行缩放</li>
          </ul>
          <p>3、autoscale/2，原视频比例(A)和目标分辨率比例(B)进行比对，比例=宽/高；</p>
          <ul>
            <li>若 A&#60;B，原视频按照目标分辨率的高进行缩放，再放到目标分辨率矩形框内，并填充黑边</li>
            <li>若 A&#62;B，原视频按照目标分辨率的宽进行缩放，再放到目标分辨率矩形框内，并填充黑边</li>
          </ul>
          <p style={{ marginTop: '24px' }}><strong>示例：原视频(1280 x 720)，A(1.78)；目标分辨率(800 x 400)，B(2)</strong></p>
          <p>1、使用 autoscale/1，A&#60;B，此时按照高进行缩放，结果文件分辨率为 710 x 400</p>
          <p>2、使用 autoscale/2，A&#60;B，此时按照高进行缩放，原视频缩放为 710 x 400，再放入 800 x 400 的矩形框，并填充黑边</p>
        </div>
      </Drawer>
    </>
  )
})
