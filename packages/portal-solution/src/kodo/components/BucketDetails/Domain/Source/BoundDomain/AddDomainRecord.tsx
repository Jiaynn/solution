/**
 * @file AddDomainRecord component
 * @description 提醒用户去添加域名记录（CNAME or A）
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Form, Modal } from 'react-icecream/lib'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { InjectFunc } from 'qn-fe-core/di'

import { DomainStore } from 'kodo/stores/domain'
import { BucketStore } from 'kodo/stores/bucket'

import { DomainScope, IPPattern } from 'kodo/constants/domain'

import baseStyles from './style.m.less'
import styles from './add-domain-record.m.less'

export interface IProps {
  domainScope: DomainScope
  bucketName: string
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
} as const

@observer
class AddDomainRecord extends React.Component<IProps & { inject: InjectFunc }> {
  constructor(props: IProps & { inject: InjectFunc }) {
    super(props)
    makeObservable(this)
  }

  @autobind
  copyFeedback(_: string, state: boolean) {
    const toasterStore = this.props.inject(Toaster)

    if (state) {
      toasterStore.info('已成功拷贝到剪切板')
    } else {
      toasterStore.error('拷贝失败')
    }
  }

  // 空间对应的 region 的 host 值
  // 用于用户添加解析记录到域名
  @computed
  get regionBoundSourceHost() {
    const { bucketName, domainScope } = this.props
    const bucketStore = this.props.inject(BucketStore)
    const bucketDetails = bucketStore.getDetailsByName(bucketName)

    if (!bucketDetails) {
      return '--'
    }

    const region = bucketDetails.region
    const domainStore = this.props.inject(DomainStore)
    const sourceHost = domainStore.getSourceHostByRegion(region, domainScope)

    return sourceHost || '--'
  }

  // 域名的解析记录类型
  @computed
  get domainRecordType() {
    // 如果是 IP 只能是 A 记录，否则同意使用 CNAME
    return IPPattern.test(this.regionBoundSourceHost) ? 'A' : 'CNAME'
  }

  render() {
    return (
      <Form layout="horizontal" className={baseStyles.fromItem}>
        <span className={styles.sourceHostFormPrompt}>
          请将已绑定的域名通过&nbsp;{this.domainRecordType}&nbsp;
          记录解析到以下地址、以保证能正常访问空间。
        </span>
        <Form.Item {...formItemLayout}>
          <div className={baseStyles.formValue}>
            <span className={baseStyles.ellipsis}>
              {this.regionBoundSourceHost}
            </span>
            <CopyToClipboard
              onCopy={this.copyFeedback}
              className={baseStyles.copyBtn}
              text={this.regionBoundSourceHost}
            >
              <a href="javascript:;">点击复制</a>
            </CopyToClipboard>
          </div>
        </Form.Item>
      </Form>
    )
  }
}

// 提示用户去添加解析记录
export function showBoundSuccessModal(inject: InjectFunc, bucketName: string, domainScope: DomainScope): void {
  Modal.success({
    width: 376,
    okText: '关闭',
    title: '源站域名绑定成功',
    className: styles.modal,
    content: <AddDomainRecord inject={inject} bucketName={bucketName} domainScope={domainScope} />
  })
}
