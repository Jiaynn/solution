// 证书订单状态
export enum OrderStatus {
  Done = 1,
  Pending = 2,
  NotApproved = 4,
  Denied = 6,
  Paying = 8,
  Paid = 9,
  Reissuing = 10,
  Reissued = 11,
  ToRenew = 12,
  Renewing = 13,
  Renewed = 14,
  Closed = 15,
  Refunding = 16,
  Reviewing = 17,
  AfterPaidRefunding = 18
}

// 证书状态
export enum CertStatus {
  None = '',
  ReNewed = 'renewed',
  ReNewing = 'renewing'
}

export const orderStatusNameMap = {
  [OrderStatus.Done]: 'done',
  [OrderStatus.Pending]: 'pending',
  [OrderStatus.NotApproved]: 'notApproved',
  [OrderStatus.Denied]: 'denied',
  [OrderStatus.Paying]: 'paying', // 域名所有权待验证
  [OrderStatus.Paid]: 'paid',
  [OrderStatus.Reissuing]: 'reissuing',
  [OrderStatus.Reissued]: 'reissued',
  [OrderStatus.ToRenew]: 'toRenew',
  [OrderStatus.Renewing]: 'renewing',
  [OrderStatus.Renewed]: 'renewed',
  [OrderStatus.Closed]: 'closed',
  [OrderStatus.Refunding]: 'refunding',
  [OrderStatus.Reviewing]: 'reviewing',
  [OrderStatus.AfterPaidRefunding]: 'afterPaidRefunding'
}

export const orderStatusTextMap = {
  [OrderStatus.Done]: '已签发',
  [OrderStatus.Pending]: '待确认',
  [OrderStatus.NotApproved]: '申请失败',
  [OrderStatus.Denied]: '被拒绝',
  [OrderStatus.Paying]: '待支付', // 域名所有权待验证
  [OrderStatus.Paid]: '待补全',
  [OrderStatus.Reissuing]: '重颁发中',
  [OrderStatus.Reissued]: '已签发(重颁发)',
  [OrderStatus.ToRenew]: '续费待支付',
  [OrderStatus.Renewing]: '续费中',
  [OrderStatus.Renewed]: '已续费',
  [OrderStatus.Closed]: '已关闭/退费',
  [OrderStatus.Refunding]: '退款中',
  [OrderStatus.Reviewing]: '待审核',
  [OrderStatus.AfterPaidRefunding]: '后付费订单退款中'
}

export const doneStatuses = [OrderStatus.Done, OrderStatus.Reissued]
export const payingStatuses = [OrderStatus.Paying, OrderStatus.ToRenew]
export const pendingStatuses = [OrderStatus.Pending]
export const shouldHasCertStatuses = [
  OrderStatus.Done,
  OrderStatus.Reissuing,
  OrderStatus.Reissued,
  OrderStatus.ToRenew,
  OrderStatus.Renewing,
  OrderStatus.Renewed
]
export const canBeClosedStatuses = [
  OrderStatus.Paying,
  OrderStatus.ToRenew,
  OrderStatus.Paid,
  OrderStatus.Pending,
  OrderStatus.Reviewing,
  OrderStatus.NotApproved
]

export enum SslBrand {
  DigiCert = 'DigiCert',
  Geotrust = 'Geotrust',
  TrustAsia = 'TrustAsia'
}

export const sslBrand = [
  SslBrand.DigiCert,
  SslBrand.Geotrust,
  SslBrand.TrustAsia
]

export enum CertType {
  OV = 'ov',
  OVPro = 'ov_pro',
  EV = 'ev',
  EVPro = 'ev_pro',
  OVWildcard = 'ov_wildcard',
  OVProWildcard = 'ov_pro_wildcard',
  DV = 'dv',
  DVMultiple = 'dv_multiple',
  DVWildcard = 'dv_wildcard'
}

