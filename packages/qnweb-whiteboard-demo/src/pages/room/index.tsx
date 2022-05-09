import { Button, Drawer, message, Modal, Popover, Spin } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ColorDotProps } from '../../components/color-dot';
import ColorDotBar, { Bar } from '../../components/color-dot-bar';
import Icon from '../../components/icon';
import RoomLoading from '../../components/room-loading';
import useBackgroundChange from '../../hooks/useBackgroundChange';
import useDocumentChange from '../../hooks/useDocumentChange';
import useJoinedRoom from '../../hooks/useJoinedRoom';
import useLoadTime from '../../hooks/useLoadTime';
import usePageListChanged from '../../hooks/usePageListChanged';
import useWebassemblyReady from '../../hooks/useWebassemblyReady';
import useWhiteboardSizeChanged from '../../hooks/useWhiteboardSizeChanged';
import useWidgetActivity from '../../hooks/useWidgetActivity';
import useWidgetScroll from '../../hooks/useWidgetScroll';
import { storeContext } from '../../store';
import { InputMode } from 'qnweb-whiteboard';
import { log } from '../../utils';
import css from './index.module.scss';
import HighlighterPen from '../../components/highlighter-pen';
import WritingPen from '../../components/writing-pen';
import Rubber from '../../components/rubber';
import Geometry from '../../components/geometry';
import Gesture from '../../components/gesture';

