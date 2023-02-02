import React, { useState } from 'react';
import { Button, Form, FormProps, Input, InputNumber, Modal, Select } from 'antd';

import { CreateMeetingParams } from '@/api';
import classNames from 'classnames';

import './index.scss';

export enum RoomType {
  Standard = '0',
  PPT = '1',
  PDF = '2'
}

export const roomTypeOptions = [
  { label: '标准模式', value: RoomType.Standard },
  { label: 'ppt模式', value: RoomType.PPT },
  { label: 'pdf模式', value: RoomType.PDF },
];

export interface QuickStartModalProps {
  className?: string;
  visible?: boolean;
  onFinish?: FormProps<QuickStartFormData>['onFinish'];
  onCancel?: () => void;
}

export type QuickStartFormData = Omit<CreateMeetingParams, 'userIds'> & {
  userId: string;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = (props) => {
  const { className, visible, onFinish, onCancel } = props;

  const [checkZoomScale, setCheckZoomScale] = useState(true);
  const [checkUrl, setCheckUrl] = useState(true);

  /**
   * 房间类型切换
   * @param value
   */
  const onRoomTypeChange = (value: RoomType) => {
    if (value === RoomType.Standard) {
      setCheckUrl(false);
      setCheckZoomScale(true);
    } else {
      setCheckUrl(true);
      setCheckZoomScale(false);
    }
  };

  return <Modal
    className={classNames('quick-start-modal', className)}
    visible={visible}
    title="快速开始"
    footer={null}
    onCancel={onCancel}
  >
    <Form
      name="quick-start-form"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onFinish={onFinish}
    >
      <Form.Item
        label="房间类型"
        name="type"
        rules={[{ required: true, message: '请选择房间类型' }]}
      >
        <Select placeholder="请选择房间类型" onChange={onRoomTypeChange}>
          {
            roomTypeOptions.map(roomTypeItem => {
              return <Select.Option
                key={roomTypeItem.value}
                value={roomTypeItem.value}
              >{roomTypeItem.label}</Select.Option>;
            })
          }
        </Select>
      </Form.Item>

      <Form.Item
        label="用户id"
        name="userId"
        rules={
          [
            { required: true, message: '请输入用户id' },
          ]
        }
      >
        <Input placeholder="请输入用户id"/>
      </Form.Item>

      <Form.Item
        label="宽高比"
        name="aspectRatio"
        rules={
          [
            { required: true, message: '请输入宽高比' },
            { type: 'number', min: 0.5, max: 2.2, message: '取值范围为[0.5~2.2]' },
          ]
        }
      >
        <InputNumber style={{ width: '100%' }} placeholder="请输入宽高比"/>
      </Form.Item>

      <Form.Item
        label="扩展倍数"
        name="zoomScale"
        rules={
          [
            { required: checkZoomScale, message: '请输入扩展倍数' },
            { type: 'integer', min: 1, max: 5, message: '取值范围为[1~5]，且为整数' },
          ]
        }
      >
        <InputNumber style={{ width: '100%' }} placeholder="请输入扩展倍数"/>
      </Form.Item>

      <Form.Item
        label="资源链接"
        name="url"
        rules={
          [
            { required: checkUrl, message: '请输入资源链接' },
            { type: 'url', message: '请输入正确的资源链接', }
          ]
        }
      >
        <Input placeholder="请输入资源的地址，必须为https开头"/>
      </Form.Item>

      <div className="footer">
        <Button style={{ marginRight: 10 }} onClick={onCancel}>取消</Button>
        <Button type="primary" htmlType="submit">开始</Button>
      </div>
    </Form>
  </Modal>;
};
