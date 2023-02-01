import React, { useCallback } from 'react'
import { Observer, observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'
import { ToasterStore } from 'portal-base/common/toaster'
import { useFormstateX, FormItem, TextArea } from 'react-icecream-2/form-x'
import { Table, Modal, TableColumnOptions, ModalProps, ModalFooter, ModalFooterProps, Alert, Link, Button } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'

import { getCDNRefreshLogsPath } from 'kodo/routes/cdn'

import { CdnApiException, CdnApis, RefreshCdnSurplus } from 'kodo/apis/cdn'
import { TaskState, useQueue } from './queue'
import { RefreshCdnStore } from './store'

import style from './style.m.less'

export interface TableData {
  url: string
  taskError?: string
  taskState?: TaskState
}

const stateNameMap: Record<TaskState, string> = {
  ready: '待处理',
  failure: '提交失败',
  success: '提交成功',
  processing: '提交中'
}

function createFormState(urls: string[]) {
  return new FormState(urls.map(url => {
    const urlField = new FieldState(url)
    const editField = new FieldState(false)
    urlField.validators(value => {
      if (!value) return '不能为空'
      if (/\s/.test(value)) return '请勿输入换行、空格等空白字符'
      if (!/^https?:\/\//.test(value)) return '必须以 http:// 或 https:// 开头'
    })

    return new FormState({
      url: urlField,
      edit: editField
    })
  }))
}

function StateText<T extends TableData>(props: { task: T }) {
  const { taskState = 'ready' } = props.task
  if (props.task.taskError && taskState === 'failure') {
    return (<span className={style.failure}>{props.task.taskError}</span>)
  }

  return (
    <span className={style[taskState]}>
      {stateNameMap[taskState]}
    </span>
  )
}

interface UrlFormItemProps {
  disabled: boolean
  onBlur: () => void
  state: FieldState<string>
}

const UrlFormItem = observer(function UrlFormItem(props: UrlFormItemProps) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!textAreaRef.current) return
    textAreaRef.current.selectionStart = textAreaRef.current.value.length
  }, [])

  const handleBlur = React.useCallback(async () => {
    const result = await props.state.validate()
    if (result.hasError) props.state.set(props.state.$)
    props.onBlur()
  }, [props])

  return (
    <FormItem size="small" state={props.state}>
      <TextArea
        autoSize
        size="small"
        state={props.state}
        disabled={props.disabled}
        style={{ width: '100%' }}
        textareaProps={{
          rows: 1,
          ref: textAreaRef,
          autoFocus: true,
          onBlur: handleBlur,
          className: style.textArea
        }}
      />
    </FormItem>
  )
})

