/**
 * @file 校验托管域名 modal 组件
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, reaction, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import Form from 'react-icecream/lib/form'
import Modal from 'react-icecream/lib/modal'
import Disposable from 'qn-fe-core/disposable'
import { bindFormItem } from 'portal-base/common/form'
import { useInjection } from 'qn-fe-core/di'

import { IModalProps } from 'cdn/stores/modal'

import DomainApis from 'cdn/apis/domain'
import { IDomainInfo } from 'cdn/apis/oem/domain-hosting'
import DomainInput, { createState as createFormState } from '../Inputs/Domain'

import './style.less'

export interface IExtraProps {
  item?: IDomainInfo
}

export type IValue = IDomainInfo

export type Props = IModalProps<IValue> & IExtraProps

interface PropsWithDeps extends Props {
  domainApis: DomainApis
}

@observer
class DomainModalInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  formState = createFormState(this.props.domainApis)
  disposable = new Disposable()

  @computed get isEdit() {
    return !!this.props.item
  }

  @computed get extraView() {
    return (
      <div className="extra-view">
        <span>注意：</span>
        <ol>
          <li>1. 仅能添加一条托管域名。</li>
          <li>2. 一旦域名托管生效暂不支持修改。</li>
        </ol>
      </div>
    )
  }

  @autobind handleSubmit() {
    return this.formState.validate().then(result => {
      if (result.hasError) {
        return
      }
      this.props.onSubmit({ ...this.props.item, cname: this.formState.value } as IDomainInfo)
    })
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.item,
      item => { this.formState = createFormState(this.props.domainApis, item && item.cname) },
      { fireImmediately: true }
    ))

    this.disposable.addDisposer(this.formState.dispose)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <Modal
        title={this.isEdit ? '修改托管域名' : '新增托管域名'}
        okText="提交"
        className="comp-domain-hosting-modal"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.handleSubmit}
      >
        <Form layout="inline">
          <Form.Item
            {...bindFormItem(this.formState)}
            extra={this.extraView}
          >
            <DomainInput state={this.formState} />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default function DomainModal(props: Props) {
  const domainApis = useInjection(DomainApis)

  return (
    <DomainModalInner {...props} domainApis={domainApis} />
  )
}
