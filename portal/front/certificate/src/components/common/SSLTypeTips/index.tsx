/**
 * @file: component 证书种类提示文案
 * @author: liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import cx from 'classnames'

import { CertType, SslBrand, sslType as SSL_TYPE_MAP } from '../../../constants/ssl'

import './style.less'

export interface ISSLTypeTipsProps {
  sslType: CertType
  sslBrand: SslBrand
}

const SSLTypeTips: React.FC<ISSLTypeTipsProps> = ({ sslType, sslBrand }) => {
  const sslTypeDetail = SSL_TYPE_MAP[sslType]

  if (!sslTypeDetail) {
    return null
  }

  const isGeotrustDV = sslBrand === SslBrand.Geotrust && sslType === CertType.DVWildcard
  const sslTypeDesc = isGeotrustDV ? 'Geotrust DV 通配符证书只有海外节点，若国内防火墙拦截海外 IP，会影响访问速度，建议选购 TrustAsia DV 通配符证书' : sslTypeDetail.desc

  return <p className={cx('comp-ssl-type-tips', { 'tips-highlight': isGeotrustDV })}>{sslTypeDesc}</p>

}

export default SSLTypeTips
