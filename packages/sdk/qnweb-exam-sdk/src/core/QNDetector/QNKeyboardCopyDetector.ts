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

  private onCallback: Function = () => {
  };

  on(callback: (result: ClipboardEvent) => void) {
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
