/**
 * @description media style base drawer
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Button, Drawer, PopupContainerProvider, WarningDialog } from 'react-icecream-2'

import { BucketStore } from 'kodo/stores/bucket'

import { useEvent } from 'kodo/hooks'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'

import { ImageForm } from '../../image'
import { VideoCoverForm } from '../../video/Cover'
import { WatermarkForm } from '../../video/Watermark'
import { TranscodeForm } from '../../video/Transcode'

import { ManualForm } from '../../manual'

import {
  getSourceFormat,
  getStyledFileKey,
  isForcePersistence,
  isLikeCommands,
  useCommands
} from '../command'

import { MediaStyleParsing } from '../MediaStyleParsing'
import { FileInfo } from '../Preview/Content'
import { MediaStyleType } from '../constants'
import { FormController } from '../types'
import Preview from '../Preview'

import styles from './style.m.less'

const titleSuffixNameMap = {
  [MediaStyleType.Manual]: '样式',
  [MediaStyleType.Image]: '图片处理样式',
  [MediaStyleType.VideoCover]: '视频封面样式',
  [MediaStyleType.VideoWatermark]: '视频水印样式',
  [MediaStyleType.VideoTranscode]: '视频转码样式'
}

// 获取数组中的重复元素
function getRepeatedElement(array: string[]): string[] {
  const uniqueSet = new Set<string>()
  const repeatedList = new Array<string>()

  for (const name of array) {
    if (uniqueSet.has(name)) {
      repeatedList.push(name)
    } else {
      uniqueSet.add(name)
    }
  }

  return repeatedList
}

function useDialogState() {
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [visible, setVisible] = React.useState(false)

  const open = React.useCallback((options: { title: string, content: string }) => {
    setTitle(options.title)
    setContent(options.content)
    setVisible(true)
  }, [])

  const close = React.useCallback(() => {
    setTitle('')
    setContent('')
    setVisible(false)
  }, [])

  return { open, close, title, content, visible }
}

export interface Props {
  region: string
  bucketName: string

  isEditMode?: boolean
  initType?: MediaStyleType // 当前打开的图形化编辑表单类型，如果不指定，则由内部根据 initStyle 进行推导，如果没有匹配任何一种类型，则进入手动编辑模式
  initStyle?: MediaStyle // 如果提供该值，则进入编辑模式，如果指定了 isEditMode 为 false，则进入快速创建模式
  initFileObject?: FileInfo // 如果提供该值，则禁止修改输入输出格式，且选中此文件预览

  visible: boolean
  onClose: (
    success: boolean,
    newStyleList?: MediaStyle[],
    allStyleList?: MediaStyle[]
  ) => void // success 代表是成功时关闭还是取消关闭
}

// 多媒体编辑/创建的公共 Drawer
export const MediaStyleDrawer = observer(function MediaStyleDrawer(props: Props) {
  const { region, bucketName, visible, onClose, initFileObject } = props

  const isEditMode = props.isEditMode ?? !!props.initStyle

  const commands = useCommands()
  const dialog = useDialogState()
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const mediaStyleList = bucketStore.getMediaStyleListByName(bucketName)

  const [isSubmitting, setIsSubmitting] = React.useState(false) // 是否正在提交中
  const [style, setStyle] = React.useState<MediaStyle | undefined>() // 当前表单用来初始化的 style
  const [type, setType] = React.useState<MediaStyleType | null>(null) // 当前表单的类型
  const [previewFileKey, setPreviewFileKey] = React.useState<string | undefined>() // 当前的预览文件名
  const [editingStyle, setEditingStyle] = React.useState<MediaStyle | undefined>(props.initStyle) // 正在编辑中的样式
  const [formController, setFormController] = React.useState<FormController>() // 当前 form 的 controller

  const formViewRef = React.useRef<HTMLDivElement>(null)

  // 公共的重复性校验，抽出来在提交前统一处理，避免每个 form 表单做一次
  const handleRepeatedValidator = React.useCallback(() => {
    if (formController == null) return true
    const newStyles = formController.getStyleList(true)

    if (!isEditMode) {
      // 校验本次是否存在重复的源文件格式限制
      // 单次添加针对同一个格式的多个不同的处理样式可能是不合适的，所以要检查一下
      const repeatedSourceFormatList = getRepeatedElement(
        newStyles
          .map(item => getSourceFormat(item.commands))
          .filter((value: string | null): value is string => Boolean(value))
      )

      if (repeatedSourceFormatList.length > 0) {
        const repeatedStr = repeatedSourceFormatList.join('、')
        toasterStore.error(`请勿批量创建针对相同源文件格式的样式: ${repeatedStr}，修改后重试`)
        return true
      }

      // 整体校验一下最终的样式名称是否存在重复
      const allStyleNameList: string[] = [
        ...newStyles.map(item => item.name),
        ...(mediaStyleList || []).map(item => item.name)
      ]

      const repeatedNameList = getRepeatedElement(allStyleNameList)

      if (repeatedNameList.length > 0) {
        const repeatedStr = repeatedNameList.join('、')
        toasterStore.error(`样式名已存在: ${repeatedStr}，请修改后重试`)
        return true
      }
    }

    return false
  }, [mediaStyleList, formController, isEditMode, toasterStore])

  const handleSaveSuccess = React.useCallback(async (length: number, allStyleList: MediaStyle[]) => {
    const list = formController?.getStyleList()

    onClose(true, isEditMode ? undefined : list, allStyleList)

    const messagePrefix = isEditMode ? '更新' : '创建'
    toasterStore.success(`${messagePrefix} ${length} 条样式成功`)
  }, [formController, isEditMode, onClose, toasterStore])

  // 更新当前空间的配置
  const handleSaveStyle = React.useCallback(async () => {
    if (formController == null) return

    // 针对表单的内部校验状态进行一下确认
    const validatedResult = await formController.validate()

    const { hasError, error } = typeof validatedResult === 'boolean'
      ? { hasError: validatedResult, error: '' }
      : validatedResult

    if (error) {
      toasterStore.exception(error)
    }

    if (hasError) {
      return
    }

    // 校验一下整体的重复性
    const hasRepeated = handleRepeatedValidator()
    if (hasRepeated) return

    const styleList = formController.getStyleList(false)

    if (styleList.length === 0) return

    const curType = await commands.getMediaStyleType(styleList[0])

    setIsSubmitting(true)
    toasterStore.promise(imageStyleApis.saveImageStyle(bucketName, styleList, curType))
      .then(allStyleList => handleSaveSuccess(styleList.length, allStyleList))
      .finally(() => setIsSubmitting(false))
  }, [bucketName, commands, formController, handleRepeatedValidator, handleSaveSuccess, imageStyleApis, toasterStore])

  // 切换当前的表单类型
  const handleSwitchType = React.useCallback(async () => {
    if (editingStyle == null) return

    const newStyleType = await commands.getMediaStyleType(editingStyle)

    // 创建模式时切换的错误提示
    const showCreateSwitchWarnModal = () => {
      dialog.open({
        title: '无法切换到图形化视图',
        content: '当前包含图形化视图不支持的命令、参数或格式，导致暂时无法进行图形化编辑'
      })
    }

    // 编辑模式时切换的错误提示
    const showEditSwitchWarnModal = () => {
      dialog.open({
        title: '无法切换到图形化视图',
        content: '代码视图下修改源文件格式或输出格式后无法再切换到图形化视图'
      })
    }

    // 当前处于手动编辑的模式，则需要切换到图形化的模式
    if (type === MediaStyleType.Manual) {
      // 新的样式类型还是手动模式，说明没有可视化模式支持
      if (newStyleType === MediaStyleType.Manual) {
        return showCreateSwitchWarnModal()
      }

      // 检查在编辑模式下切换回图形模式的额外条件
      if (isEditMode && style != null) {
        const oldStyleType = await commands.getMediaStyleType(style)
        // 编辑模式不能改变样式的主要类型
        if (oldStyleType !== newStyleType) {
          return showEditSwitchWarnModal()
        }

        // 源文件的格式不能改
        const sourceFormatChanged = getSourceFormat(style.commands)
          !== getSourceFormat(editingStyle.commands)
        if (sourceFormatChanged) {
          return showEditSwitchWarnModal()
        }

        // 输出格式不能改
        const isEqual = await commands.isEqualOutputFormat(newStyleType, style, editingStyle)
        if (!isEqual) return showEditSwitchWarnModal()
      }

      setStyle(editingStyle)
      return setType(newStyleType)
    }

    // 当前处于图形化编辑模式，切换到手动编辑模式
    setStyle(editingStyle)
    return setType(MediaStyleType.Manual)
  }, [editingStyle, commands, type, dialog, isEditMode, style])

  const formInitValue = React.useMemo<MediaStyle[]>(() => {
    if (style == null) return []
    if (!isEditMode) return [style]
    // 在编辑模式下，将除了当前编辑的 style 之外
    // code 中属于 dora 的部分相同的样式作为
    // 批量编辑的样式传给表单
    return [style, ...(mediaStyleList || []).filter(item => (
      item.name !== style.name
      && isLikeCommands(item.commands, style.commands)
    ))]
  }, [isEditMode, mediaStyleList, style])

  const shouldForcePersistence = React.useMemo(() => {
    if (editingStyle == null || !editingStyle.commands) return false
    return isForcePersistence(editingStyle.commands)
  }, [editingStyle])

  // 持久化保存时的文件 key（和预览当前选择的文件有关）
  const persistenceFileKey = React.useMemo(() => {
    // 没有样式名和没有预览文件名时隐藏
    if (!editingStyle || !editingStyle.name || !previewFileKey) return undefined
    return getStyledFileKey(previewFileKey, editingStyle)
  }, [editingStyle, previewFileKey])

  const switchCurrentTypeView = React.useMemo(() => type && (
    <Button type="link" className={styles.switchTypeButton} onClick={handleSwitchType}>
      {type === MediaStyleType.Manual ? '图形化视图' : '代码视图'}
    </Button>
  ), [handleSwitchType, type])

  const sourceFormat = React.useMemo(() => {
    if (initFileObject == null) {
      return
    }

    return initFileObject.key.includes('.')
      ? initFileObject.key.split('.').pop() // 扩展名
      : '' // 如果没有文件名则是所有格式
  }, [initFileObject])

  // 当前类型的表单
  const currentTypeFormView = React.useMemo(() => {
    if (!visible) return null
    if (type === MediaStyleType.Image) {
      return (
        <ImageForm
          bucketName={bucketName}
          isEditMode={isEditMode}
          initStyles={formInitValue}
          initSourceFormat={sourceFormat}
          onStyleChange={setEditingStyle}
          onCreateController={setFormController}
          persistenceFileKey={persistenceFileKey}
          isForcePersistence={shouldForcePersistence}
        />
      )
    }

    if (type === MediaStyleType.VideoCover) {
      return (
        <VideoCoverForm
          isEditMode={isEditMode}
          initStyles={formInitValue}
          initSourceFormat={sourceFormat}
          onStyleChange={setEditingStyle}
          onCreateController={setFormController}
          persistenceFileKey={persistenceFileKey}
        />
      )
    }

    if (type === MediaStyleType.VideoTranscode) {
      return (
        <TranscodeForm
          region={region}
          isEditMode={isEditMode}
          initStyles={formInitValue}
          previewFileKey={previewFileKey}
          initSourceFormat={sourceFormat}
          onStyleChange={setEditingStyle}
          onCreateController={setFormController}
          persistenceFileKey={persistenceFileKey}
          isForcePersistence={shouldForcePersistence}
        />
      )
    }

    if (type === MediaStyleType.VideoWatermark) {
      return (
        <WatermarkForm
          region={region}
          bucket={bucketName}
          isEditMode={isEditMode}
          initStyles={formInitValue}
          initSourceFormat={sourceFormat}
          onStyleChange={setEditingStyle}
          onCreateController={setFormController}
          persistenceFileKey={persistenceFileKey}
          isForcePersistence={shouldForcePersistence}
          defaultType={MediaStyleType.VideoWatermark}
        />
      )
    }

    if (type === MediaStyleType.Manual) {
      return (
        <ManualForm
          isEditMode={isEditMode}
          initValue={formInitValue}
          onStyleChange={setEditingStyle}
          onCreateController={setFormController}
          persistenceFileKey={persistenceFileKey}
          isForcePersistence={shouldForcePersistence}
        />
      )
    }

    return (<MediaStyleParsing />)
  }, [
    bucketName, formInitValue, isEditMode, persistenceFileKey, region,
    shouldForcePersistence, sourceFormat, type, visible, previewFileKey
  ])

  // 当前类型的预览
  const currentTypePreviewView = React.useMemo(() => {
    if (!visible) return null
    if (!type || !editingStyle) return (<MediaStyleParsing />)

    return (
      <Preview
        type={type}
        style={editingStyle}
        bucketName={bucketName}
        defaultPreviewFile={initFileObject}
        onFileKeyChange={setPreviewFileKey}
      />
    )
  }, [bucketName, initFileObject, editingStyle, type, visible])

  const operationGroupView = React.useMemo(() => type && (
    <div className={styles.operationGroup}>
      <Button type="primary" disabled={isSubmitting} loading={isSubmitting} onClick={handleSaveStyle}>保存样式</Button>
      <Button onClick={() => onClose(false)} disabled={isSubmitting}>取消</Button>
    </div>
  ), [handleSaveStyle, isSubmitting, onClose, type])

  // 初始化时设置 type
  const initializeType = () => {
    // 外面指定了则根据指定的样式来
    if (props.initType != null) {
      setType(props.initType)
      return
    }

    // 没指定 type 但是又没有传入数据则进入手动编辑模式
    if (props.initStyle == null) {
      setType(MediaStyleType.Manual)
      return
    }

    commands.getMediaStyleType(props.initStyle).then(newType => setType(newType))
  }

  const init = useEvent(() => {
    if (visible) {
      initializeType()
      setStyle(props.initStyle)
      setEditingStyle(props.initStyle)
      // 这是从文件列表带过来的默认预览文件
      if (initFileObject) {
        setPreviewFileKey(initFileObject.key)
      }
      return
    }

    // drawer 隐藏的时候清空
    setType(null)
    setStyle(undefined)
    setEditingStyle(undefined)
    setPreviewFileKey(undefined)
  })

  // 最优的是直接用 [] 作为初始化依据，这里由于不是把所有状态放在内部实现里，所以这里用 visible 来作为初始化依据
  React.useEffect(() => {
    init()
  }, [init, visible])

  const drawerTitle = React.useMemo(() => {
    const prefix = isEditMode ? '编辑' : '新建'
    const suffix = type != null ? titleSuffixNameMap[type] : ''
    const quicklyCreatePrefix = (!props.isEditMode && props.initStyle) ? '快速' : ''
    return quicklyCreatePrefix + prefix + suffix
  }, [isEditMode, props.initStyle, props.isEditMode, type])

  return (
    <Drawer
      width={1050}
      footer={null}
      // autoDestroy 设置后无关闭动画
      visible={visible}
      title={drawerTitle}
      onCancel={() => onClose(false)}
    >
      <WarningDialog
        title={dialog.title}
        visible={dialog.visible}
        onOk={() => dialog.close()}
      >
        {dialog.content}
      </WarningDialog>
      <div className={styles.layout}>
        <PopupContainerProvider containerRef={formViewRef}>
          <div ref={formViewRef} className={styles.form}>
            {switchCurrentTypeView}
            {currentTypeFormView}
            {operationGroupView}
          </div>
        </PopupContainerProvider>
        <div className={styles.preview}>
          {currentTypePreviewView}
        </div>
      </div>
    </Drawer>
  )
})
