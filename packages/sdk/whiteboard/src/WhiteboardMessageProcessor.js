import controller from './WhiteboardController.js'
import native from './WhiteboardNativeController.js'
import tool from "./Tool.js"

class WhiteboardMessageProcessor
{
    onMessage(data)
    {
        let type = data.messageDefine.type, subType = data.messageDefine.subType, finalData = JSON.parse(tool.unzip(data.data));
        console.log(type, subType,  finalData)
        switch (type) {
          case 0: 
          if(subType == 0)
          {
            controller.init_config(finalData);
          }
            break;
          // 有人加入（离开）会议
          case 1:
            //   if(subType == 1)
              {
                  native.send_message(finalData,1,type,subType);
              }
              break;
          case 10:
              switch(subType)
              {
                //文档列表更新
                case 0:
                  console.log("type:10 subtype:" + subType + "params:" + finalData);
                  controller.dispatchEvent(controller.Event.PageListChanged,finalData);
                  break;
              }
            break;
          case type === 0 && (subType === 1 || subType === 2):
            // store.commit(`update_participant`, {type, subType, data: finalData});
            // if (subType === 1) store.commit(`root_operation`, {type, subType, data: finalData});
            break;
          // 微课文件保存成功
          case type === 0 && subType === 3:
            console.log(finalData)
            // store.commit(`micro_saved_preview`, finalData);
            break;
          // 聊天消息发送状态
          case type === 3 && (subType === 0 || subType === 1):
            // store.commit(`receive_chat`, {type, subType, chat: finalData});
            break;
          // 文件上传成功
          case 5:
            if(subType === 0)
            {
              native.send_message(finalData,1,type,subType);
              console.log("found 5-0");
             
            }
            // app_pool.buried_point(`count`, file_load_step.loading, finalData.objectName);
            break;
          // 会议状态改变
          case type === 6:
            // store.commit(`update_meeting_state`, {type, subType, data: finalData});
            break;
          // 异常消息处理
          case type === 7:
            // store.commit(`exception_message`, {type, subType, data: finalData});
            break;
          // 权限改变
          case type === 8:
            // store.commit(`update_permission`, {type, subType, data: finalData});
            break;
          // 白板缩略图更新
          case type === 10 && subType === 1:
            // store.commit(`update_document`, {key: `url`, id: finalData.documentId, url: finalData.url});
            break;
          // 其他人权限改变
          case type === 12:
            // store.commit(`update_remote_permission`, {type, subType, data: finalData});
            // store.commit(`update_permission`, {type: 8, subType: 5, data: finalData});
            break;
          // 白板服务器下发的通知类消息
          case type === 13:
            // store.commit(`notice_message`, {type, subType, data: finalData});
            break;
          // 有学生申请视频权限
          case type === 11 && subType === 0:
            // store.commit(`root_operation`, {type, subType, data: JSON.parse(finalData.value).sessionId});
            break;
          //奖励播放动画类型
          case type === 17:
            // store.commit(`update_animation`, {type, subType, data: finalData});
            break;
          //轮播时间改变
          case type === 15 && subType === 0:
            // store.commit(`update_carousel`, {type, subType, data: finalData});
            break;
          default:
            break;
        } 
    }
}
export default new WhiteboardMessageProcessor();