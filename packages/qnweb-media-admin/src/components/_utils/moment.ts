import moment from 'moment';

/**
 * 格式化duration
 * @param duration 时长，单位毫秒(ms)
 */
export const formatDuration = (duration?: number) => {
  return moment.utc(duration).format('HH:mm:ss');
};

/**
 * 格式化时间
 * @param datetime
 * @param format
 */
export const formatDatetime = (datetime: moment.MomentInput, format?: string) => {
  return moment(datetime).format(format || 'YYYY-MM-DD HH:mm:ss');
};

/**
 * 毫秒=>秒
 * @param value
 */
export const millisecondToSecond = (value: number) => {
  return value / 1000;
};

/**
 * 秒=>毫秒
 * @param value
 */
export const secondToMillisecond = (value: number) => {
  return value * 1000;
};
