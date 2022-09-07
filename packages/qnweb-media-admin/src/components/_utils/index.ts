import moment from 'moment';

/**
 * 格式化文件大小
 * @param value
 */
export const formatFileSize = (value: number) => {
  const num = 1024;
  if (value < num) {
    return `${value}B`;
  }
  if (value < Math.pow(num, 2)) {
    return `${(value / 1024).toFixed(2)}KB`;
  }
  if (value < Math.pow(num, 3)) {
    return `${(value / Math.pow(num, 2)).toFixed(2)}MB`;
  }
  if (value < Math.pow(num, 4)) {
    return `${(value / Math.pow(num, 3)).toFixed(2)}GB`;
  }
  return `${(value / Math.pow(num, 4)).toFixed(2)}TB`;
};

/**
 * 格式化码率
 * @param value
 */
export const formatBitRate = (value: number) => {
  const num = 1024;
  if (value < num) {
    return `${value}bps`;
  }
  if (value < Math.pow(num, 2)) {
    return `${(value / 1024).toFixed(2)}kbps`;
  }
  if (value < Math.pow(num, 3)) {
    return `${(value / Math.pow(num, 2)).toFixed(2)}mbps`;
  }
  if (value < Math.pow(num, 4)) {
    return `${(value / Math.pow(num, 3)).toFixed(2)}gbps`;
  }
  return `${(value / Math.pow(num, 4)).toFixed(2)}tbps`;
};

/**
 * 格式化duration
 * @param duration 时长，单位毫秒(ms)
 */
export const formatDuration = (duration?: number) => {
  return moment.utc(duration).format('HH:mm:ss');
};
