import { QNVideoOptimizationMode } from 'qnweb-rtc';

export interface QNNumberRange {
  max?: number; // 最大值
  min?: number; // 最小值
  exact?: number; // 希望能取到exact的值，如果失败就抛出错误
  ideal?: number; // 优先取ideal的值, 其次取min-max范围内一个支持的值, 否则就抛出错误
}

export type QNOptimizationMode = QNVideoOptimizationMode; // 传输优化模式, motion: 流畅优先, detail: 清晰优先, 默认浏览器根据自身算法确定模式

