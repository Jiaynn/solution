import React from 'react';
import { Input, Modal, ModalProps } from 'antd';
import classNames from 'classnames';

import './index.scss';

export interface JoinRoomFormData {
  appId?: string;
  meetingId?: string;
  userId?: string;
  token?: string;
  bucketId?: string;
  recordId?: string;
}

export type JoinRoomModalProps = ModalProps & {
  data?: JoinRoomFormData;
  onChange?: (data: JoinRoomFormData) => void;
};

export const JoinRoomModal: React.FC<JoinRoomModalProps> = (props) => {
  const {
    className,
    data, onChange,
    ...restProps
  } = props;
  return <Modal className={classNames('join-room-modal', className)} {...restProps}>
    <div className="context">
      <div className="label">appId：</div>
      <Input
        className="input"
        placeholder="请输入appId"
        value={data?.appId}
        onChange={(e) => onChange?.({ ...data, appId: e.target.value })}
      />
    </div>
    <div className="context">
      <div className="label">meetingId：</div>
      <Input
        className="input"
        placeholder="请输入meetingId"
        value={data?.meetingId}
        onChange={(e) => onChange?.({ ...data, meetingId: e.target.value })}
      />
    </div>
    <div className="context">
      <div className="label">userId：</div>
      <Input
        className="input"
        placeholder="请输入userId"
        value={data?.userId}
        onChange={(e) => onChange?.({ ...data, userId: e.target.value })}
      />
    </div>
    <div className="context">
      <div className="label">token：</div>
      <Input
        className="input"
        placeholder="请输入token"
        value={data?.token}
        onChange={(e) => onChange?.({ ...data, token: e.target.value })}
      />
    </div>
    <div className="context">
      <div className="label">bucketId：</div>
      <Input
        className="input"
        placeholder="请输入bucketId"
        value={data?.bucketId}
        onChange={(e) => onChange?.({ ...data, bucketId: e.target.value })}
      />
    </div>
    <div className="context">
      <div className="label">recordId：</div>
      <Input
        className="input"
        placeholder="请输入recordId"
        value={data?.recordId}
        onChange={(e) => onChange?.({ ...data, recordId: e.target.value })}
      />
    </div>
  </Modal>;
};
