export const isps = {
  all: 'all',
  telecom: 'telecom',
  unicom: 'unicom',
  mobile: 'mobile',
  tietong: 'tietong',
  cernet: 'cernet',
  drpeng: 'drpeng',
  others: 'others',
  unknown: 'unknown'
}

export const ispTextMap = {
  [isps.all]: {
    cn: '全部',
    en: 'All'
  },
  [isps.telecom]: {
    cn: '电信',
    en: 'China Telecom'
  },
  [isps.unicom]: {
    cn: '联通',
    en: 'China Unicom'
  },
  [isps.mobile]: {
    cn: '移动',
    en: 'China Mobile'
  },
  [isps.tietong]: {
    cn: '铁通',
    en: 'China Mobile Tietong'
  },
  [isps.cernet]: {
    cn: '教育网',
    en: 'CERNET'
  },
  [isps.drpeng]: {
    cn: '鹏博士',
    en: 'Dr. Peng'
  },
  [isps.others]: {
    cn: '其他',
    en: 'Others'
  },
  [isps.unknown]: {
    cn: '未知',
    en: 'Unknown'
  }
}