export const RefreshCdnModal = observer(function _RefreshCdnModal() {
  const cdnApis = useInjection(CdnApis)
  const noSurplusRef = React.useRef(false)
  const toasterStore = useInjection(ToasterStore)
  const { urls, visible, close } = useInjection(RefreshCdnStore)
  const [surplus, setSurplus] = React.useState<RefreshCdnSurplus | null>(null)
  const formState = useFormstateX(createFormState, [urls])

  const initialTask = React.useMemo(() => {
    if (!visible) return []

    return urls.map((url, index) => ({
      url,
      taskState: 'ready' as TaskState,
      run: async () => {
        if (noSurplusRef.current) throw '无剩余额度'

        const fieldState = formState.$[index]
        const fieldSafeValue = fieldState.$.url.$
        return cdnApis.refreshCdn({
          product: 'cdn',
          urls: [fieldSafeValue]
        }).catch(error => {
          if (error instanceof CdnApiException) {
            if (error.code === 400034) {
              noSurplusRef.current = true
            }
          }

          if (error && 'message' in error) {
            throw error.message
          }

          throw error
        })
      }
    }))
  }, [visible, urls, formState.$, cdnApis])

  const refreshCdnSurplus = useCallback(() => {
    const promise = cdnApis.getRefreshCdnSurplus()
    toasterStore.promise(promise)
    promise.then(data => {
      setSurplus(data)
    })
  }, [cdnApis, toasterStore])

  const handleDone = React.useCallback((tasks: TableData[]) => {
    if (tasks.length > 1) refreshCdnSurplus()

    if (tasks.length !== 1) return
    if (tasks[0].taskState !== 'success') return
    toasterStore.success('刷新任务完成')
    close([])
  }, [close, refreshCdnSurplus, toasterStore])

  const { start, retry, state, tasks } = useQueue({
    list: initialTask,
    onDone: handleDone
  })

  React.useEffect(() => {
    setSurplus(null)
    noSurplusRef.current = false
    if (visible) refreshCdnSurplus()
  }, [refreshCdnSurplus, visible])

  const unsuccessTasks = React.useMemo(() => {
    if (state === 'ready') return tasks
    // 这个数据只在处理结束时消费，所以在处理中就直接
    // 返回个空数组，减少下面的遍历了
    if (state === 'working') return []

    return tasks.filter(task => (
      task.taskState !== 'success'
    ))
  }, [state, tasks])

  const tableColumns = React.useMemo<Array<TableColumnOptions<TableData>>>(() => {
    const column: Array<TableColumnOptions<TableData>> = [
      {
        title: '链接',
        accessor: 'url',
        render: (_, __, index) => {
          const urlFormstate = formState.$[index]
          return (
            <Observer render={() => {
              if (urlFormstate.$.edit.$) {
                return (
                  <UrlFormItem
                    state={urlFormstate.$.url}
                    disabled={state !== 'ready'}
                    onBlur={() => urlFormstate.$.edit.onChange(false)}
                  />
                )
              }

              return (
                <div className={style.urlColumn}>
                  <span className={style.urlText}>
                    {urlFormstate.$.url.value}
                  </span>
                  {state === 'ready' && (
                    <Button
                      type="link"
                      size="small"
                      className={style.urlEditButton}
                      onClick={() => urlFormstate.$.edit.onChange(true)}
                    >
                      编辑
                    </Button>
                  )}
                </div>
              )
            }} />
          )
        }
      }
    ]

    column.push({
      title: '状态',
      width: '80px',
      accessor: 'taskState',
      render: (_, record) => (<StateText task={record} />)
    })

    return column
  }, [formState.$, state])

  const modalHandles = React.useMemo<Partial<ModalProps>>(() => {
    let okButtonHandler = start
    const footerOptions: ModalFooterProps = {}
    footerOptions.okButtonProps = {
      type: 'primary'
    }

    // 正在处理时按钮全部禁用
    if (state === 'working') {
      footerOptions.okButtonProps = {
        disabled: true
      }
      footerOptions.cancelButtonProps = {
        disabled: true
      }
    }

    if (state === 'done') {
      // 有失败的任务切还有剩余额度显示重试按钮
      if (unsuccessTasks.length > 0 && !noSurplusRef.current) {
        footerOptions.okText = '重试'
        okButtonHandler = retry
      } else {
        footerOptions.okButtonProps = {
          disabled: true
        }
      }

      footerOptions.cancelText = '退出'
    }

    return {
      onOk: okButtonHandler,
      onCancel: () => {
        if (state === 'working') return
        close(unsuccessTasks.map(i => i.url))
      },
      footer: (<ModalFooter {...footerOptions} />)
    }
  }, [start, state, unsuccessTasks, retry, close])

  const modalTitle = React.useMemo(() => {
    if (state === 'working') {
      return `正在处理 ${urls.length} 个链接`
    }

    if (state === 'done') {
      const unsuccess = (<span className={style.failure}>{unsuccessTasks.length}</span>)
      const success = (<span className={style.success}>{urls.length - unsuccessTasks.length}</span>)
      return <>刷新任务完成，成功 {success} 个，失败 {unsuccess} 个</>
    }

    if (urls.length === 1) {
      return '请确认是否刷新以下链接的 CDN 缓存？'
    }

    return `确定要刷新 ${urls.length} 个链接吗？`
  }, [urls, state, unsuccessTasks.length])

  const alertMessage = React.useMemo(() => {
    if (surplus == null) return
    const linkView = <Link target="_blank" href={getCDNRefreshLogsPath()}>点击查看刷新记录</Link>
    return (
      <>
        每天缓存刷新额度 {surplus?.urlQuotaDay} 个，当前剩余：{surplus?.urlSurplusDay}。
        {linkView}
      </>
    )
  }, [surplus])

  return (
    <Modal
      autoDestroy
      width={720}
      visible={visible}
      title={modalTitle}
      maskClickable={false}
      {...modalHandles}
    >
      {surplus && (
        <Alert
          message={alertMessage}
          className={style.alert}
        />
      )}
      <Table<TableData>
        fixHead
        size="small"
        border="none"
        records={tasks}
        pagination={false}
        columns={tableColumns}
        className={style.table}
        style={{ maxHeight: '394px' }}
      />
    </Modal>
  )
})
