/**
 * @file 空间备注
 */

import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Button } from 'react-icecream-2'
import { Form, Input } from 'react-icecream/lib'
import { useFormstateX } from 'react-icecream-2/form-x'
import { bindTextArea, bindFormItem } from 'portal-base/common/form'

import { BucketStore } from 'kodo/stores/bucket'

import { RemarkApis } from 'kodo/apis/bucket/setting/remark'

import SettingCard from '../Card'

import styles from './style.m.less'

function createState(initRemark = '') {
  const remark = new FieldState(initRemark).validators(validateRemarkFormat)
  return new FormState({ remark })
}

function validateRemarkFormat(value: string) {
  if (value.length > 100) {
    return '不能超过 100 个字符'
  }
}

type Props = {
  bucketName: string
}
export default observer(function RemarkCard({ bucketName }: Props) {
  const remarkApis = useInjection(RemarkApis)
  const toaster = useInjection(ToasterStore)
  const bucketStore = useInjection(BucketStore)
  const [loading, setLoading] = useState(false)
  const bucket = bucketStore.getDetailsByName(bucketName)
  const state = useFormstateX(() => createState(bucket?.remark), [bucket?.remark])
  const isUnmountedRef = useRef(false)

  useEffect(() => () => {
    isUnmountedRef.current = true
  }, [])

  async function handleSubmit() {
    const validation = await state.validate()

    if (validation.hasError) {
      return
    }

    const remark = state.value.remark

    setLoading(true)

    const promise = remarkApis
      .setRemark(bucketName, remark)
      .then(() => {
        if (isUnmountedRef.current) return
        bucketStore.fetchDetailsByName(bucketName)
      })
      .finally(() => {
        if (isUnmountedRef.current) return
        setLoading(false)
      })

    toaster.promise(promise, '保存成功')
  }

  return (
    <SettingCard
      title="空间备注"
      tooltip="可以为空间添加描述说明，便于区分每个空间的用途。为空则不启用空间备注功能。"
      doc="bucketRemark"
      className={styles.card}
    >
      <div className={styles.content}>
        <Form onSubmit={() => handleSubmit()}>
          <Form.Item {...bindFormItem(state.$.remark)}>
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 2 }}
              {...bindTextArea(state.$.remark)}
              placeholder="支持中文、大小写英文字母、数字等，不超过 100 个字符"
              className={styles.textarea}
            />
          </Form.Item>
        </Form>
        <div><Button type="primary" onClick={() => handleSubmit()} loading={loading}>确定</Button></div>
      </div>
    </SettingCard>
  )
})