const Room = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { whiteboardClient, isJoined, roomError, roomToken } = useJoinedRoom();
    const { webassemblyReady } = useWebassemblyReady(whiteboardClient);
    const { documents } = usePageListChanged(whiteboardClient);
    const { curDocument } = useDocumentChange(whiteboardClient, documents);
    const { dispatch } = useContext(storeContext);
    const uploadFileElement = useRef<HTMLInputElement | null>(null);
    const [roomLoading, setRoomLoading] = useState(true);
    const [bgColor, setBgColor] = useState<string>();
    const { activeWidget, setActiveWidget } = useWidgetActivity(whiteboardClient);
    useBackgroundChange(whiteboardClient, curDocument);
    const [uploadFileSpinning, setUploadFileSpinning] = useState(false);
    useWhiteboardSizeChanged(whiteboardClient, true);
    useWidgetScroll(whiteboardClient);
    useLoadTime({
      webassemblyReady,
      isJoined,
      roomError,
      curDocument
    });
    const [whiteboardVisible, setWhiteboardVisible] = useState(true);
    const [wIsOpen, setWIsOpen] = useState<'open' | 'close'>();
  const [isExpanded, setIsExpanded] = useState(false);
    /**
     * 背景色
     */
    const bgColors = [
      { color: '#000000', text: '黑色' },
      { color: '#cccccc', text: '灰色' },
      { color: '#4a4ac5', text: '紫色' },
      { color: 'transparent', text: '透明' }
    ];

    /**
     * 背景色文本
     */
    const bgColorText = bgColors.find(color => color.color === bgColor)?.text || '默认';

    /**
     * 初始化完成
     */
    useEffect(() => {
      if (curDocument) {
        dispatch({
          type: 'updateWhiteboardClient',
          payload: whiteboardClient
        });
        log('loading ok');
        setRoomLoading(false);
      }
    }, [whiteboardClient, curDocument, dispatch]);

    /**
     * 切换背景色
     */
    useEffect(() => {
      if (whiteboardClient && bgColor) {
        const bgColorWithOpacity = bgColor === 'transparent' ?
          '#00000000' :
          '#ff' + bgColor.replace('#', '');
        whiteboardClient.setWhiteboardBack(bgColorWithOpacity);
      }
    }, [whiteboardClient, bgColor]);

    /**
     * 重新创建白板
     */
    useEffect(() => {
      const roomTitle = new URLSearchParams(window.location.search).get('roomTitle');
      if (wIsOpen === 'open') {
        console.log('open', document.getElementById('canvasBox'));
        whiteboardClient.joinRoom(roomToken, null, {
          title: roomTitle || ''
        });
      }
      if (wIsOpen === 'close') {
        console.log('close', document.getElementById('canvasBox'));
        whiteboardClient.leaveRoom();
      }
    }, [whiteboardClient, wIsOpen, roomToken]);

    /**
     * 点击选择 icon
     */
    const setInputMode = (mode: InputMode) => {
      dispatch({
        type: 'updateInputMode',
        payload: mode
      });
    };

    /**
     * 点击上传文件按钮
     */
    const uploadFileClick = () => {
      uploadFileElement.current?.click();
    };

    /**
     * 上传文件请求
     * @param file
     */
    const uploadFileRequest = (file: File) => {
      return new Promise<void>((resolve, reject) => {
        whiteboardClient.uploadFile({
          file,
          left: 200,
          top: 400,
          width: 1200,
          height: 1200,
          callback(error?: Error) {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        });
      });
    };

    /**
     * 选中文件并上传
     */
    const onUploadFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      const files = event.target.files || [];
      if (whiteboardClient) {
        setUploadFileSpinning(true);
        uploadFileRequest(files[0]).then(() => {
          return message.success('文件上传成功~');
        }).catch(error => {
          Modal.warning({
            title: '上传文件出错',
            content: error.message
          });
        }).finally(() => {
          const inputElement = uploadFileElement.current;
          if (inputElement) {
            inputElement.value = '';
          }
          setUploadFileSpinning(false);
        });
      }
    };

    /**
     * 删除指定页
     */
    const deleteDocument = (documentNo: number) => {
      const documentId = documents.find(
        document => document.documentNo === documentNo
      )?.documentId;
      if (documentId) {
        whiteboardClient.deleteDocument(documentId);
      } else {
        Modal.warning({
          title: 'deleteDocument',
          content: 'node documentId'
        });
      }
    };

    /**
     * createDocument
     */
    const createDocument = (documentNo?: number) => {
      if (whiteboardClient) {
        if (documentNo) { // 插入文档
          const documentId = documents.find(
            document => document.documentNo === documentNo
          )?.documentId;
          if (documentId) {
            whiteboardClient.insertDocument(documentId);
          } else {
            Modal.warning({
              title: 'createDocument',
              content: 'node documentId'
            });
          }
        } else { // 创建文档
          whiteboardClient.newDocument();
        }
      } else {
        Modal.warning({
          title: 'createDocument',
          content: 'no whiteboardClient'
        });
      }
    };

    /**
     * 切换到上一页
     */
    const toggleDocumentPrev = () => {
      const documentNo = curDocument?.documentNo || 1;
      const prevNo = documentNo - 1;
      const documentId = documents.find(document => document.documentNo === prevNo)?.documentId;
      if (prevNo > 0 && documentId) {
        whiteboardClient.cutDocument(documentId);
      }
    };

    /**
     * 切换到下一页
     */
    const toggleDocumentNext = useCallback(() => {
      const documentNo = curDocument?.documentNo || 1;
      const nextNo = documentNo + 1;
      const documentId = documents.find(document => document.documentNo === nextNo)?.documentId;
      if (nextNo > 0 && documentId) {
        whiteboardClient.cutDocument(documentId);
      }
    }, [documents, curDocument, whiteboardClient]);

    /**
     * 切换到指定页
     * @param documentNo
     */
    const toggleDocument = (documentNo: number) => {
      const documentId = documents.find(document => document.documentNo === documentNo)?.documentId;
      if (documentId) {
        whiteboardClient.cutDocument(documentId);
      }
    };

    /**
     * 删除 widgetId
     */
    const deleteWidget = () => {
      const widgetId = activeWidget?.widgetId;
      if (whiteboardClient && widgetId) {
        whiteboardClient.deleteWidget(widgetId);
        setActiveWidget(undefined);
      }
    };

    /**
     * 点击清屏
     */
    const clearPage = () => {
      const documentId = curDocument?.documentId;
      log('curDocument?.documentId', documentId);
      if (documentId) whiteboardClient.clearPage({
        widgetId: documentId
      });
    };

    /**
     * 重新创建白板
     */
    const onReCreateWhiteboard = () => {
      if (wIsOpen) {
        setWIsOpen(wIsOpen === 'open' ? 'close' : 'open');
      } else {
        setWIsOpen('close');
      }
    };

    return <div className={css.room}>

      {
        wIsOpen === 'close' ? null : <div className={css.canvasBox} id="canvasBox"/>
      }

      <div className={classNames(css.menu, { [css.menuExpanded]: isExpanded })}>
        <div className={css.menuBar}>
          <Icon
            type='icon-mouse'
            className={css.menuIcon}
            onClick={() => setInputMode(InputMode.Select)}
          />
          <WritingPen
            setInputMode={() => setInputMode(InputMode.Pencil)}
          />
          <HighlighterPen
            setInputMode={() => setInputMode(InputMode.Mark)}
          />
          <Gesture
            setInputMode={() => setInputMode(InputMode.Laser)}
          />
          <Rubber
            setInputMode={() => setInputMode(InputMode.Rubber)}
          />
          <Geometry
            setInputMode={() => setInputMode(InputMode.Geometry)}
          />
          <Icon
            type='icon-upload'
            className={css.menuIcon}
            onClick={uploadFileClick}
          />
        </div>
        <div
          className={css.menuExpandSlip}
          onClick={() => setIsExpanded(!isExpanded)}
        >{isExpanded ? '缩起' : '展开'}工具栏</div>
      </div>

      <Drawer
        placement="left"
        closable={true}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <div className={css.drawerDocuments}>
          <div
            className={css.drawerDocument}
            onClick={() => createDocument()}
          >+
          </div>
          {
            documents.map(document => {
              const active = document.documentNo === (curDocument?.documentNo || 1);
              return <div
                className={classNames(css.drawerDocument, {
                  [css.active]: active
                })}
                key={document.documentId}
                onClick={() => toggleDocument(document.documentNo)}
              >
                <span>{document.documentNo}</span>
                <Popover
                  content={
                    <>
                      <Button
                        size="small"
                        style={{ marginRight: 10 }}
                        onClick={() => createDocument(document.documentNo)}
                      >插入</Button>
                      <Button
                        size="small"
                        onClick={() => deleteDocument(curDocument?.documentNo || 1)}
                      >删除</Button>
                    </>
                  }
                  trigger="click"
                >
                  <span className={css.documentBtnMore}>...</span>
                </Popover>
              </div>;
            })
          }
        </div>
      </Drawer>

      <div className={css.pagination}>
        <Icon
          onClick={() => setDrawerVisible(!drawerVisible)}
          type="icon-drawer"
          className={css.iconDrawer}
        />
        <span
          className={classNames(css.paginationText, css.paginationPre)}
          onClick={toggleDocumentPrev}
        >&lt;</span>
        <span
          className={css.paginationText}
        >{curDocument?.documentNo || 1} / {documents.length || 1}</span>
        {
          (curDocument?.documentNo || 1) <= documents.length - 1 ?
            <span
              className={classNames(css.paginationText, css.paginationNext)}
              onClick={toggleDocumentNext}
            >&gt;</span> :
            <span
              className={classNames(css.paginationText, css.paginationNext)}
              onClick={() => createDocument()}
            >+</span>
        }
      </div>

      <div className={css.bgColorSetting}>
        <Popover
          trigger="click"
          content={
            <ColorDotBar
              dots={bgColors}
              bar={Bar.Color}
              active={bgColor}
              onChange={(v: ColorDotProps) => {
                setBgColor(v.color);
              }}
            />
          }
        >
          <Button type="primary">设置背景：{bgColorText}</Button>
        </Popover>
      </div>

      {
        uploadFileSpinning && <div className={css.uploadFileSpin}>
          <Spin tip="文件上传中..." spinning={uploadFileSpinning}/>
        </div>
      }

      <Button
        type="primary"
        style={{
          position: 'fixed',
          right: '25px',
          bottom: '170px',
          zIndex: 2
        }}
        onClick={onReCreateWhiteboard}
      >重新创建白板</Button>

      <Button
        type="primary"
        style={{
          position: 'fixed',
          right: '25px',
          bottom: '70px',
          zIndex: 2
        }}
        onClick={clearPage}
      >点击清屏</Button>

      <Button
        type="primary"
        style={{
          position: 'fixed',
          right: '25px',
          bottom: '120px',
          zIndex: 2
        }}
        onClick={() => {
          const roomTitle = new URLSearchParams(window.location.search).get('roomTitle');
          if (whiteboardVisible) {
            whiteboardClient.leaveRoom();
          } else {
            whiteboardClient.joinRoom(roomToken, null, {
              title: roomTitle || ''
            });
          }
          setWhiteboardVisible(!whiteboardVisible);
        }}
      >{whiteboardVisible ? '退出' : '进入'}房间</Button>

      <input
        style={{ display: 'none' }}
        type="file"
        ref={uploadFileElement}
        onChange={onUploadFileChange}
      />

      <RoomLoading loading={roomLoading}/>

      {
        activeWidget && <Button
          type="primary"
          size="small"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 99,
          }}
          onClick={deleteWidget}
        >删除</Button>
      }
    </div>;
  }
;

export default Room;
