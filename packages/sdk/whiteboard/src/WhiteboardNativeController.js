import tool from "./Tool.js"
import controller from './WhiteboardController.js'
import download from './download.js'
import request from "./request.js"
import webSocket from "./WebSocket.js"


export class WhiteboardNativeController {
  constructor() {
    this.bytes_length = 0;
    this.init_audio = false;
    this.resize_timer = null;
    this.current_schedule = 0;
    this.whiteboard_size = null;

    this.onWebassemblyStatusChange = null;
  }
  registered() {
    window.call_js = (command, params) => this.distribution(command, params ? JSON.parse(tool.utf8to16(params)) : params);
  }
  distribution(commands, params) {
    console.log("-----------------------command-------------------------",commands)
    console.log(params);
    switch (commands) {
      case `testcall`:
        console.log(`白板log：`, params);
        break;
      case `prepare`:
      //  command.open_room()
        // store.commit(`update_signal`, {is_prepared: true});
        controller.onNativeEventRaised(controller.Event.WebassemblyReady);
        break;
      case `initFinish`:
        // store.commit(`update_signal`, {is_initFinish: true});
        // app_pool.join_room(false, JSON.parse(JSON.stringify(app_pool.meeting_init_mes)));
//        request.joinMeeting(command.config.joinString);
        this.webassembly_initlaized = true;

        break;
      case `fileNetwork`:
        request.assemblyHttp(params).then(data => {
          console.log("request result:");
          console.log(data);
          controller.file_network({
            result: true,
            command: `fileNetwork`,
            params: JSON.stringify(params),
            data: typeof data === `string` ? data : JSON.stringify(data)
          });
        }).catch((error) => {
          console.log(error);
          controller.file_network({result: false, command: `fileNetwork`, params: JSON.stringify(params), data: ``})
        });
        break;
      case `download`:
        if (!params.objectName || !params.md5) return;
         let fileGroupId = params.fileGroupId;
         download.signatureUrl(params.objectName, params.md5, fileGroupId,controller.config.joinString).then(url => {
           controller.send_download_url({command: `download`, params: JSON.stringify(params), url: url});
         });
        break;
    //   case `JSDownloadFail`:
    //     app_pool.buried_point(`count`, file_load_step[`download_${params.type}_failed`], params.objectName);
    //     break;
    //   case `JSDownloadFinish`:
    //     app_pool.buried_point(`count`, file_load_step[`download_${params.type}_success`], params.objectName);
    //     break;
      case `readPDF`:
        // process.report(process.read_pdf);
        download.readFile(`readPDF`, params);
        break;
    //   case `downloadActionFinish`:
    //     process.report(process.download_action_finished);
    //     let recordId = store.state.playback.record.recordId;
    //     command_enu.playback({actionPath: `${recordId}.zip`, name: `${recordId}.txt`});
    //     break;
        case `playbackInitFinish`:
          if (!params.result) {
            process.report(process.playback_init_failure);
            return screen_instance.message_box({title: `提示`, message: `回放加载失败`, confirmText: `重试`}, () => {
              this.distribution(`downloadActionFinish`);
            }, () => root.app.$router.back());
          }
          this.whiteboard_size = {width: params.displayWidth, height: params.displayHeight};
          this.set_size(config.set_canvas_style(this.whiteboard_size, true, false, false));
          break;
      case `documentChange`:
          controller.onNativeEventRaised(controller.Event.DocumentChange,params);
          break;
    //     break;
      case `fileScroll`:
          controller.onNativeEventRaised(controller.Event.WidgetScroll,params);
      break;
      case `backgroundColorChanged`:
          controller.onNativeEventRaised(controller.Event.BackgroundChange,params.backgroundColor);
          break;
      case `widgetActivity`:
          controller.onNativeEventRaised(controller.Event.WidgetActivity,params);
         break;
       case `widgetAction`:
         controller.onNativeEventRaised(controller.Event.WidgetAction,params);
    //     if(params.action > 1){
    //       let person = store.state.permission.participant.find(item => item.sessionId === params.sessionId)
    //       // store.state.whiteboard.file_prompt_state = {params, person}
    //       screen_instance.notification_audio_video_network({type: 'upload', headPic:person.headPic, action: params.action, nickName: person.nickName, name: params.name})
    //     }
    //     params.user_name = store.state.permission.participant.find(item => item.sessionId === params.sessionId).nickName;
    //     store.commit(`operation_prompt`, params); 
        break;
      case `fileFlip`:
          controller.onNativeEventRaised(controller.Event.FileFlip,params);
        break;
    //   case `playbackInfo`:
    //     if (!store.state.playback.record) return;
    //     this.current_schedule = params.currentPosition;
    //     let playback = store.state.playback, rate_statistics = app_pool.meetingInfo.rate_statistics;
    //     // 有效播放率统计
    //     let fn = (rate, num) => {
    //       if (rate_statistics[rate] && params.currentPosition && !((params.currentPosition / playback.totalTime * 100) < num)) {
    //         rate_statistics[rate] = false;
    //         app_pool.buried_point(`count`, `play_rate_${num}`);
    //       }
    //     };
    //     for(let i = 20; i < 100; i += 30) fn(i === 20 ? `twenty` : (i === 50 ? `fifty` : `eighty`), i);
    //     if (playback.is_drag) return;
    //     if (playback.record.mediaUrl) {
    //       if (playback.player_state === 2) {
    //         if (playback.player && params.state === 1) {
    //           playback.player.seek(0);
    //           playback.player.pause();
    //         }
    //         if (params.state === 2) {
    //           let audio_state = playback.player.getStatus();
    //           if (!this.init_audio && !(audio_state === `playing`)) {
    //             this.init_audio = true;
    //             playback.player.play();
    //             playback.player.pause();
    //           }
    //           if (!(params.currentPosition < playback.record.offsetTime) && !(audio_state === `playing`)) {
    //             playback.player.play();
    //             if (!(audio_state === `waiting`)) playback.player.seek((params.currentPosition - playback.record.offsetTime) / 1000);
    //           }
    //         }
    //       }
    //       if (playback.player_state === 3) store.commit(`update_state`, {module: `playback`, key: `player_state`, value: 2});
    //     }
    //     store.commit(`update_state`, {module: `playback`, key: `schedule`, value: params.currentPosition});
    //     if (!(playback.state === params.state)) store.commit(`update_state`, {module: `playback`, key: `state`, value: params.state});
    //     if (params.state === 1 && playback.totalTime) {
    //       store.commit(`set_playState`, {before: 2, after: 0});
    //       store.commit(`update_state`, {module: `playback`, key: `player_state`, value: 1});
    //     }
    //     break;
      case `sendWebsocket`:
    //     let meetingInfo = app_pool.meetingInfo.message;
        console.log("sendWebSocket:"+ controller.me.sessionId);
        webSocket.send_message(params.command, [controller.room.meetingId, controller.me.sessionId, tool.zip(params.params)]);
        break;
      case `recoveryState`:
          controller.onNativeEventRaised(controller.Event.recoveryState,params);
        break;
      case `bucketOffset`:
        break;
      case `documentSize`:
       {
        let size_data = {};
        let offset_position = {};
        size_data.w = params.maxWidth || size_data.w;
        size_data.h = params.maxHeight || size_data.h;
        size_data.v_w = params.currentWidth || size_data.v_w;
        size_data.v_h = params.currentHeight || size_data.v_h;
        offset_position.offsetY = params.offsetY ? Math.abs(params.offsetY) : offset_position.offsetY;
        offset_position.x = params.offsetX ? (Math.abs(params.offsetX) + size_data.v_w) : offset_position.x;
        offset_position.y = params.offsetY ? (Math.abs(params.offsetY) + size_data.v_h) : offset_position.y;
       }
       controller.onNativeEventRaised(controller.Event.WhiteboardSizeChanged,params);
        break;
    //   case `textRequest`:
    //     download.text_to_image(params);
    //     break;
    //   case `judgeFileResult`:
    //     download.text_to_image(null, params);
    //     break;
    //   case `getData`:
    //     store.commit(`update_activity_text`, params);
    //     break;
    //   case `textFocus`:
    //     store.commit(`update_activity_text`, {textWidth: 400, x: params.x, y: params.y});
    //     break;
      case `svgRequest`:
//        download.svg_to_image(params);
        break;
      case 'resourceReady':
        console.log("resource ready:",params);
        break;
      case `loadingBegin`:
        console.log("loading begin");
        break;
    }
  }
  set_size(size, resize) {
    console.log('size--------------',size)
    controller.canvas_actual_size = {width: size.originWidth, height: size.originHeight};
    if (!resize) this.send_message({command: `prepareInit`, width: size.width, height: size.height, useSkia: false}, 0);
    this.send_message({command: `setSize`, width: size.width, height: size.height}, 0);
    this.send_message({command: `setOriginalSize`, width: size.originWidth, height: size.originHeight}, 0);
  }
  window_resize(e) {
    if (location.href.includes(`whiteboard_index`) && e.target === window) this.set_size(config.set_canvas_style(this.whiteboard_size), true);
    if (location.href.includes(`activity_playback`) && store.state.playback.is_PC) {
      if (this.resize_timer) {
        clearTimeout(this.resize_timer);
        this.resize_timer = null;
      }
      this.resize_timer = setTimeout(() => {
        let playback = store.state.playback;
        if (playback.player_state === 2) {
          if (playback.player) playback.player.pause();
          controller.playback_operation({type: 1, time: ``});
        }
        this.set_size(config.set_canvas_style(this.whiteboard_size, true, false, true), true);
        if (playback.player_state === 2) controller.playback_operation({type: 0, time: ``});
      }, 500)
    }
  }
  send_message(data, method, type, subType) {
    let data_str = JSON.stringify(data), bytes_length = tool.stringToBytes(data_str).length;
    if (bytes_length > this.bytes_length) {
      this.bytes_length = bytes_length;
      _set_params_length(bytes_length);
    }
    tool.writeString(data_str, _get_input_str());
    if (method === 0){
      console.log("writing string:",data_str);
      _push_command(bytes_length);

    } 
    if (method === 1) _receive_websocket_message(type, subType, bytes_length);
  }
}
export default new WhiteboardNativeController();
