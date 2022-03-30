import { QNBrowserDetector } from './QNDetector';

/**
 * 剪切检测器
 */
export class QNKeyboardCutDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  constructor() {
    super();
    this.handleCut = this.handleCut.bind(this);
  }

  private onCallback: (result: ClipboardEvent) => void = () => {
  };

  on(callback: (result: ClipboardEvent) => void) {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   */
  enable() {
    document.addEventListener('cut', this.handleCut);
  }

  /**
   * 关闭检测
   */
  disable() {
    document.removeEventListener('cut', this.handleCut);
  }

  handleCut(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
