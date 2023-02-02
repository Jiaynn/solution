import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { jsonStringToObject } from '../../utils/parse';
import attachmentIconImage from '../../images/attachment-icon.png';
import css from './index.module.scss';

interface Props {
  messages: any[];
}

const ChatroomMessageBox = (props: Props) => {
  const messageContainer = useRef<HTMLDivElement>(null);
  /**
   * 消息更新后自动滚动到底部
   */
  useEffect(() => {
    const scrollEle = messageContainer.current;
    if (scrollEle) {
      scrollEle.scrollTop = scrollEle.scrollHeight;
    }
  }, [props.messages]);

  /**
   * 打开附件
   * @param message
   */
  const onOpenAttachment = (message: any) => {
    console.log('message', message)
    const fileUrl = _.get(message, 'attach.url');
    if (fileUrl) {
      window.open(message.attach.url)
    } else {
      message.error('文件打开失败')
    }
  };

  /**
   * 语音播放
   * @param message
   */
  const playVoice = (message: any) => {
    const voiceUrl = _.get(message, 'attach.url');
    if (voiceUrl) {
      const audio = new Audio(voiceUrl);
      audio.play().catch(err => message.error(err.message()));
    } else {
      message.error('语音播放失败')
    }
  }

  return <div ref={messageContainer} className={css.messageArea}>
    {
      props.messages.map((message: any) => {
        const messageContent = _.get(message, 'content') || '{}';
        const contentObject = jsonStringToObject(messageContent);
        const msgStr = jsonStringToObject(contentObject.msgStr || '{}');
        // console.log('msgStr', contentObject.msgStr)
        const senderId = _.get(msgStr, 'senderId') || '';
        const msgContent = _.get(msgStr, 'msgContent') || '';
        return <div className={classNames(css.messageCtx, {
          [css.messageCtxText]: message.type === 'text',
          [css.messageCtxImage]: message.type === 'image'
        })} key={message.id}>
          <div className={css.username}>用户_{senderId}：</div>
          {
            message.type === 'text' && <div className={css.userMessage}>{msgContent}</div>
          }
          {
            message.type === 'image' && <img className={css.imageMessage} src={message.attach.url} alt='' />
          }
          {
            message.type === 'file' && <div className={css.attachmentIcon} onClick={() => onOpenAttachment(message)}>
              <img className={css.attachmentIconImage} src={attachmentIconImage} />
              <span className={css.attachmentIconText}>文件附件</span>
            </div>
          }
          {
            message.type === 'audio' && <div className={css.attachmentIcon} onClick={() => playVoice(message)}>
              <span className={css.attachmentIconText}>播放语音</span>
            </div>
          }
        </div>;
      })
    }
  </div>;
};

export default ChatroomMessageBox;