import tool from "./sdk/Tool.js"
import command from "./sdk/WhiteboardController.js"
import request from "./network/request.js"
import webSocket from "./network/WebSocket.js"


class Pool {
  constructor() {
    this.environment = tool.get_device();
    this.initialization = tool.handle_href();
    // this.meetingInfo = null
    // Promise.all([new FontFaceObserver("Roboto").load(null, 60000), new FontFaceObserver("Source Han Sans").load(null, 60000)]).then(() => this.font_ready = true)
  }
  prepared() {
    return store.state.playback.is_prepared && this.font_ready;
  }
  open_room(meetingInfo) {
    // store.commit(`update_state`, {module: `desk_board`, key: `meetingInfo`, value: meetingInfo});
    webSocket.socket_connection(meetingInfo.roomUrl);
    command.open_room();
    command.enable_select_svg();
  }
  join_room(is_open_socket, init_mes) {
    if (is_open_socket) this.is_open_socket = true;
    else this.meetingInfo = new meetingInfo(init_mes);
    if (this.is_open_socket && this.meetingInfo && this.meetingInfo.message.meetingId) request.joinMeeting();
  }
  enter_room(meetingId, path) {
    routing.whiteboard = path;
    screen_instance.loading_screen(`正在进入...`);
    desk_request.getMeetingModeInfo(meetingId).then(info => this.open_room(info)).catch(msg => {
      screen_instance.loader.close();
      screen_instance.prompt_screen(msg, `error`);
    })
  }
 

  // 弹框状态上报
  toast_report(toast, url) {
    if (url) {
      if (config.terminal === `Web`) window.open(url);
      if (config.terminal === `Windows`) bridge.open_browser(url);
      return;
    }
    if (toast.toastAdd.type === `checkBox`) desk_request.toastClick(Number(document.querySelector("#toastCheckBox").querySelector("input").checked), toast.toastType);
  }
  // 极光统计
}
export default new Pool();
