import { QNBrowserDetector } from './QNDetector';

/**
 * 浏览器tab检测器
 */
export class QNBrowserTabDetector extends QNBrowserDetector {
  static create() {
    return new this();
  }

  private onCallback: Function = () => {
  };

  on(callback: Function) {
    this.onCallback = callback;
  }

  enable() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  disable() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange() {
    this.onCallback(document.visibilityState);
  }
}
