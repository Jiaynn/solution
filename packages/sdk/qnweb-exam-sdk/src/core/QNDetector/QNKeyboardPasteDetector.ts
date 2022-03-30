import { QNBrowserDetector } from './QNDetector';

/**
 * 粘贴检测器
 */
export class QNKeyboardPasteDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  constructor() {
    super();
    this.handlePaste = this.handlePaste.bind(this);
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
