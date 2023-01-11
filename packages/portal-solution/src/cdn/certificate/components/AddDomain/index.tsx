/*
 * @file component AddDomain
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { useLocalStore } from 'qn-fe-core/local-store'
import Button from 'react-icecream/lib/button'

import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import { certFormData2Display } from '../../transforms/domain'
import LayoutBlock from '../common/LayoutBlock'
import InfoBlock from '../common/InfoBlock'
import DomainForm from './DomainForm'
import StateStore from './store'
import { CertType, SSLDomainType } from '../../constants/ssl'

import './style.less'

export interface ICertFormDomain {
  type: SSLDomainType
  min: number
  max: number
  normal: number
  wildcard: number
}

export interface ICertFormValue {
  certName: string
  certType: CertType
  validYear: number
  dnsNames: string[]
  domain: ICertFormDomain
}

export interface IAddDomainProps {
  id: string
}

export default observer(function _AddDomain(props: IAddDomainProps) {
  const store = useLocalStore(StateStore, props)
  return (
    <PageWithBreadcrumb>
      <div className="add-domain-wrapper">
        <LayoutBlock title="已选证书">
          <InfoBlock
            data={store.certFormData ? certFormData2Display(store.certFormData) : []}
            columnChunk={3}
            className="cert-info-block"
          />
        </LayoutBlock>
        <LayoutBlock title="域名信息">
          <DomainForm {...store.domainFormProps} />
        </LayoutBlock>
        <div className="add-domain-wrapper-footer">
          <Button onClick={() => store.reset()}>重置</Button>
          <Button onClick={() => store.confirm()} type="primary">提交</Button>
        </div>
      </div>
    </PageWithBreadcrumb>
  )
})
