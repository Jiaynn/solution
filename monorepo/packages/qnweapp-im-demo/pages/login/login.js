// pages/login/login.js
import { demoVersion } from "../../config/index";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    account: '',
    password: '',
    SDK_VERSION: app.globalData.SDK_VERSION,
    demoVersion,
    loadingSign: false, // 登录加载
    loadingRegister: false, // 注册加载
  },

  /**
   * 点击登录
   */
  onSubmitSignIn() {
    const { account, password } = this.data;
    console.log("登入", account, password)
    const im = app.getIM();
    im.login({
      name: account,
      password
    });
    this.setData({
      loadingSign: true
    })
  },

  /**
   * 注册
   */
  onSubmitRegister() {
    this.setData({
      loadingRegister: true
    }, () => {
      const { account, password } = this.data;
      console.log("注册", account, password);
      const im = app.getIM();
      im.rosterManage.asyncRegester({
        username: account,
        password
      }).then(response => {
        wx.showModal({
          title: '注册成功提示',
          content: '注册成功~'
        });
        console.log('im.rosterManage.asyncRegester', response);
      }).catch(error => {
        wx.showModal({
          title: '注册失败提示',
          content: error.message
        });
      }).finally(() => {
        this.setData({
          loadingRegister: false
        })
      });
    })
  },

  /**
   * 设置 IM 事件监听
   */
  addEventListenersOfIM() {
    const im = app.getIM();
    im.on({
      loginSuccess: this.loginSuccess,
      loginFail: this.loginFail
    });
  },

  /**
   * 移除 IM 事件监听
   */
  removeEventListenersOfIM() {
    const im = app.getIM();
    im.off({
      loginSuccess: this.loginSuccess,
      loginFail: this.loginFail
    });
  },

  /**
   * 登录成功
   */
  loginSuccess() {
    this.setData({
      loadingSign: false
    }, () => {
      wx.navigateTo({
        url: '/pages/home/home',
      });
    });
  },

  /**
   * 登录失败提示
   * @param {*} error
   */
  loginFail(error) {
    this.setData({
      loadingSign: false
    }, () => {
      wx.showModal({
        title: '登录失败提示',
        content: error
      });
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.addEventListenersOfIM();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.removeEventListenersOfIM();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})