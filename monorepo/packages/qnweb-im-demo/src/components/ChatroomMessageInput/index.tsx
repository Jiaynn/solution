import { Button, Input } from 'antd';
import classNames from 'classnames';
import React, { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { storeContext } from '../../store';
import Picker, { IEmojiData } from 'emoji-picker-react';
import Recorder from 'js-audio-recorder';
import { convertToMp3 } from '../../utils/audio';
import css from './index.module.scss';

interface Props {
  groupId?: string;
}

const pickerStyle: CSSProperties = {
  width: '100%'
};

const ChatroomMessageInput = (props: Props) => {
  const { state } = useContext(storeContext);
  const [isInputVisible, setIsInputVisible] = useState(true); // 输入框显隐
  const [isSendButtonVisible, setIsSendButtonVisible] = useState(false); // 发送按钮
  const [speaking, setSpeaking] = useState(false);
  const msgFile = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState('');
  const [uploadType, setUploadType] = useState('image');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const inputEl = useRef<Input | null>(null);
  const recorder = useRef<Recorder | null>(null);

  /**
   * 当输入框有内容并且为输入框状态则显示发送按钮
   */
  useEffect(() => {
    const visible = Boolean(text && isInputVisible);
    setIsSendButtonVisible(visible);
  }, [text, isInputVisible]);

  /**
   * 开始语音
   */
  const onTouchToSpeakStart = () => {
    recorder.current = new Recorder();
    recorder.current?.start();
    setSpeaking(true);
  };

  /**
   * 结束语音
   */
  const onTouchToSpeakEnd = () => {
    const recorderCurrent = recorder.current;
    if (recorderCurrent) {
      // @ts-ignore
      const mp3Blob = convertToMp3(recorderCurrent.getWAV(), recorderCurrent);
      const mp3File = new File([mp3Blob], Date.now() + '');
      sendVoiceMessage(mp3File);
    }
    setSpeaking(false);
  };


  /**
   * 选择要上传的文件
   * @param event
   */
  const onChangeMsgFile: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = (event.target.files || [])[0];
    console.log('file', file);
    const msgFileCurrent = msgFile.current;
    state.im.sysManage
      .asyncFileUpload({
        file,
        fileType: uploadType,
        to_id: props.groupId,
        toType: 'chat',
        chatType: 'group'
      })
      .then((res: any) => {
        const cuid = state.im.userManage.getUid() + '';
        const fileInfo = {
          dName: file.name,
          fLen: file.size,
          width: 0,
          height: 0,
          url: res.url
        };
        state.im.sysManage.sendGroupMessage({
          type: uploadType,
          gid: props.groupId,
          content: JSON.stringify({
            action: 'pubChatText',
            msgStr: {
              senderId: cuid, senderName: '', msgContent: text
            }
          }),
          attachment: fileInfo,
          ext: '自定义消息字段',
          priority: 0
        });
      }).finally(() => msgFileCurrent && (msgFileCurrent.value = ''));
  };

  /**
   * 发送语音消息
   * @param voiceFile
   */
  const sendVoiceMessage = (voiceFile: File) => {
    state.im.sysManage
      .asyncFileUpload({
        file: voiceFile,
        fileType: 'audio-mp3',
        to_id: props.groupId,
        toType: 'chat',
        chatType: 'group'
      })
      .then((res: any) => {
        const cuid = state.im.userManage.getUid() + '';
        const fileInfo = {
          dName: voiceFile.name,
          fLen: voiceFile.size,
          width: 0,
          height: 0,
          url: res.url
        };
        state.im.sysManage.sendGroupMessage({
          type: 'audio',
          gid: props.groupId,
          content: {
            action: 'pubChatText',
            msgStr: JSON.stringify({
              senderId: cuid, senderName: '', msgContent: text
            })
          },
          attachment: fileInfo,
          ext: '自定义消息字段',
          priority: 0
        });
      });
  };
  /**
   * 发送文本消息
   */
  const sendTextMessage = () => {
    const im = state.im;
    const cuid = im.userManage.getUid() + '';
    const message = {
      content: JSON.stringify({
        action: 'pubChatText',
        msgStr: {
          senderId: cuid, senderName: '', msgContent: text
        }
      }),
      gid: props.groupId
    };
    im.sysManage.sendGroupMessage(message);
    setText('');
  };

  /**
   * 上传图片/文件
   * @param type
   */
  const onUpload = (type: 'file' | 'image') => {
    msgFile.current?.click();
    setUploadType(type);
  };

  /**
   * 点击选择 emoji
   * @param event
   * @param emojiObject
   */
  const onEmojiClick: (event: React.MouseEvent<Element, MouseEvent>, data: IEmojiData) => void = (event, emojiObject) => {
    setText(text + emojiObject.emoji);
    inputEl.current?.focus();
  };

  /**
   * 切换 emoji picker 显隐
   * @param event
   */
  const toggleEmojiPickerVisible: React.MouseEventHandler<HTMLSpanElement> | undefined = event => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible);
    setIsInputVisible(true);
    inputEl.current?.focus();
  };

  /**
   * 监听 body 事件
   */
  useEffect(() => {
    const handler = () => {
      setIsEmojiPickerVisible(false);
    };
    document.body.addEventListener('click', handler);
    return () => {
      document.body.removeEventListener('click', handler);
    };
  }, []);

  return <div className={css.container} onClick={event => event.stopPropagation()}>
    <div className={css.inputArea}>
      <span
        className={
          classNames(
            'iconfont',
            isInputVisible ? 'icon-yuyin' : 'icon-keyboard_icon',
            css.iconButton
          )
        }
        onClick={() => setIsInputVisible(!isInputVisible)}
      />
      {
        isInputVisible ? <Input
          value={text}
          onChange={event => setText(event.target.value)}
          className={css.messageInput}
          ref={inputEl}
        /> : <div
          onTouchStart={onTouchToSpeakStart}
          onTouchEnd={onTouchToSpeakEnd}
          className={css.holdDownButton}
          onContextMenu={event => event.preventDefault()}
        >
          {speaking ? '识别中...' : '按住说话'}
        </div>
      }
      <span
        className={classNames('iconfont', 'icon-biaoqing', css.iconButton)}
        onClick={toggleEmojiPickerVisible}
      />
      {
        isSendButtonVisible ?
          <Button type='primary' onClick={sendTextMessage}>发送</Button> :
          <>
            <span
              onClick={() => onUpload('file')}
              className={classNames('iconfont', 'icon-shangchuanwenjian', css.iconButton)}
            />
            <span
              onClick={() => onUpload('image')}
              className={classNames('iconfont', 'icon-tupianshangchuan', css.iconButton)}
            />
          </>
      }
      <input className={css.msgFile} onChange={onChangeMsgFile} type='file' ref={msgFile} />
    </div>
    {
      isEmojiPickerVisible && <Picker
        pickerStyle={pickerStyle as { [property: string]: string }}
        onEmojiClick={onEmojiClick}
        disableSearchBar={true}
        preload={true}
        native={true}
      />
    }
  </div>;
};

export default ChatroomMessageInput;