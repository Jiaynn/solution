import * as QNIM from './im/qnweapp-im';

//app.js
App({
  onLaunch: function() {
    this.initSDK();
  },
  globalData: {
    im: {},
    SDK_VERSION: QNIM.version,
    appid: 'cigzypnhoyno'
  },

  /**
   * 初始化 SDK
   */
  initSDK() {
    const im = QNIM.init({
      appid: this.globalData.appid
    });
    if (im) {
      this.globalData.im = im;
    }
  },

  /**
   * 获取 IM 对象
   * @returns {{}}
   */
  getIM() {
    return this.globalData.im;
  }
});