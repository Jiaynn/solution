import { InternalFunction } from '@/types';
import { QNBrowserDetector } from './QNDetector';

/**
 * 复制检测器
 */
export class QNKeyboardCopyDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  constructor() {
    super();
    this.handleCopy = this.handleCopy.bind(this);
  }

  private onCallback: InternalFunction | null = null;

  /**
   * 注册回调
   * @param callback
   */
  on(callback: (result: ClipboardEvent) => void): void {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   */
  enable(): void {
    document.addEventListener('copy', this.handleCopy);
  }

  /**
   * 关闭检测
   */
  disable(): void {
    document.removeEventListener('copy', this.handleCopy)
  }

  handleCopy(event: ClipboardEvent) {
    this.onCallback?.(event);
  }
}
