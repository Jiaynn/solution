import moment from 'moment';

/**
 * 格式化文件大小
 * @param value
 */
export const formatFileSize = (value?: number) => {
  const num = 1024;
  const _value = value || 0;
  if (_value < num) {
    return `${_value}B`;
  }
  if (_value < Math.pow(num, 2)) {
    return `${(_value / Math.pow(num, 1)).toFixed(2)}KB`;
  }
  if (_value < Math.pow(num, 3)) {
    return `${(_value / Math.pow(num, 2)).toFixed(2)}MB`;
  }
  if (_value < Math.pow(num, 4)) {
    return `${(_value / Math.pow(num, 3)).toFixed(2)}GB`;
  }
  return `${(_value / Math.pow(num, 4)).toFixed(2)}TB`;
};

/**
 * 格式化码率
 * @param value
 */
export const formatBitRate = (value?: number) => {
  const num = 1024;
  const _value = value || 0;
  if (_value < num) {
    return `${_value}bps`;
  }
  if (_value < Math.pow(num, 2)) {
    return `${(_value / Math.pow(num, 1)).toFixed(2)}kbps`;
  }
  if (_value < Math.pow(num, 3)) {
    return `${(_value / Math.pow(num, 2)).toFixed(2)}mbps`;
  }
  if (_value < Math.pow(num, 4)) {
    return `${(_value / Math.pow(num, 3)).toFixed(2)}gbps`;
  }
  return `${(_value / Math.pow(num, 4)).toFixed(2)}tbps`;
};

/**
 * 格式化duration
 * @param duration 时长，单位毫秒(ms)
 */
export const formatDuration = (duration?: number) => {
  return moment.utc(duration).format('HH:mm:ss');
};
