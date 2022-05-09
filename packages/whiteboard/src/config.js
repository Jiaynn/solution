let global_config = {
  /* 版本号 */ 
  version: `2.3.9`,

  /* 终端描述 */ 
  terminal: `Web`,
  // terminal: `Windows`,

  /* 是否使用skia绘图引擎 */ 
  svg: 0,
  skia: 0,
  select_svg: false,

  /* 阿里云OSS-SDK配置信息 */
  secure: true,
  bucket: `deskboard`,
  // bucket: `trainboard`,
  public_bucket: `commonshared`,
  comment_fileGroupId: `comment`,
  public_fileGroupId: `commonshared`,
  endpoint: `https://oss-cn-beijing.aliyuncs.com`,
  
  /* 声网SDK配置信息 */
  agoraAPPID: `be1e941c2f3e44989bb36768c93e9255`,
  // agoraAPPID: `9963ea36d8f84d648030ec81c3c4eb22`,

  /* 腾讯实时音视频SDK配置信息 */
    // TRTCAPPID: 1400379499,
  // SCTRTCAPPID: 1400376147,

  /* 极光统计SDK配置信息 */
  onOff: true,
  channel: `desk-board`,
  // appKey: `ecd0cf69eb97875cf5c53e66`, // 回放
  // appKey: `b508bbca61aaca3c0f28d101`, // PC
  appKey: `167e56f06a6d4c83dd2e4264`, // web

  /* 微信h5支付 */
  redirect: `&redirect_url=${encodeURIComponent(`https://edu.xbbedu.cn:8071/MeetingServer/pay/index.html#/account_recharge`)}`,
  // redirect: `&redirect_url=${encodeURIComponent(`https://test4.xbbedu.cn:8071/MeetingServer/deskboard_web/index.html#/account_recharge`)}`,


  /* 文字输入 padding */ 
  padding: 64,

  /* 赋予角色身份信息 */
  control: roleId => { return { controller: roleId === 4, controlled: roleId === 5 } },

  /* 应用跳转外部链接 */ 
  jump_link: link => {
    let a = document.createElement(`a`);
    if (!link) a.setAttribute(`target`, `_blank`);
    a.setAttribute(`href`, link || `https://web.xbbedu.cn/help/help_list.html`);
    a.click();
  },

  /* el-drawer样式设置 */
  set_drawer_style: (width, top, bottom, offset = 0, scroll) => {
    offset = offset == 'right' ? document.body.clientWidth - document.querySelector("canvas").clientWidth - document.querySelector("canvas").offsetLeft + 5 + "px" : offset
    document.querySelector(`.to-chat-class`).style.cssText += `width: ${width}; height: 92%; right: ${offset} `;
    if(!scroll)setTimeout(() => document.querySelector(`.el-scrollbar`).style.cssText += `top: ${top || 0}px; bottom: ${bottom || 0}px; padding-bottom: 10px`, 0);
  },

  /* 初始化canvas */
  set_canvas_style: (mes, is_playback, is_full_screen, is_PC) => {
    let canvas = document.querySelector(`#canvas`), clientWidth = document.body.clientWidth, clientHeight = document.body.clientHeight;
    let width = is_full_screen ? clientHeight : clientWidth, initialization__width = width, menu_height = clientWidth < 992 ? 35 : 20;
    let height = is_full_screen ? clientWidth : (is_PC ? clientHeight - 39 : (is_playback ? clientHeight : clientHeight - menu_height));
    let devicePixelRatio = window.devicePixelRatio > 1.25 ? 1.25 : window.devicePixelRatio;
    if ((height * mes.width / mes.height) > width) height = width * mes.height / mes.width;
    else width = height * mes.width / mes.height;
    width = Math.floor(width);
    height = Math.floor(height);
    width = (width % 2 === 1) ? (width - 1) : width;
    height = (height % 2 === 1) ? (height - 1) : height;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.cssText += `width: ${width}px; height: ${height}px; 
    left: ${(initialization__width - width) / 2}px; 
    top: ${is_playback ? (is_PC ? 0 : 20) : menu_height/2}px;
    border-radius: 5px; z-index: 1`;
    if (is_playback) document.querySelector(`.canvas-placeholder`).style.height = `${height}px`;
    return {
      originWidth: width,
      originHeight: height,
      width: width * devicePixelRatio,
      height: height * devicePixelRatio
    };
  },

  /* 启动页显示隐藏 */
  hide_startup(onOff) {
    document.querySelector(`#startup`).style.display = onOff ? `block` : `none`;
  },

  /* 弹框内容 */ 
  toast_content(toast) {
    if (toast === `audio`) return `<audio controls id="audio-detector" src="../../../../static/text/music.mp3"></audio>`;
    if (toast.toastAdd.type === `checkBox`) return `${toast.content}<div id="toastCheckBox"><input type="checkbox" />&nbsp;${toast.toastAdd.title}</div>`;
  }
};