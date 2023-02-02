/**
 * api 请求地址
 * @type {string}
 */
export const baseURL = 'https://im-test.qiniuapi.com';

const request = config => {
  const { url, loading = true, method = 'get', ...rest } = config;
  if (loading) {
    wx.showLoading({
      title: '数据加载中...'
    });
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL + url,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail(error) {
        wx.showToast({
          title: error.errMsg,
          icon: 'none'
        });
        reject(error);
      },
      complete() {
        if (loading) {
          wx.hideLoading();
        }
      },
      method: method.toUpperCase(),
      ...rest
    });
  });
};

export default request;