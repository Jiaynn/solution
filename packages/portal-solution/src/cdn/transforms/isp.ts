import { ispTextMap, isps } from 'cdn/constants/isp'

export function humanizeIsp(isp: string) {
  return ispTextMap[isp] ?? { cn: isp, en: isp }
}

/**
 * 获取所有运营商
 */
export function getAllIspNameList() {
  return [
    isps.telecom,
    isps.unicom,
    isps.mobile,
    isps.tietong,
    isps.cernet,
    isps.drpeng,
    isps.others
  ]
}
