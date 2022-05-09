import { parseRoomToken } from '../../utils/token';

// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomToken: ''
  },

  /**
   * 加入聊天室
   */
  onJoinChatroom() {
    const { roomToken } = this.data;
    const roomName = parseRoomToken(roomToken).roomName;
    console.log('roomName', roomName);
    wx.navigateTo({
      url: `/pages/chatroom/chatroom?groupId=${roomName}`,
    });
  },

  /**
   * 随机生成 roomToken
   */
  onGenerateRoomToken() {
    const roomTokens = [
      'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:bPnzujqVtlZwIvHEHMTwapyk2b0=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwODU0MTMzLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoianNlcjEiLCJ1c2VySWQiOiJqdXNlcjEifQ==',
      'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:Ujga8UkLkmizpwTEq0bc95tMYIA=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwODU0MTMzLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoianNlcjIiLCJ1c2VySWQiOiJqdXNlcjIifQ==',
      'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:MDxnzjjeBwpj92nCtsjfMXVRwtk=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwODU0MTMzLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoianNlcjMiLCJ1c2VySWQiOiJqdXNlcjMifQ=='
    ];
    const index = Math.floor(Math.random() * roomTokens.length);
    const roomToken = roomTokens[index];
    this.setData({
      roomToken
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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