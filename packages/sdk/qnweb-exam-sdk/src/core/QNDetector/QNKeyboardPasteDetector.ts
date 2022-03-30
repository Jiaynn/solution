import { QNBrowserDetector } from './QNDetector';

/**
 * 粘贴检测器
 */
export class QNKeyboardPasteDetector extends QNBrowserDetector {
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
    document.addEventListener('paste', this.handlePaste);
  }

  /**
   * 关闭检测
   */
  disable() {
    document.removeEventListener('paste', this.handlePaste);
  }

  handlePaste(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
