import { values } from 'lodash'

export const categories = {
  traffic: 'traffic',
  bandwidth: 'bandwidth'
}

export const categoryTextMap = {
  traffic: '流量',
  bandwidth: '带宽'
}

export const trafficUnits = {
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024
}

export const trafficUnitList = values(trafficUnits)

export const trafficUnitTextMap = {
  [trafficUnits.MB]: 'MB',
  [trafficUnits.GB]: 'GB',
  [trafficUnits.TB]: 'TB'
}

export const bandwidthUnits = {
  Kbps: 1000,
  Mbps: 1000 * 1000,
  Gbps: 1000 * 1000 * 1000
}

export const bandwidthUnitList = values(bandwidthUnits)

export const bandwidthUnitTextMap = {
  [bandwidthUnits.Kbps]: 'Kbps',
  [bandwidthUnits.Mbps]: 'Mbps',
  [bandwidthUnits.Gbps]: 'Gbps'
}

export const methods = {
  email: 'email',
  sms: 'sms'
}

export const methodTextMap = {
  [methods.email]: '邮件',
  [methods.sms]: '短信'
}