// 证书类型
export const sslType = {
  [CertType.EV]: {
    code: 'EV',
    text: '企业增强型',
    desc: '企业增强型SSL,提供加密功能,对申请者做最严格的身份审核验证,提供最高度可信身份证明,提供浏览器绿色地址栏'
  },
  [CertType.EVPro]: {
    code: 'EV Pro',
    text: '企业增强型专业版',
    desc: '企业增强型专业版SSL,支持ECC椭圆曲线算法,提供站点加密功能,浏览器绿色地址栏显示组织信息强化信任'
  },
  [CertType.OV]: {
    code: 'OV',
    text: '企业型',
    desc: '企业型SSL,提供加密功能,对申请者做严格的身份审核验证,提供可信身份证明'
  },
  [CertType.OVPro]: {
    code: 'OV Pro',
    text: '企业型专业版',
    desc: '企业型专业版SSL,支持ECC椭圆曲线算法,提供站点加密功能,需要核验组织注册信息,证书中显示组织名称'
  },
  [CertType.OVWildcard]: {
    code: 'OV 通配符',
    text: '企业型',
    desc: ''
  },
  [CertType.OVProWildcard]: {
    code: 'OV PRO 通配符',
    text: '企业型专业版',
    desc: ''
  },
  [CertType.DV]: {
    code: 'DV',
    text: '域名型',
    desc: '域名型SSL,提供站点加密功能。同一主域最多只能申请 20 张 TustAsian 免费型 DV 版 SSL 证书（一级域名及其子域名均属于同一主域，例如 qiniu.com、ssl.qiniu.com、ssl.ssl.qiniu.com 都属于同一主域）。若您的业务因此受限，建议您购买通配符型证书。'
  },
  [CertType.DVMultiple]: {
    code: 'DV 多域名',
    text: '域名型',
    desc: ''
  },
  [CertType.DVWildcard]: {
    code: 'DV 通配符',
    text: '域名型',
    desc: ''
  }
}

export const trustAsiaPrefix = 'TrustAsia'

export function isTrustAsia(name: string) {
  return name ? name.indexOf(trustAsiaPrefix) === 0 : false
}

export const dvSSLTypePrefix = 'dv'
export function isDVSSLType(name: string) {
  return name && name.indexOf(dvSSLTypePrefix) === 0
}

export const wildcardTypePrefix = 'wildcard'
export function isWildCardType(type: CertType) {
  return type && type.indexOf(wildcardTypePrefix) >= 0
}

export enum SSLDomainType {
  Single = 'single',
  Multiple = 'multiple',
  Wildcard = 'wildcard',
  SingleWildcard = 'single_wildcard',
  MultipleWildcard = 'multiple_wildcard'
}

export const sslDomainTypeTextMap = {
  [SSLDomainType.Single]: '单域名证书',
  [SSLDomainType.Multiple]: '多域名证书',
  [SSLDomainType.Wildcard]: '泛域名证书',
  [SSLDomainType.SingleWildcard]: '泛域名证书',
  [SSLDomainType.MultipleWildcard]: '多域名泛域名证书'
}

export function humanizeSSLDomainType(type: SSLDomainType): string {
  return sslDomainTypeTextMap[type] || ''
}

export enum DomainType {
  Normal = 'normal',
  Wildcard = 'wildcard'
}

export const domainTypeTextMap = {
  [DomainType.Normal]: '标准域名',
  [DomainType.Wildcard]: '泛域名'
}

export function humanizeDomainType(type: DomainType): string {
  return domainTypeTextMap[type] || ''
}

