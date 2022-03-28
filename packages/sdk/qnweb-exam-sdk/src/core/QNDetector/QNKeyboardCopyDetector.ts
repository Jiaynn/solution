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

  enable() {
    document.addEventListener('copy', this.handleCopy);
  }

  disable() {
    document.removeEventListener('copy', this.handleCopy)
  }

  handleCopy(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
