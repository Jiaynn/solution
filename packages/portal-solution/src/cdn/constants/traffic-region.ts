import { valuesOfEnum } from 'cdn/utils'

export const areas = {
  china: 'china',
  foreign: 'foreign',
  global: 'global'
}

export const regionNameMap = {
  china: {
    cn: '中国大陆',
    en: 'Chinese Mainland',
    regions: {
      china: { key: 'china', cn: '中国大陆', en: 'Chinese Mainland' }
    }
  },
  foreign: {
    cn: '海外',
    en: 'Overseas',
    regions: {
      sea: { key: 'sea', cn: '亚洲（港澳台/东南亚/印度）', en: 'Asia（Hong Kong, Macao and Taiwan / Southeast Asia / India）' },
      asia: { key: 'asia', cn: '亚洲（其他地区）', en: 'Asia（Others）' },
      ameu: { key: 'ameu', cn: '欧洲/北美洲', en: 'Europe / North America' },
      sa: { key: 'sa', cn: '南美洲', en: 'South America' },
      oc: { key: 'oc', cn: '大洋洲与其他', en: 'Oceania and others' }
    }
  }
}

export type RegionNameKey = keyof typeof regionNameMap

export const trafficRegionsNameMap = {
  china: {
    cn: '中国大陆',
    en: 'Chinese Mainland'
  },
  sea: {
    cn: '亚洲（港澳台/东南亚/印度）',
    en: 'Asia（Hong Kong, Macao and Taiwan / Southeast Asia / India）'
  },
  asia: {
    cn: '亚洲（其他地区）',
    en: 'Asia（Others）'
  },
  ameu: {
    cn: '欧洲/北美洲',
    en: 'Europe / North America'
  },
  sa: {
    cn: '南美洲',
    en: 'South America'
  },
  oc: {
    cn: '大洋洲与其他',
    en: 'Oceania and others'
  }
}

export enum Region {
  China = 'china',
  Asia = 'asia',
  Sea = 'sea',
  Ameu = 'ameu',
  SA = 'sa',
  OC = 'oc',
  Nozone = 'nozone'
}

export type TrafficRegion = Region[]

export const allTrafficRegions = valuesOfEnum(Region)
