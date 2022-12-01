import { QNBrowserDetector } from './QNDetector';


/**
 * 浏览器tab检测器
 */
export class QNBrowserTabDetector extends QNBrowserDetector {
  static create(): QNBrowserTabDetector {
    return new this();
  }

  constructor() {
    super();
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  private onCallback: ((result: VisibilityState) => void) | null = null;

  /**
   * 注册回调
   * @param callback
   */
  on(callback: (result: VisibilityState) => void) {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   */
  enable(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * 关闭检测
   */
  disable(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange() {
    this.onCallback?.(document.visibilityState);
  }
}
