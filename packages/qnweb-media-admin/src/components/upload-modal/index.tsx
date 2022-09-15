import React, { useState } from 'react';
import { Modal, ModalProps } from 'antd';
import { DragUpload, isUploadRealFile, UploadCallbacks, UploadData } from 'react-icecream';
import { AddThinIcon } from 'react-icecream/icons';
import classNames from 'classnames';
import * as qiniu from 'qiniu-js';
import diff from 'lodash/difference';

import './index.scss';

interface UploadConfig {
  /**
   * 前缀
   */
  prefix: string;
  /**
   * 视频(video)、音频(audio)、图片(image)
   */
  fileType: string;
  /**
   * 上传token凭证
   */
  token: string;
}

interface UploadCompleteData {
  key: string;
  hash: string;
}

interface CompleteResult {
  file: File;
  data: UploadCompleteData;
  callbacks: UploadCallbacks;
}

export type UploadModalProps =
  Pick<ModalProps, 'title' | 'visible' | 'footer' | 'maskClosable' | 'onCancel' | 'className' | 'style'>
  & {
  /**
   * 可以上传的文件类型，参考：https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
   */
  accept?: string;
  /**
   * 上传配置
   */
  config: UploadConfig,
  /**
   * 自定义上传完成回调
   * @param result
   */
  onComplete?: (result: CompleteResult) => void
};

function beforeUpload(before: UploadData[], after: UploadData[]): boolean {
  const existedIdList = before.map(item => item.id);
  const newIdList = after.map(item => item.id);
  const addedIdList = diff(newIdList, existedIdList);
  const addedList = after.filter(item => addedIdList.includes(item.id));
  return addedList.filter(isUploadRealFile).every(data => data.file.size <= 100 * 1024 * 1024);
}

const DragContent = ({
  title,
  tip = '',
  dragStatus = '',
  disabled = false,
}: { title: string, tip?: string, dragStatus?: string, disabled?: boolean }) => (
  <div className={classNames('upload-drag-wrapper', 'upload-drag-' + dragStatus, disabled && 'upload-drag-disabled')}>
    <AddThinIcon/>
    {
      dragStatus !== 'dragover' || disabled ?
        <div className="upload-drag-text"><span className="upload-drag-click">{title}</span>，或拖拽文件到此处上传</div>
        : <div className="upload-drag-text">释放文件并开始上传</div>
    }
    <div className="upload-drag-tip">{tip}</div>
  </div>
);

const prefixCls = 'upload-modal';

export const UploadModal: React.FC<UploadModalProps> = (props) => {
  const { className, config, accept, onComplete, ...restProps } = props;
  const [list, setList] = useState<UploadData[]>([]);

  const onChange = (data: UploadData[]) => {
    if (beforeUpload(list, data)) {
      setList(data);
    }
  };

  const doUpload = (
    file: File,
    callbacks: UploadCallbacks
  ) => {
    const key = `${config.prefix}/${config.fileType}/${file.name}`;
    const observable = qiniu.upload(file, key, config.token);
    // 上传开始
    const subscription = observable.subscribe({
      next(res) {
        console.log('next res', res);
        const percent = Math.floor(res.total.percent);
        callbacks.onProgress({ percent });
      },
      error(err) {
        console.log('error err', err);
        callbacks.onError(err);
      },
      complete(data: UploadCompleteData) {
        if (onComplete) {
          return onComplete({
            file,
            data,
            callbacks
          });
        }
        return callbacks.onComplete();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  };

  return <Modal
    className={classNames(prefixCls, className)}
    title="上传文件"
    footer={null}
    {...restProps}
  >
    <div className={`${prefixCls}-body`}>
      <DragUpload
        onUpload={doUpload}
        value={list}
        onChange={onChange}
        multiple
        accept={accept}
        renderContent={
          dragStatus => <DragContent title="点击上传" dragStatus={dragStatus}/>
        }
      />
    </div>
  </Modal>;
};

