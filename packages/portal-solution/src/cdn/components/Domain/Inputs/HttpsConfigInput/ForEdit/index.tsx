
import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import Radio from 'react-icecream/lib/radio'
import { CertUploader, ICertInfo } from 'portal-base/certificate'

import { assertUnreachable } from 'cdn/utils'

import { humanizeCertInputType } from 'cdn/transforms/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { Protocol, CertInputType } from 'cdn/constants/domain'

import OEMDisabled from 'cdn/components/common/OEMDisabled'

import { IDomainDetail } from 'cdn/apis/domain'

import ForceHTTPSInput from '../ForceHttpsInput'
import DomainCertInput from '../../CertInput'
import FreeCertInput from '../../FreeCertInput'
import Switch from '../../common/Switch'
import HTTP2Input from '../Http2Input'

import './style.less'

export interface IHttpsConfig {
  protocol: string
  certId: string
  certInfo?: ICertInfo
  uploadCertId: string
  forceHttps: boolean
  http2Enable: boolean
  certInputType: string
  agreeLicense: boolean
}

export function getDefaultHttpsConfig(): IHttpsConfig {
  return {
    protocol: Protocol.Http,
    certId: '',
    uploadCertId: '',
    forceHttps: false,
    http2Enable: false,
    certInputType: CertInputType.Existed,
    agreeLicense: false
  }
}

export interface IProtocolInputProps {
  value: string
  onChange: (value: string) => void
}

export function ProtocolInput(props: IProtocolInputProps) {
  const { value, onChange } = props
  return (
    <Switch
      checked={value ? value === Protocol.Https : false}
      onChange={checked => onChange(checked ? Protocol.Https : Protocol.Http)}
    />
  )
}

export interface ICertTypeInputProps {
  value: string
  onChange: (value: string) => void
}

export function CertTypeInput(props: ICertTypeInputProps) {
  const { value, onChange } = props
  const { certInputTypes } = useInjection(AbilityConfig)
  const radios = certInputTypes
    .map(inputType => (
      <Radio key={inputType} value={inputType}>
        {humanizeCertInputType(inputType)}
      </Radio>
    ))

  return (
    <Radio.Group
      value={value}
      onChange={e => onChange((e.target as any).value)}
    >
      {radios}
    </Radio.Group>
  )
}

export interface IHttpsConfigForEditInput {
  domain: IDomainDetail
  certInfo?: ICertInfo
  canSwitchProtocol: boolean
  needConfigureCname: boolean
  isForbidAutoFreeCert: boolean
  value: IHttpsConfig
  error: any
  onChange: (value: IHttpsConfig) => void
}

function getCertInput({
  domain,
  value,
  certInfo,
  needConfigureCname,
  error,
  onChange
}: IHttpsConfigForEditInput) {
  const { certInputType, certId, agreeLicense, http2Enable } = value

  switch (certInputType) {
    case CertInputType.Existed:
      return (
        <DomainCertInput
          domain={domain.name}
          value={certId}
          error={error}
          domainCertId={domain.https.certId}
          onChange={newCertId => onChange({ ...value, http2Enable: !!newCertId, certId: newCertId })}
        />
      )
    case CertInputType.Free:
      return (
        <FreeCertInput
          value={agreeLicense}
          needConfigureCname={needConfigureCname}
          onChange={newAgreeLicense => onChange({
            ...value,
            agreeLicense: newAgreeLicense,
            http2Enable: newAgreeLicense === false ? false : http2Enable
          })}
          domain={domain}
          certInfo={certInfo}
        />
      )
    default:
  }
}

