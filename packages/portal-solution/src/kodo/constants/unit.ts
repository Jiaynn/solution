/*
 * @file unit relative constants
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO 后面这里优化下
export type StorageSizeUnit = (
  'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB' | 'BB' | 'NB' | 'DB' | 'CB' | 'XB'
)

export const storageSizeUnits: StorageSizeUnit[] = [
  'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB', 'XB'
]

export const intUnits = {
  en: ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D', 'C', 'X'],
  cn: ['', '千', '兆', '吉', '太', '拍', '艾', '泽', '尧', 'B', 'N', 'D', 'C', 'X'],
  zh: ['', '千', '百万', '十亿', '万亿', '千万亿', '百亿亿', '十万亿亿', '亿亿亿', '千亿亿亿', '百万亿亿亿', '十亿亿亿亿', '万亿亿亿亿', '千万亿亿亿亿']
}
