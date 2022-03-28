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

  enable() {
    document.addEventListener('paste', this.handlePaste);
  }

  disable() {
    document.removeEventListener('paste', this.handlePaste);
  }

  handlePaste(event: ClipboardEvent) {
    this.onCallback(event);
  }
}
