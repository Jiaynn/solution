/**
 * 生成唯一文件名
 * @param len 生成的文件名长度
 * @param radix 指定基数
 * @returns {string}
 */
function generateUUID(len, radix) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  radix = radix || chars.length

  if (len) {
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  } else {

    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}

/**
 * 生成唯一文件名 时间戳 + 随机数
 * @param len
 * @param radix
 * @returns {string}
 */
export function generateFileName(len, radix) {
  const time = new Date().getTime();
  const uuid = generateUUID(len || 8, radix || 12);
  return `${time}${uuid}`
}