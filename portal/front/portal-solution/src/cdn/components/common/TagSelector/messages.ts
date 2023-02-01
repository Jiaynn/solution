/**
 * @file TagSelector locale messages
 * @author linchen <gakiclin@gmail.com>
 */

export const noTag = {
  cn: '暂无标签',
  en: 'No tag'
}

export const selectLimitTip = {
  cn: (limit: number) => `最多只能选择 ${limit} 个标签`,
  en: (limit: number) => `Only ${limit} tags can be selected at most.`
}

export const pickTags = {
  cn: '请选择标签',
  en: 'Pick tags'
}

export const selectedTip = {
  cn: (count: number) => `已选择 ${count} 个`,
  en: (count: number) => `${count} selected`
}

export const clearSelected = {
  cn: '清空已选',
  en: 'Clear'
}
