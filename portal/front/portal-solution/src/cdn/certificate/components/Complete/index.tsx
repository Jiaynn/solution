/*
 * @file component Complete
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import Switch from 'react-icecream/lib/switch'
import { useLocalStore } from 'qn-fe-core/local-store'

import { humanizeAreaText } from '../../transforms/complete'
import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import { CompleteType } from '../../constants/domain'
import { sslType, humanizeSSLDomainType, CertType, SSLDomainType } from '../../constants/ssl'
import LayoutBlock from '../common/LayoutBlock'
import DomainForm from './DomainForm'
import { IValue as CompanyFormValue } from '../SSLOverview/Info/Company/Form'
import { IValue as ContactFormValue } from '../SSLOverview/Info/Contact/Form'
import { AppointmentForEdit } from '../Deploy/Appointment'
import { CompanyDrawer } from './CompanyDrawer'
import { ContactDrawer } from './ContactDrawer'
import StateStore from './store'
import { getCertYearTipsByAutoRenew } from '../../utils/certificate'
import InfoBlock, { getDisplayData, InfoRowData } from '../common/InfoBlock'
import InfoCard, { AddInfoCard } from '../common/InfoCard'

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
  domain: ICertFormDomain
  autoRenew: boolean
}

export interface ICompleteProps {
  type: CompleteType,
  id: string
}

export default observer(function _Complete(props: ICompleteProps) {
  const store = useLocalStore(StateStore, props)
  return (
    <PageWithBreadcrumb>
      <Spin spinning={store.isLoading}>
        <div className="complete-wrapper">
          <LayoutBlock title="已选证书" className="cert-info-block">
            <InfoBlock
              data={store.certFormData ? certFormData2Display(store.certFormData) : []}
              columnChunk={3}
            />
          </LayoutBlock>
          <LayoutBlock title="域名信息" style={{ paddingBottom: '8px' }}>
            <DomainForm {...store.domainFormProps} />
          </LayoutBlock>
          <LayoutBlock title="公司信息" style={{ borderBottom: 'none', paddingBottom: '16px' }}>
            {store.companyFormData
            ? (
              <InfoCard
                title={store.companyFormData.name}
                onEdit={() => store.openCompanyDrawer(true, store.companyFormData)}
              >
                <InfoBlock data={companyFormData2Display(store.companyFormData)} />
              </InfoCard>
            )
            : (
              <AddInfoCard>
                <Button onClick={() => store.openCompanyDrawer()} type="link" icon="plus">新增公司信息</Button>
              </AddInfoCard>
            )}
          </LayoutBlock>
          <LayoutBlock title="联系人（授权代表）信息">
            {store.contactFormData
            ? (
              <InfoCard
                title={`${store.contactFormData.lastName}${store.contactFormData.firstName}`}
                onEdit={() => store.openContactDrawer(true, store.contactFormData)}
              >
                <InfoBlock data={contactFormData2Display(store.contactFormData)} />
              </InfoCard>
            )
            : (
              <AddInfoCard>
                <Button onClick={() => store.openContactDrawer()} type="link" icon="plus">新增联系人</Button>
              </AddInfoCard>
            )}
          </LayoutBlock>
          <LayoutBlock title={(
            <span className="cdn-deploy-title">
              部署 CDN
              <Tooltip title="若开启则证书签发后可自动部署至指定 CDN 域名"><Icon className="tip-icon" type="info-circle" /></Tooltip>
              <Switch checked={store.displayDeploy} onChange={newChecked => store.updateDisplayDeploy(newChecked)} className="deploy-switch" />
            </span>
          )}
          >
            {
              store.displayDeploy && (
                <AppointmentForEdit
                  {...store.partialAppointProps}
                  completeType={props.type}
                  onChange={domains => store.updateDomainsToDeploy(domains)}
                />
              )
            }
          </LayoutBlock>
          <div className="complete-wrapper-footer">
            <Button onClick={() => store.reset()}>重置</Button>
            <Button onClick={() => store.confirm()} type="primary">
              {store.needConfirmation ? '提交并下载确认函' : '提交'}
            </Button>
          </div>
          <CompanyDrawer store={store.companyDrawerStore} />
          <ContactDrawer store={store.contactDrawerStore} />
        </div>
      </Spin>
    </PageWithBreadcrumb>
  )
})

export function certFormData2Display(formData: ICertFormValue): InfoRowData[] {
  const domainTexts :string[] = []
  if (formData.domain.normal > 0) {
    domainTexts.push(`*标准域名 ${formData.domain.normal} 个`)
  }
  if (formData.domain.wildcard > 0) {
    domainTexts.push(`*泛域名 ${formData.domain.wildcard} 个`)
  }
  const displayMap = {
    品牌: formData.certName || '--',
    证书类型: formData.certType ? `${sslType[formData.certType].text}(${sslType[formData.certType].code})` : '--',
    域名类型: formData.domain.type ? `${humanizeSSLDomainType(formData.domain.type)}` : '--',
    域名个数: domainTexts.length > 0 ? domainTexts.join(',') : '--',
    有效期: formData.validYear ? `${formData.validYear} 年${getCertYearTipsByAutoRenew(formData.autoRenew)}` : '--'
  }
  return getDisplayData(displayMap)
}

export function companyFormData2Display(formData: CompanyFormValue): InfoRowData[] {
  const displayMap = {
    部门: formData.division || '--',
    座机电话: formData.phone || '--',
    '国家/省份/城市': humanizeAreaText(formData.country, formData.province, formData.city),
    地址: formData.address || '--',
    邮编: formData.postCode || '--'
  }
  return getDisplayData(displayMap)
}

export function contactFormData2Display(formData: ContactFormValue): InfoRowData[] {
  const displayMap = {
    职位: formData.position || '--',
    电话: formData.phone || '--',
    邮箱: formData.email || '--'
  }
  return getDisplayData(displayMap)
}