export enum SearchType {
  Order = 'order',
  Cert = 'cert'
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export type CertMap = {[type in SslBrand]: {[type in CertType]?: CertItem }}

export interface CertItem {
  shortName: ProductShortName,
  isSelling: boolean,
  tip?: string,
  discounts?: object,
  domainShortNameMap?: {[type in SSLDomainType]?: ProductShortName},
  star?: number,
  years: number[],
  domain: CertDomain
}

export type CertDomain = {
  [type in SSLDomainType]?: CertDomainItem
}

export interface CertDomainItem extends CertDomainNumber {
  normal?: CertDomainNumber,
  wildcard?: CertDomainNumber
}

export interface CertDomainNumber {
  min?: number
  max?: number
}

export enum ProductShortName {
  TrustAsiaTLSC1 = 'TrustAsiaTLSC1',
  TrustAsiaTLSSANsC1 = 'TrustAsiaTLSSANsC1',
  TrustAsiaTLSWildcardC1 = 'TrustAsiaTLSWildcardC1',
  GeoTrustEV = 'GeoTrustEV',
  GeoTrustEVSANs = 'GeoTrustEVSANs',
  GeoTrustOVWildcard = 'GeoTrustOVWildcard',
  GeoTrustOV = 'GeoTrustOV',
  GeoTrustOVSANs = 'GeoTrustOVSANs',
  SecureSiteEVPro = 'SecureSiteEVPro',
  SecureSiteEVSANsPro = 'SecureSiteEVSANsPro',
  SecureSiteNEV = 'SecureSiteNEV',
  SecureSiteEVSANs = 'SecureSiteEVSANs',
  SecureSiteOV = 'SecureSiteOV',
  SecureSiteOVSANs = 'SecureSiteOVSANs',
  SecureSiteOVPro = 'SecureSiteOVPro',
  SecureSiteOVSANsPro = 'SecureSiteOVSANsPro',
  SecureSiteOVWildcard = 'SecureSiteOVWildcard',
  SecureSiteOVWildcardPro = 'SecureSiteOVWildcardPro',
  TrustAsiaOVWildcardC1 = 'TrustAsiaOVWildcardC1',
  TrustAsiaOVC1 = 'TrustAsiaOVC1',
  TrustAsiaOVSANsC1 = 'TrustAsiaOVSANsC1',
  TrustAsiaEVC1 = 'TrustAsiaEVC1',
  TrustAsiaEVSANSC1 = 'TrustAsiaEVSANSC1',
  RapidDVWildcard = 'RapidDVWildcard'
}

export const sslMap: CertMap = {
  [SslBrand.DigiCert]: {
    [CertType.OV]: {
      shortName: ProductShortName.SecureSiteOV,
      isSelling: true,
      star: 4,
      domainShortNameMap: {
        single: ProductShortName.SecureSiteOV,
        multiple: ProductShortName.SecureSiteOVSANs,
        multiple_wildcard: ProductShortName.SecureSiteOVSANs
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        },
        multiple_wildcard: {
          min: 2,
          max: 100,
          normal: {
            min: 1
          },
          wildcard: {
            min: 0
          }
        }
      }
    },
    [CertType.OVPro]: {
      shortName: ProductShortName.SecureSiteOVPro,
      isSelling: true,
      star: 4.5,
      domainShortNameMap: {
        single: ProductShortName.SecureSiteOVPro,
        multiple: ProductShortName.SecureSiteOVSANsPro,
        multiple_wildcard: ProductShortName.SecureSiteOVSANsPro
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        },
        multiple_wildcard: {
          min: 2,
          max: 100,
          normal: {
            min: 1
          },
          wildcard: {
            min: 0
          }
        }
      }
    },
    [CertType.EV]: {
      shortName: ProductShortName.SecureSiteNEV,
      isSelling: true,
      star: 4.5,
      domainShortNameMap: {
        single: ProductShortName.SecureSiteNEV,
        multiple: ProductShortName.SecureSiteEVSANs
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        }
      }
    },
    [CertType.EVPro]: {
      shortName: ProductShortName.SecureSiteEVPro,
      isSelling: true,
      star: 5,
      domainShortNameMap: {
        single: ProductShortName.SecureSiteEVPro,
        multiple: ProductShortName.SecureSiteEVSANsPro
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        }
      }
    },
    [CertType.OVWildcard]: {
      shortName: ProductShortName.SecureSiteOVWildcard,
      isSelling: true,
      star: 4,
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    },
    [CertType.OVProWildcard]: {
      shortName: ProductShortName.SecureSiteOVWildcardPro,
      isSelling: true,
      star: 4.5,
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    }
  },
  [SslBrand.Geotrust]: {
    [CertType.OV]: {
      shortName: ProductShortName.GeoTrustOV,
      isSelling: true,
      star: 3.5,
      domainShortNameMap: {
        single: ProductShortName.GeoTrustOV,
        multiple: ProductShortName.GeoTrustOVSANs,
        multiple_wildcard: ProductShortName.GeoTrustOVSANs
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        },
        multiple_wildcard: {
          min: 2,
          max: 100,
          normal: {
            min: 2
          },
          wildcard: {
            min: 0
          }
        }
      }
    },
    [CertType.EV]: {
      shortName: ProductShortName.GeoTrustEV,
      isSelling: true,
      star: 4,
      domainShortNameMap: {
        single: ProductShortName.GeoTrustEV,
        multiple: ProductShortName.GeoTrustEVSANs
      },
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        }
      }
    },
    [CertType.OVWildcard]: {
      shortName: ProductShortName.GeoTrustOVWildcard,
      isSelling: true,
      star: 3.5,
      years: [
        1,
        2
      ],
      discounts: {
        1: 7,
        2: 6.5
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    },
    [CertType.DVWildcard]: {
      shortName: ProductShortName.RapidDVWildcard,
      isSelling: true,
      star: 2.5,
      years: [
        1,
        2
      ],
      discounts: {
        1: 7.5,
        2: 7
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    }
  },
  [SslBrand.TrustAsia]: {
    [CertType.OV]: {
      shortName: ProductShortName.TrustAsiaOVC1,
      tip: '新品特惠',
      isSelling: true,
      star: 4,
      years: [1],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domainShortNameMap: {
        single: ProductShortName.TrustAsiaOVC1,
        multiple: ProductShortName.TrustAsiaOVSANsC1
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        }
      }
    },
    [CertType.EV]: {
      shortName: ProductShortName.TrustAsiaEVC1,
      tip: '新品特惠',
      isSelling: true,
      star: 4.5,
      years: [1],
      discounts: {
        1: 7,
        2: 6.5
      },
      domainShortNameMap: {
        single: ProductShortName.TrustAsiaEVC1,
        multiple: ProductShortName.TrustAsiaEVSANSC1
      },
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        },
        multiple: {
          normal: {
            min: 2,
            max: 100
          }
        }
      }
    },
    [CertType.OVWildcard]: {
      shortName: ProductShortName.TrustAsiaOVWildcardC1,
      tip: '新品特惠',
      isSelling: true,
      star: 4,
      years: [1],
      discounts: {
        1: 7.5,
        2: 6.5
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    },
    [CertType.DV]: {
      shortName: ProductShortName.TrustAsiaTLSC1,
      tip: '限免',
      isSelling: true,
      star: 2.5,
      years: [
        1
      ],
      domain: {
        single: {
          normal: {
            min: 1,
            max: 1
          }
        }
      }
    },
    [CertType.DVMultiple]: {
      shortName: ProductShortName.TrustAsiaTLSSANsC1,
      isSelling: false,
      years: [
        1
      ],
      domain: {
        multiple: {
          normal: {
            min: 5,
            max: 5
          }
        }
      }
    },
    [CertType.DVWildcard]: {
      shortName: ProductShortName.TrustAsiaTLSWildcardC1,
      isSelling: true,
      star: 2.5,
      years: [1],
      discounts: {
        1: 8.5,
        2: 7.5
      },
      domain: {
        wildcard: {
          wildcard: {
            min: 1,
            max: 1
          }
        }
      }
    }
  }
}