export const HttpsConfigForEditInput = observer(
  (props: IHttpsConfigForEditInput) => {
    const { canSwitchProtocol, isForbidAutoFreeCert, value, onChange } = props
    const { protocol, forceHttps, http2Enable, agreeLicense, certInputType, uploadCertId, certId } = value

    const protocolView = canSwitchProtocol
    ? (
      <div className="line">
        <ProtocolInput
          value={protocol}
          onChange={newProtocl => onChange({ ...value, protocol: newProtocl })}
        />
      </div>
    )
    : null

    const enforceHttpsView = !isForbidAutoFreeCert
    ? (
      <ForceHTTPSInput
        value={forceHttps}
        onChange={newForceHttps => onChange({ ...value, forceHttps: newForceHttps })}
      />
    )
    : null

    const isEnable = certInputType === CertInputType.Free ? agreeLicense : !!certId
    const http2View = !isForbidAutoFreeCert
    ? (
      <HTTP2Input
        isEnable={isEnable}
        value={http2Enable}
        onChange={enable => onChange({ ...value, http2Enable: enable })}
      />
    )
    : null

    const httpsConfigView = protocol && protocol === Protocol.Https
    ? (
      <div className="https-config-input-content">
        <div className="line">
          <CertTypeInput
            value={certInputType}
            onChange={certType => {
              const http2 = certType === CertInputType.Free ? false : !!certId
              onChange({ ...value, certInputType: certType, http2Enable: http2, agreeLicense: false })
            }}
          />
        </div>
        <OEMDisabled>
          <div className="desc">
            七牛云为用户提供证书购买服务，同时也支持用户上传本地证书以及申请免费证书，您可以在
            <a target="_blank" rel="noopener noreferrer" href={`${window.location.origin}/certificate`}>
              七牛云证书服务
            </a>
            处管理您的证书。免费证书仅支持单个普通域名绑定，适合个人，并不保证百分百成功签发，如果您是企业用户，建议您购买更高级别的证书。
          </div>
        </OEMDisabled>
        {getCertInput(props)}
        <div
          style={{
            display: CertInputType.Local === certInputType ? 'block' : 'none'
          }}
        >
          <CertUploader
            value={uploadCertId}
            onChange={newCertId => onChange({ ...value, uploadCertId: newCertId })}
          />
        </div>
        {enforceHttpsView}
        {http2View}
      </div>
      )
      : null

    return (
      <div className="https-config-input-wrapper">
        {protocolView}
        <OEMDisabled>
          <p className="line">
            HTTPS 域名产生的用量不计入免费额度，具体资费请查看
            <a target="_blank" rel="noopener noreferrer" href="https://portal.qiniu.com/financial/price">
              价格和优惠
            </a>
            。
          </p>
        </OEMDisabled>
        {httpsConfigView}
      </div>
    )
  }
)

export function createState(conf: IHttpsConfig) {
  return new FieldState({
    protocol: conf.protocol,
    certId: conf.certId,
    uploadCertId: conf.uploadCertId,
    forceHttps: conf.forceHttps,
    http2Enable: conf.http2Enable,
    certInputType: conf.certInputType,
    agreeLicense: conf.agreeLicense
  }).validators(validateHttpsConfig)
}

function validateHttpsConfig(v: IHttpsConfig) {
  if (v.protocol === Protocol.Http) return

  switch (v.certInputType) {
    case CertInputType.Existed:
      if (!v.certId) {
        return '请选择证书'
      }
      break
    case CertInputType.Local:
      if (!v.uploadCertId) {
        return '请上传证书'
      }
      break
    case CertInputType.Free:
      if (!v.agreeLicense) {
        return '请同意代申请'
      }
      break
    default:
      assertUnreachable()
  }
}

export type State = ReturnType<typeof createState>

export type Value = IHttpsConfig

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
  domain: IDomainDetail
  certInfo?: ICertInfo
  canSwitchProtocol: boolean
  needConfigureCname: boolean
  isForbidAutoFreeCert: boolean
}

export default observer(function HttpsConfigForEditInputWrapper(props: Props) {
  const { state, ...restProps } = props

  return (
    <HttpsConfigForEditInput
      {...restProps}
      error={state.error}
      {...bindInput(state)}
    />
  )
})
