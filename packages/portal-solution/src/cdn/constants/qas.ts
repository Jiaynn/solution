import { IPrimeItem } from 'cdn/apis/qas'

export enum PrimeLevel {
  PrimeA = 'A',
  PrimeB = 'B',
  PrimeC = 'C'
}

export const primeLevelTextMap = {
  [PrimeLevel.PrimeA]: '旗舰版',
  [PrimeLevel.PrimeB]: '优享版',
  [PrimeLevel.PrimeC]: '基础版'
}

export enum PrimeStatus {
  Original = 'original',  // 未开启
  Toon = 'toon',          // 申请开通
  Actived = 'actived',    // 服务生效中
  Tooff = 'tooff'         // 申请关闭
}

export const primeStatusTextMap = {
  [PrimeStatus.Original]: '未开启',
  [PrimeStatus.Toon]: '申请开通',
  [PrimeStatus.Actived]: '服务生效中',
  [PrimeStatus.Tooff]: '申请关闭'
}

export const primeStatusButtonTextMap = {
  [PrimeStatus.Original]: 'N 倍单价开启',
  [PrimeStatus.Toon]: '取消开通申请',
  [PrimeStatus.Actived]: '关闭服务',
  [PrimeStatus.Tooff]: '取消关闭申请'
}

export const primeItems: IPrimeItem[] = [
  {
    level: PrimeLevel.PrimeC,
    sla: '99.95',
    ratio: 15,
    price: 1.1
  },
  {
    level: PrimeLevel.PrimeB,
    sla: '99.99',
    ratio: 30,
    price: 1.2
  },
  {
    level: PrimeLevel.PrimeA,
    sla: '100',
    ratio: 50,
    price: 1.3
  }
]
