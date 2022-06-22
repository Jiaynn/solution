// pages/chatroom/chatroom.js
import request from '../../api/request';
import { generateFileName } from '../../utils/file';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    inputValue: '',
    messageId: 0,
    sendButtonVisible: false,
    voiceBlockVisible: false,
    voicing: false,
    emojiPickerVisible: false
  },

  /**
   * 插入 emoji
   * @param event
   */
  insertEmoji(event) {
    console.log('insertEmoji', event)
    const { emotionName } = event.detail;
    const { inputValue } = this.data;
    this.setData({
      inputValue: inputValue + emotionName
    })
  },

  /**
   * 删除 emoji
   * @param event
   */
  deleteEmoji(event) {
    const { inputValue } = this.data;
    this.setData({
      inputValue: inputValue.slice(0, inputValue.length - 1)
    })
  },

  /**
   * 切换 emoji 组件显隐
   */
  toggleEmojiPickerVisible() {
    this.setData({
      emojiPickerVisible: !this.data.emojiPickerVisible
    })
  },

  /**
   * 打开文档
   * @param event
   */
  openDocument(event) {
    const url = event.target.dataset.url;
    wx.downloadFile({
      url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功', res)
          },
          fail(err) {
            wx.showModal({
              title: '文档打开失败',
              content: JSON.stringify(err)
            })
          }
        })
      }
    })
  },

  /**
   * 语音播放
   * @param event
   */
  playVoice(event) {
    const url = event.target.dataset.url;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = url;
    innerAudioContext.onError((err) => {
      wx.showModal({
        title: '语音播放失败',
        content: JSON.stringify(err)
      })
    })
    innerAudioContext.onStop(res => {
      console.log('语音播放结束: ', res)
    })
    innerAudioContext.play();
  },

  /**
   * 发送图片消息
   */
  sendImageMessage() {
    return wx.chooseImage().then(res => {
      return this.uploadFileToOSS({
        file_type: 102,
        tempFilePaths: res.tempFilePaths
      });
    }).then(res => {
      const fileInfo = {
        dName: 'file',
        url: res.ossConfig.download_url
      };
      app.getIM().sysManage.sendGroupMessage({
        type: 'image',
        gid: this.imGroupId,
        content: "",
        attachment: fileInfo
      });
    });
  },

  /**
   * 上传文件, 首先获取聊天文件上传地址, 然后进行上传
   * @param config
   * @returns {*}
   */
  uploadFileToOSS(config) {
    const { tempFilePaths, ...restConfig } = config || {};
    return app.getIM().sysManage.asyncGetFileUploadChatFileUrl({
      to_id: this.imGroupId,
      to_type: 2,
      ...restConfig
    }).then(ossConfig => {
      const token = app.getIM().userManage.getToken();
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: ossConfig.upload_url,
          filePath: tempFilePaths[0],
          name: "file",//后台要绑定的名称
          header: {
            "Content-Type": "multipart/form-data",
            'access-token': token,
            'app_id': app.globalData.appid,
          },
          //参数绑定
          formData: {
            OSSAccessKeyId: ossConfig.oss_body_param.OSSAccessKeyId,
            policy: ossConfig.oss_body_param.policy,
            key: ossConfig.oss_body_param.key,
            signature: ossConfig.oss_body_param.signature,
            callback: ossConfig.oss_body_param.callback
          },
          success: res => {
            resolve(Object.assign(res, {
              ossConfig
            }));
          },
          fail: err => {
            reject(err)
          }
        });
      })
    });
  },

  /**
   * 发送文件消息
   */
  sendFileMessage() {
    return wx.chooseMessageFile().then(res => {
      const tempFilePaths = res.tempFiles.map(file => file.path);
      return this.uploadFileToOSS({
        file_type: 101,
        tempFilePaths
      });
    }).then(res => {
      const fileInfo = {
        dName: 'file',
        url: res.ossConfig.download_url
      };
      app.getIM().sysManage.sendGroupMessage({
        type: 'file',
        gid: this.imGroupId,
        content: "",
        attachment: fileInfo
      });
    });
  },

  /**
   * 语音中
   */
  startRecord() {
    const recorderManager = wx.getRecorderManager()
    this.recorderManager = recorderManager;
    recorderManager.onError((res) => {
      console.log("录音错误: ", res);
    });
    recorderManager.onStop(res => {
      this.startTime = this.startTime || 0;
      this.recorderDuration = Math.ceil((new Date().getTime() - this.startTime) / 1000);
      this.preUpload(res.tempFilePath);
      console.log("录音完成: ", res.tempFilePath);
    });
    const options = {
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
    };
    recorderManager.start(options);
    this.setData({
      voicing: true
    })
    this.recorderTimer = setTimeout(() => {
      this.stopRecord();
    }, 30000);
  },

  /**
   * 语音结束并发送
   */
  stopRecord() {
    const recorderManager = this.recorderManager;
    if (this.recorderTimer) clearTimeout(this.recorderTimer);
    if (recorderManager) {
      this.setData({
        voicing: false
      }, () => {
        recorderManager.stop();
      })
    }
  },

  /**
   * 获取聊天文件上传地址
   * @param tempFilePath
   */
  preUpload(tempFilePath) {
    app.getIM().sysManage.asyncGetFileUploadChatFileUrl({
      file_type: 104,
      to_id: this.imGroupId,
      to_type: 2
    }).then(res => {
      this.uploadVoice(tempFilePath, res)
    })
  },

  /**
   * 上传音频
   * @param path
   * @param param
   */
  uploadVoice(path, param) {
    const token = app.getIM().userManage.getToken();
    wx.uploadFile({
      url: param.upload_url,
      filePath: path,
      name: 'file',// 后台要绑定的名称
      header: {
        "Content-Type": "multipart/form-data",
        'access-token': token,
        'app_id': app.globalData.appid,
      },
      //参数绑定
      formData: {
        OSSAccessKeyId: param.oss_body_param.OSSAccessKeyId,
        policy: param.oss_body_param.policy,
        key: param.oss_body_param.key,
        signature: param.oss_body_param.signature,
        callback: param.oss_body_param.callback
      },
      success: res => {
        this.sendVoiceMessage(param.download_url);
      },
      fail: function (res) {
        console.log("。。录音保存失败。。", res);
      }
    });
  },

  /**
   * 发送音频消息
   * @param url
   */
  sendVoiceMessage(url) {
    const fileInfo = {
      dName: 'file',
      url,
      duration: this.recorderDuration
    };
    app.getIM().sysManage.sendGroupMessage({
      type: 'audio',
      gid: this.imGroupId,
      content: "",
      attachment: fileInfo
    });
  },

  /**
   * 切换语音识别块显示隐藏
   */
  toggleVoice() {
    const { voiceBlockVisible } = this.data;
    this.setData({ voiceBlockVisible: !voiceBlockVisible })
  },

  /**
   * 加入聊天室(群组)
   */
  joinChatRoom() {
    return request({
      url: '/v1/mock/group',
      method: 'post',
      data: {
        group_id: this.groupId
      }
    }).then(response => {
      this.imGroupId = response.data.im_group_id;
      return app.getIM().chatroomManage.join(this.imGroupId);
    }).finally(() => {
      // if (this.imGroupId) {
      //   // 获取历史记录
      //   app.getIM().sysManage.requireHistoryMessage(this.imGroupId, 0, 20);
      // }
      this.setEventListeners();
    });
  },

  /**
   * 输入要发送的内容
   * @param event
   */
  onChangeInputValue(event) {
    const inputValue = event.detail;
    this.setData({
      inputValue,
      sendButtonVisible: !!inputValue
    });
  },

  /**
   * 发送消息
   */
  sendTextMessage() {
    const { inputValue } = this.data;
    const cuid = app.getIM().userManage.getUid() + '';
    const message = {
      content: JSON.stringify({
        action: 'pubChatText',
        msgStr: {
          senderId: cuid,
          senderName: '',
          msgContent: inputValue
        }
      }),
      gid: this.imGroupId
    };
    app.getIM().sysManage.sendGroupMessage(message);
    this.setData({
      inputValue: ''
    });
  },

  /**
   * 设置 IM 事件监听
   */
  setEventListeners() {
    app.getIM().on({
      onGroupMessage: this.onGroupMessage,
      // onMessageStatusChanged: response => {
      //   console.log('response1', response);
      // },
      // onSendingMessageStatusChanged: response => {
      //   console.log('response2', response);
      // },
      // onRosterMessage: response => {
      //   console.log('response3', response);
      // }
    });
  },

  /**
   * 监听消息
   * @param {*} message
   */
  onGroupMessage(message) {
    const content = JSON.parse(message.content || '{}');
    const {
      messages: prevMessages
    } = this.data;
    const messages = [
      ...prevMessages,
      {
        ...message,
        content
      }
    ];
    this.setData({
      messages,
      messageId: messages.length - 1
    });
  },

  /**
   * 解析 emoji
   * @param emoji
   * @returns {*}
   */
  parseEmoji(emoji) {
    const emojiInstance = this.selectComponent('.mp-emoji')
    return emojiInstance.parseEmoji(emoji);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.groupId = options.groupId;
    this.joinChatRoom();
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
    console.log('leave')
    app.getIM().off({
      onGroupMessage: this.onGroupMessage
    });
    // app.getIM().chatroomManage.leave(this.imGroupId);
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
});