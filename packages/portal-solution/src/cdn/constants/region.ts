import { invert } from 'lodash'

export const areas = {
  global: 'global',
  china: 'china',
  other: 'other'
}

export const trafficAreas = {
  china: 'china',
  foreign: 'foreign'
}

export const areaNameMap = {
  [areas.global]: {
    cn: '全部地区',
    en: 'All regions'
  },
  [areas.china]: {
    cn: '中国大陆',
    en: 'Chinese Mainland'
  },
  [areas.other]: {
    cn: '港澳台及海外',
    en: 'Outside Chinese Mainland'
  }
}

export const regionNameMap = {
  north: {
    cn: '华北',
    en: 'North China',
    regions: {
      beijing: { key: 'beijing', cn: '北京', en: 'Beijing' },
      hebei: { key: 'hebei', cn: '河北', en: 'Hebei' },
      neimenggu: { key: 'neimenggu', cn: '内蒙古', en: 'Neimenggu' },
      shanxi: { key: 'shanxi', cn: '山西', en: 'Shanxi' },
      tianjin: { key: 'tianjin', cn: '天津', en: 'Tianjin' }
    }
  },
  northWest: {
    cn: '西北',
    en: 'Northwest China',
    regions: {
      gansu: { key: 'gansu', cn: '甘肃', en: 'Gansu' },
      ningxia: { key: 'ningxia', cn: '宁夏', en: 'Ningxia' },
      qinghai: { key: 'qinghai', cn: '青海', en: 'Qinghai' },
      shaanxi: { key: 'shaanxi', cn: '陕西', en: 'Shaanxi' },
      xinjiang: { key: 'xinjiang', cn: '新疆', en: 'Xinjiang' }
    }
  },
  northEast: {
    cn: '东北',
    en: 'Northeast China',
    regions: {
      heilongjiang: { key: 'heilongjiang', cn: '黑龙江', en: 'Heilongjiang' },
      jilin: { key: 'jilin', cn: '吉林', en: 'Jilin' },
      liaoning: { key: 'liaoning', cn: '辽宁', en: 'Liaoning' }
    }
  },
  east: {
    cn: '华东',
    en: 'East China',
    regions: {
      anhui: { key: 'anhui', cn: '安徽', en: 'Anhui' },
      fujian: { key: 'fujian', cn: '福建', en: 'Fujian' },
      jiangsu: { key: 'jiangsu', cn: '江苏', en: 'Jiangsu' },
      shandong: { key: 'shandong', cn: '山东', en: 'Shandong' },
      shanghai: { key: 'shanghai', cn: '上海', en: 'Shanghai' },
      zhejiang: { key: 'zhejiang', cn: '浙江', en: 'Zhejiang' }
    }
  },
  center: {
    cn: '华中',
    en: 'Central China',
    regions: {
      henan: { key: 'henan', cn: '河南', en: 'Henan' },
      hubei: { key: 'hubei', cn: '湖北', en: 'Hubei' },
      hunan: { key: 'hunan', cn: '湖南', en: 'Hunan' },
      jiangxi: { key: 'jiangxi', cn: '江西', en: 'Jiangxi' }
    }
  },
  southWest: {
    cn: '西南',
    en: 'Southwest China',
    regions: {
      chongqing: { key: 'chongqing', cn: '重庆', en: 'Chongqing' },
      guizhou: { key: 'guizhou', cn: '贵州', en: 'Guizhou' },
      sichuan: { key: 'sichuan', cn: '四川', en: 'Sichuan' },
      xizang: { key: 'xizang', cn: '西藏', en: 'Xizang' },
      yunnan: { key: 'yunnan', cn: '云南', en: 'Yunnan' }
    }
  },
  south: {
    cn: '华南',
    en: 'South China',
    regions: {
      guangdong: { key: 'guangdong', cn: '广东', en: 'Guangdong' },
      guangxi: { key: 'guangxi', cn: '广西', en: 'Guangxi' },
      hainan: { key: 'hainan', cn: '海南', en: 'Hainan' }
    }
  },
  gat: {
    cn: '港澳台',
    en: 'Hong Kong, Macao and Taiwan',
    regions: {
      hongkong: { key: 'hongkong', cn: '香港', en: 'Hongkong' },
      macau: { key: 'macau', cn: '澳门', en: 'Macao' },
      taiwan: { key: 'taiwan', cn: '台湾', en: 'Taiwan' }
    }
  },
  other: {
    cn: '其他',
    en: 'Others',
    regions: {
      oversea: { key: 'oversea', cn: '海外', en: 'Outside Chinese Mainland' },
      unknown: { key: 'unknown', cn: '未知', en: 'Unknown' }
    }
  }
}

export type RegionNameKey = keyof typeof regionNameMap

export const trafficRegionNameMap = {
  china: {
    cn: '中国大陆',
    en: 'Chinese Mainland',
    regions: {
      china: { key: 'china', cn: '中国大陆', en: 'Chinese Mainland' }
    }
  },
  foreign: {
    cn: '海外',
    en: 'Outside Chinese Mainland',
    regions: {
      sea: { key: 'sea', cn: '亚洲（港澳台/东南亚/印度）', en: 'Asia（Hong Kong, Macao and Taiwan / Southeast Asia / India）' },
      asia: { key: 'asia', cn: '亚洲（其他地区）', en: 'Asia（Others）' },
      ameu: { key: 'ameu', cn: '欧洲/北美洲', en: 'Europe / North America' },
      sa: { key: 'sa', cn: '南美洲', en: 'South America' },
      oc: { key: 'oc', cn: '大洋洲与其他', en: 'Oceania and others' }
    }
  }
}

// 用于地图，对应到地图数据（如 constants/chart/map/china.json）里省份信息的 name 字段
export const regionGeoNameMap = {
  hongkong: 'HongKong',
  macau: 'Macau',
  taiwan: 'Taiwan',
  guangdong: 'Guangdong',
  guangxi: 'Guangxi',
  hainan: 'Hainan',
  chongqing: 'Chongqing',
  guizhou: 'Guizhou',
  sichuan: 'Sichuan',
  xizang: 'Xizang',
  yunnan: 'Yunnan',
  henan: 'Henan',
  hubei: 'Hubei',
  hunan: 'Hunan',
  jiangxi: 'Jiangxi',
  anhui: 'Anhui',
  fujian: 'Fujian',
  jiangsu: 'Jiangsu',
  shandong: 'Shandong',
  shanghai: 'Shanghai',
  zhejiang: 'Zhejiang',
  heilongjiang: 'Heilongjiang',
  jilin: 'Jilin',
  liaoning: 'Liaoning',
  gansu: 'Gansu',
  ningxia: 'Ningxia',
  qinghai: 'Qinghai',
  shaanxi: 'Shaanxi',
  xinjiang: 'Xinjiang',
  beijing: 'Beijing',
  hebei: 'Hebei',
  neimenggu: 'Inner Mongol',
  shanxi: 'Shanxi',
  tianjin: 'Tianjin'
}

export type RegionGeoNameKey = keyof typeof regionGeoNameMap

// 反转后的省份映射
export const geoNameRegionMap = invert(regionGeoNameMap)
