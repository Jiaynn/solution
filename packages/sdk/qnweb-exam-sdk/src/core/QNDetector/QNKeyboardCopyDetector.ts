import { QNBrowserDetector } from './QNDetector';

/**
 * 复制检测器
 */
export class QNKeyboardCopyDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  private onCallback: Function = () => {
  };

  on(callback: Function) {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   */
  enable() {
    document.addEventListener('copy', this.handleCopy);
  }

  /**
   * 关闭检测
   */
  disable() {
    document.removeEventListener('copy', this.handleCopy)
  }

  handleCopy(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
