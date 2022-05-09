

class Screen_instance {
  constructor() {
    this.loading = document.createElement("div");
    this.loading.id = "#loader";
    this.loader = null;
    this.network = true,
    this.audio_video_throttle = true
  }
  loading_screen(text, reconnecting) {
    /*
    this[reconnecting || `loader`] = ElementUI.Loading.service({
      text: text,
      body: true,
      background: `rgba(0,0,0,0.4)`
    })
    */
  }
  prompt_screen(mes, type, callback) {
    this.loading.$message({
      message: mes,
      center: true,
      type: type || `info`,
      onClose: callback || function() {}
    });
  }
  // 成员进入 / 退出提示
  /*
  notification_box(mes) {
    this.loading.$notify({
      offset: 50,
      showClose: false,
      dangerouslyUseHTMLString: true,
      customClass: `member_in_out_notice`,
      message: `<dl class="notification_box">
                  <dt><img src="./static/img/whiteboard/${mes.type === `success` ? `user-in` : `user-out`}.png"></dt>
                  <dd class="normal-color">${mes.name}</dd>
                  <dd class="${mes.type === `success` ? `green` : `red`}-color">${mes.type === `success` ? `进入` : `退出`}</dd>
                  ${app_pool.meetingInfo.message.session.roleId == 4 && store.state.whiteboard.voiceOff ? `
                  <video src="${mes.type === `success` ? store.state.whiteboard.open_room.assets.userJoinBeep : store.state.whiteboard.open_room.assets.userLeaveBeep}" 
                    style="{disply:${app_pool.meetingInfo.message.session.roleId == 4 && store.state.whiteboard.voiceOff ? 'inline' : 'none'}}" autoplay="autoplay"></video>`:""}
                </dl>`
    })
  }
  */


  //成员开启/关闭摄像头与麦克风/网络/文件上传--的通知

  //mes.type 值为 "audio"代表麦克风 或者 "video"代表摄像头  或者  "network" 代表网络
  //mes.event 值为 true/false 开启/关闭  只有当type为  audio  或者 video 时，该字段有值
  //mes.nickName   代表昵称
  //mes.headPic    代表头像
  notification_audio_video_network(mes){
    let offset = 50
    if(mes.type == 'video' || mes.type == 'audio'|| mes.type === "network") {
      if(!this.network) return;
      mes.type === "network" ? this.network = false : this.audio_video_throttle  = false
      setTimeout(() => {this.audio_video_throttle = true},mes.type === "network" ? 30000 : 500)
    }
    // if(mes.type === "network") {
    //   if(!this.network) return ;
    //   this.network = false;
    //   setTimeout(() => {this.network = true},30000)
    // }
    Notification({
      title: '',
      offset: 50,
      duration: mes.action == 3 && 0 || 2000,//显示时间, 毫秒。设为 0 则不会自动关闭
      dangerouslyUseHTMLString: true,
      showClose: mes.action == 3 && true || false,//是否显示关闭按钮
      message: `  
        <div style="display: flex; height: 30px; text-align: 30px;align-items:center">
          <div style="width:30px; height: 30px; overflow: hidden;border-radius: 50%;flex:0 0 30px; margin-right: 10px">
            <img src=${mes.headPic} alt="头像" style="width: 100%;height: 100%;">
          </div>
          <div style="flex-grow: 1;display: flex">
            <div style="max-width:58px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${mes.nickName}</div>${
              mes.type == 'audio' && '麦克风' || mes.type == 'video' && '摄像头' || mes.type == 'network' && '网络差'
              ||mes.type == "upload" && "上传" || ""}
            <div style="max-width:100px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${mes.action && mes.name || ''}</div>
            ${ mes.event == 1 && '关闭' || mes.event == 2 && '开启' || mes.action == 3 && '失败'|| mes.action == 2 && '成功' || ''}
          </div>
        <div>`
    })
  }
  stu_notification(type, name) {
    /*
    let html = ``;
    if (type === 1) {
      app_pool.meetingInfo.sound_network.all_clear();
      html = `<p class="stu-dad">你已被老师<span> 结束发言</span></p>`;
    }
    if (type === 2) html = `<p class="stu-dad">老师<span>拒绝</span>了你的举手</p>`;
    if (!type) html = `<p class="stu-dad under-wheat">${name}已<span> 结束发言</span></p>`;
    if (type === 5) html = `<p class="stu-dad under-wheat">${name}<span> 正在举手申请</span></p>`;
    if (type === 4) html = `<p class="stu-dad">你已被老师<span class="agree-raise"> 上麦</span></p>`;
    if (type === 3) html = `<p class="stu-dad">老师<span class="agree-raise">同意</span>了你的举手</p>`;
    if ((type === 3 || type === 4) && store.state.audio_initiative) store.commit(`switch_audio_video`, `Audio`);
    this.loading.$notify({
      offset: 50,
      message: html,
      showClose: false,
      dangerouslyUseHTMLString: true,
      customClass: `stu_notification`
    })
    */
  
  }
  // 交互式弹窗
  message_box(mes, successCallback, errorCallback) {
    /*
    this.loading.$confirm(mes.message, mes.title || ``, {
      center: true,
      showClose: false,
      type: mes.type || `warning`,
      confirmButtonClass: `deskboard`,
      cancelButtonClass: `deskboard-cancel`,
      cancelButtonText: mes.cancelText || `取消`,
      confirmButtonText: mes.confirmText || `确定`
    }).then(() => {
      successCallback();
    }).catch(() => {
      errorCallback ? errorCallback() : console.log(`点击取消`);
    })
    */
  }
  // 复杂交互式弹窗
  complex_message_box(mes) {
    /*
    this.loading.$msgbox({
      center: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      title: mes.title || `温馨提示`,
      dangerouslyUseHTMLString: true,
      confirmButtonClass: `deskboard`,
      showClose: Boolean(mes.showClose),
      cancelButtonClass: `deskboard-cancel`,
      showCancelButton: Boolean(mes.showCancelButton),
      cancelButtonText: mes.cancelButtonText || `关闭`,
      confirmButtonText: mes.confirmButtonText || `确定`,
      message: mes.img ? mes.message :`<p>${mes.message}</p>`,
      callback: (action) => {
        if (mes.callback) mes.callback(Number(action === `confirm`));
        if (mes.report && mes.report.toastAdd) app_pool.toast_report(mes.report);
        if (action === `confirm` && mes.url) app_pool.toast_report(null, mes.url);
      }
    })
    */
  }
  // 当前环境不支持webAssembly
  assembly_finished(is_not_support) {
    /*
    if (is_not_support) {
      app_pool.buried_point(`count`, `not_support_assembly`);
      store.commit(`update_state`, {module: `whiteboard`, key: `not_support_assembly`, value: true});
    }
    if (this.loader) this.loader.close();
    config.hide_startup();
    */
  }
  // 异常上报并提示
  exception_handling(err) {
    setTimeout(() => {
      app_pool.buried_point(`count`, `assembly_exception`, process.statistics());
      if (typeof err === `string` && err.includes(`No WebAssembly support found`)) this.assembly_finished(true);
      else this.prompt_screen(`程序内部错误，请退出重进`, `error`);
    }, 0)
  }
}
export default new Screen_instance();
