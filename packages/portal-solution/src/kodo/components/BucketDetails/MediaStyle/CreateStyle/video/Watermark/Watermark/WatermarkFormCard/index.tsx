/**
 * @description watermark form of video watermark
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { bindInput, FieldState, FormState } from 'formstate-x'
import { Button, Collapse, CollapsePanel, InputGroup, InputGroupItem, SelectOption } from 'react-icecream-2'
import { FormItem, NumberInput, Radio, RadioGroup, Select, Switch, TextInput } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import { integerValidator, rangeValidator } from 'kodo/utils/form'

import { getKodoResourceProxyUrl } from 'kodo/utils/resource'

import { useEvent, useModalState } from 'kodo/hooks'

import {
  MediaStyleType,
  Origin,
  origins,
  watermarkFontFamily,
  WatermarkMode,
  watermarkOriginTextMap
} from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'
import Prompt from 'kodo/components/common/Prompt'
import { colorReg } from 'kodo/components/BucketDetails/ImageStyle/Drawer/constants'
import ColorPicker from 'kodo/components/BucketDetails/ImageStyle/Drawer/ColorPicker'
import { useObjectPick } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Preview'
import {
  allowWatermarkImageFormatList,
  allowWatermarkImagePickAccept
} from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/image/constants'

import { decodeKodoURI, encodeKodoURI } from '../../../utils'
import Timeline, { createHoursField, createMinutesField, createSecondsField, TimelineType } from './Timeline'
import MostUsedModal from './MostUsedModal'
import Base from './Base'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

export enum RatioType {
  Intrinsic = 'Intrinsic',
  Adaptive = 'Adaptive'
}

export type WatermarkFormItemValue = {
  mode: WatermarkMode // 基本缩放方式
  url: string
  previewUrl: string
  words: string
  fontSize: number
  fontColor: string
  fontFamily: string
  ratioType: RatioType
  ratio: number
  ignoreLoop: boolean
  origin: Origin
  horizontal: number // 水平边距
  vertical: number // 垂直边距
  timelineType: TimelineType
  startHours: number
  startMinutes: number
  startSeconds: number
  duration: number | null
  shortest: boolean
}

export type WatermarkForm = FormState<{
  [key in keyof WatermarkFormItemValue]: FieldState<WatermarkFormItemValue[key]>
}>

export function getDefaultFormItemValue(initVal?: Partial<WatermarkFormItemValue>) {
  return {
    mode: initVal?.mode ?? WatermarkMode.Picture, // 默认为文字水印
    url: initVal?.url ?? '',
    previewUrl: initVal?.previewUrl ?? '',
    words: initVal?.words ?? '',
    fontSize: initVal?.fontSize ?? 32,
    fontColor: initVal?.fontColor ?? '#000000',
    fontFamily: initVal?.fontFamily ?? watermarkFontFamily[7],
    ratioType: initVal?.ratioType ?? (initVal?.ratio ? RatioType.Adaptive : RatioType.Intrinsic),
    ratio: initVal?.ratio ?? 0.75,
    ignoreLoop: initVal?.ignoreLoop ?? true,
    origin: initVal?.origin ?? Origin.NorthEast,
    horizontal: initVal?.horizontal ?? 0,
    vertical: initVal?.vertical ?? 0,
    timelineType: initVal?.timelineType ?? TimelineType.Same,
    startHours: initVal?.startHours ?? 0,
    startMinutes: initVal?.startMinutes ?? 0,
    startSeconds: initVal?.startSeconds ?? 0,
    duration: initVal?.duration ?? 1,
    shortest: initVal?.shortest ?? true
  }
}

export function createWatermarkFormItemState(initVal?: Partial<WatermarkFormItemValue>) {
  const defaultVal = getDefaultFormItemValue(initVal)

  const modeField = new FieldState(defaultVal.mode, 0)

  const ratioTypeField = new FieldState(defaultVal.ratioType)

  const timelineTypeField = new FieldState(defaultVal.timelineType)

  return new FormState({
    mode: modeField,
    url: new FieldState(defaultVal.url)
      .validators(url => !url && '请选择水印图片')
      .disableValidationWhen(() => modeField.value !== WatermarkMode.Picture),
    previewUrl: new FieldState(defaultVal.previewUrl),
    words: new FieldState(defaultVal.words)
      .validators(word => !word && '请输入水印文字')
      .disableValidationWhen(() => modeField.value !== WatermarkMode.Word),
    fontSize: new FieldState(defaultVal.fontSize)
      .validators(rangeValidator([12, 100000]), integerValidator())
      .disableValidationWhen(() => modeField.value !== WatermarkMode.Word),
    fontColor: new FieldState(defaultVal.fontColor)
      .validators(value => !colorReg.test(value) && '请输入十六进制的颜色值')
      .disableValidationWhen(() => modeField.value !== WatermarkMode.Word),
    fontFamily: new FieldState<string>(defaultVal.fontFamily),
    ratioType: ratioTypeField,
    ratio: new FieldState(defaultVal.ratio)
      .validators(
        rangeValidator([0, 1], '输入范围为大于 0，小于等于 1'),
        // eslint-disable-next-line no-nested-ternary
        val => (val === 0 ? '不能为 0' : !val ? '请输入数值' : '')
      )
      .disableValidationWhen(() => (
        ratioTypeField.value !== RatioType.Adaptive
        || modeField.value !== WatermarkMode.Picture
      )),
    ignoreLoop: new FieldState(defaultVal.ignoreLoop),
    origin: new FieldState(defaultVal.origin, 0),
    horizontal: new FieldState(defaultVal.horizontal)
      .validators(integerValidator()) // 水平边距
      .disableValidationWhen(() => modeField.value === WatermarkMode.None),
    vertical: new FieldState(defaultVal.vertical)
      .validators(integerValidator()) // 垂直边距
      .disableValidationWhen(() => modeField.value === WatermarkMode.None),
    timelineType: timelineTypeField,
    startHours: createHoursField(defaultVal.startHours)
      .disableValidationWhen(() => timelineTypeField.value !== TimelineType.Forward),
    startMinutes: createMinutesField(defaultVal.startMinutes)
      .disableValidationWhen(() => timelineTypeField.value !== TimelineType.Forward),
    startSeconds: createSecondsField(defaultVal.startSeconds)
      .disableValidationWhen(() => timelineTypeField.value !== TimelineType.Forward),
    duration: new FieldState(defaultVal.duration)
      .validators(integerValidator(), rangeValidator([1]))
      .disableValidationWhen(() => timelineTypeField.value === TimelineType.Same),
    shortest: new FieldState(defaultVal.shortest)
      .disableValidationWhen(() => timelineTypeField.value === TimelineType.Same)
  })
}

export function createWatermarkFormState(initVal: Array<Partial<WatermarkFormItemValue>> = [{}]) {
  const form = new FormState<WatermarkForm[]>([])
  runInAction(() => {
    initVal.forEach(state => {
      form.$.push(createWatermarkFormItemState(state))
    })
  })
  return form
}

export interface Props {
  bucketName: string
  defaultExpanded: boolean
  activeIndex: FieldState<number>
  formState: ReturnType<typeof createWatermarkFormState>
  onAddItem?: () => void
  onDeleteItem?: (index: number) => void
  onOffsetChange?: (origin: Origin, offsetX: number, offsetY: number) => void
  onSelectMostUsedCommand?: (command: string) => void
}

const CompleteForm = observer((props: Props) => {
  // value 会有延迟，导致 fields 可能会空指针异常
  // eslint-disable-next-line no-underscore-dangle
  const index = props.activeIndex._value
  const fields = props.formState.$[index].$

  const modalState = useModalState()

  const objectPick = useObjectPick(props.bucketName, MediaStyleType.Image)

  const handlePicked = useEvent(async () => {
    runInAction(() => {
      if (!objectPick.file) return
      fields.previewUrl.set(getKodoResourceProxyUrl(objectPick.file))
      fields.url.set(encodeKodoURI(props.bucketName, objectPick.file.key))
    })
  })

  const handleOriginChange = (origin: Origin) => {
    runInAction(() => {
      fields.origin.set(origin)
      fields.vertical.set(0)
      fields.horizontal.set(0)
    })
  }

  const handleSelectMostUsedCommand = (command: string) => {
    props.onSelectMostUsedCommand?.(command)
    modalState.close()
  }

  const modalView = (
    <MostUsedModal
      visible={modalState.visible}
      onCancel={modalState.close}
      onOk={handleSelectMostUsedCommand}
    />
  )

  const [, fileKey] = decodeKodoURI(fields.url.value || '')

  const handlePick = () => objectPick.pick([allowWatermarkImagePickAccept]).then(handlePicked)

  const urlInputView = (
    <FormItem
      label="水印图片"
      state={fields.url}
      {...formItemLayout}
      className={styles.urlInputFormItem}
      tip={<Prompt style={{ margin: 0 }}>只能选择 {allowWatermarkImageFormatList.join('/')} 文件，且不超过 20MB</Prompt>}
    >
      <div className={styles.urlInput}>
        {!!fileKey && (
          <div>
            <MiddleEllipsisSpan key={fileKey} text={fileKey} maxRows={1} />
          </div>
        )}
        <Button
          onClick={handlePick}
          disabled={!objectPick.store.hasPermission(props.bucketName)}
        >
          选择
        </Button>
      </div>
    </FormItem>
  )

  const wordInputView = (
    <FormItem label="水印文字" {...formItemLayout} state={fields.words}>
      <TextInput state={fields.words} placeholder="请输入水印文字" className={styles.urlOrWord} />
    </FormItem>
  )

  const urlOrWordView = fields.mode.value === WatermarkMode.Picture ? urlInputView : wordInputView

  const fontView = fields.mode.value === WatermarkMode.Word && (
    <FormItem label="水印字体" {...formItemLayout}>
      <div className={styles.rowInputWrap}>
        <Select className={styles.fontFamily} placeholder="字体" state={fields.fontFamily}>
          {watermarkFontFamily.map(font => (
            <SelectOption key={font} value={font}>
              {font}
            </SelectOption>
          ))}
        </Select>
        <FormItem state={fields.fontSize}>
          <InputGroup style={{ width: '130px' }}>
            <NumberInput
              digits={0}
              min={12}
              max={100000}
              placeholder="字号"
              state={fields.fontSize}
            />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
        <FormItem state={fields.fontColor}>
          <ColorPicker className={styles.colorPicker} {...bindInput(fields.fontColor)} />
        </FormItem>
      </div>
    </FormItem>
  )

  const ratioNoticeView = fields.ratioType.value === RatioType.Adaptive
    ? <Prompt style={{ margin: 0 }}>指定水印图片的短边与输入视频之间的比例，取值为 (0,1]，数值支持小数点后三位。</Prompt>
    : undefined

  const ratioView = (
    <FormItem
      label="水印尺寸"
      {...formItemLayout}
      state={fields.ratio}
      tip={ratioNoticeView}
      className={styles.ratio}
    // labelVerticalAlign="text"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <RadioGroup state={fields.ratioType}>
          <Radio value={RatioType.Intrinsic}>原始尺寸</Radio>
          <Radio value={RatioType.Adaptive}>自适应大小</Radio>
        </RadioGroup>
        <NumberInput
          digits={3}
          max={1}
          min={0.001}
          step={0.100}
          state={fields.ratio}
          style={{ marginLeft: '16px', opacity: fields.ratioType.value === RatioType.Adaptive ? '1' : '0' }}
        />
      </div>
    </FormItem>
  )

  const ignoreLoopNoticeView = <Prompt style={{ margin: 0 }}>仅对动图生效。开启则动图只循环一次，关闭则动图一直循环。</Prompt>

  const ignoreLoopView = fields.mode.value === WatermarkMode.Picture && (
    <FormItem label="忽略动图循环" {...formItemLayout} tip={ignoreLoopNoticeView} labelVerticalAlign="text">
      <Switch
        checkedChildren="开"
        unCheckedChildren="关"
        state={fields.ignoreLoop}
      />
    </FormItem>
  )

  const ratioOrFontView = fields.mode.value === WatermarkMode.Word ? fontView : ratioView

  const originView = (
    <FormItem label="水印位置" {...formItemLayout}>
      <div className={styles.originWrap}>
        {origins.map(origin => (
          <div
            key={origin}
            className={`${styles.origin} ${origin === fields.origin.value ? styles.selected : ''}`}
            onClick={() => handleOriginChange(origin)}
          >
            {watermarkOriginTextMap[origin]}
          </div>
        ))}
      </div>
      <div className={styles.inputWrap}>
        <FormItem label="水平边距" state={fields.horizontal}>
          <InputGroup style={{ width: '130px' }}>
            <NumberInput
              digits={0}
              state={fields.horizontal}
            />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
        <FormItem label="垂直边距" state={fields.vertical}>
          <InputGroup style={{ width: '130px' }}>
            <NumberInput
              digits={0}
              state={fields.vertical}
            />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
      </div>
    </FormItem>
  )

  return (
    <>
      {modalView}
      <Base
        bucketName={props.bucketName}
        mode={fields.mode.value}
        url={fields.previewUrl.value}
        words={fields.words.value}
        amount={props.formState.$.length}
        activeIndex={props.activeIndex}
        origin={fields.origin.value}
        offsetX={fields.horizontal.$}
        offsetY={fields.vertical.$}
        fontSize={fields.fontSize.$}
        fontColor={fields.fontColor.$}
        onAdd={props.onAddItem}
        onDelete={props.onDeleteItem}
        onChange={props.onOffsetChange}
      />
      <FormItem label="水印类型" {...formItemLayout} state={fields.mode} labelVerticalAlign="text">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <RadioGroup state={fields.mode}>
              <Radio value={WatermarkMode.Picture}>图片水印</Radio>
              <Radio value={WatermarkMode.Word}>文字水印</Radio>
            </RadioGroup>
          </div>
          <Button className={styles.importBtn} type="text" onClick={modalState.open}>导入常用水印</Button>
        </div>
      </FormItem>
      {urlOrWordView}
      {ratioOrFontView}
      {ignoreLoopView}
      {originView}
      <Timeline
        type={fields.timelineType}
        startHours={fields.startHours}
        startMinutes={fields.startMinutes}
        startSeconds={fields.startSeconds}
        duration={fields.duration}
        shortest={fields.shortest}
        style={{ marginBottom: 0 }}
      />
    </>
  )
})

export default observer(function WatermarkFormCard(props: Props) {
  const emptyContentView = (
    <Base
      bucketName={props.bucketName}
      mode={WatermarkMode.Word}
      url=""
      words=""
      amount={props.formState.$.length}
      activeIndex={props.activeIndex}
      origin={Origin.Center}
      offsetX={0}
      offsetY={0}
      fontSize={0}
      fontColor=""
      onAdd={props.onAddItem}
      onDelete={props.onDeleteItem}
    />
  )

  return (
    <div>
      <Collapse defaultValue={props.defaultExpanded ? ['default'] : []}>
        <CollapsePanel title="视频水印" value="default">
          {
            props.formState.$.length
              ? (<CompleteForm {...props} />)
              : emptyContentView
          }
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
