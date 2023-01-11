/**
 * @file region apply component
 * @author yinxulai <me@yinxulai.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Button, Form, FormItem, Link, Modal } from 'react-icecream-2'
import { Checkbox, Radio, RadioGroup } from 'react-icecream-2/form-x'

import { RegionApplyStore } from 'kodo/stores/region-apply'
import { ConfigStore } from 'kodo/stores/config'

import Prompt from 'kodo/components/common/Prompt'
import { Description } from '../Description'

import styles from './style.m.less'

const formItemLayout = {
  layout: 'vertical'
} as const

export const ApplyRegionModal = observer(function _ApplyRegionModal() {
  const configStore = useInjection(ConfigStore)
  const store = useInjection(RegionApplyStore)

  const { region, estimatedCapacity, agreeUserAgreement, visible } = store
  if (!configStore.isFullLoaded || !visible || region == null) return null

  const regionInfo = configStore.getRegion({ region })
  if (regionInfo == null) return null

  return (
    <Modal
      footer={null}
      visible={visible}
      title="区域开通申请"
      onOk={store.submit}
      onCancel={store.close}
      className={styles.applyRegionModal}
    >
      <Form {...formItemLayout} footer={null} onSubmit={store.submit}>
        {
          regionInfo.apply.form.description && (
            <Prompt type="assist" className={styles.prompt}>
              <Description dangerouslyText={regionInfo.apply.form.description} />
            </Prompt>
          )
        }
        <FormItem label="1. 您要申请开通使用的区域">
          <div className={styles.regionName}>
            {regionInfo.name}
          </div>
        </FormItem>
        <FormItem label="2. 预计您在该区域的存储容量量级是">
          <RadioGroup state={estimatedCapacity}>
            {regionInfo.apply.form.expectedUsage.map(item => (
              <Radio className={styles.radio} key={item.key} value={item.key}>{item.name}</Radio>
            ))}
          </RadioGroup>
        </FormItem>
        <Checkbox state={agreeUserAgreement} className={styles.userAgreement}>
          我已阅读知晓，该区域的<Link target="_blank" href={regionInfo.apply.form.agreementUrl}>使用限制</Link>。
        </Checkbox>
        <div className={styles.button}>
          <Button onClick={store.submit} type="primary">
            提交
          </Button>
        </div>
      </Form>
    </Modal>
  )
})
