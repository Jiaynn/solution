import { QNBrowserDetector } from './QNDetector';

/**
 * 剪切检测器
 */
export class QNKeyboardCutDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  private onCallback: Function = () => {
  };

  on(callback: Function) {
    this.onCallback = callback;
  }

  enable() {
    document.addEventListener('cut', this.handleCut);
  }

  disable() {
    document.removeEventListener('cut', this.handleCut);
  }

  handleCut(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
