import React from 'react';
import {
  Button,
  ButtonProps,
  DatePicker,
  Form,
  FormProps,
  Input,
  Row,
  Space
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Moment } from 'moment';
import classNames from 'classnames';

export interface BasicSearchFormValues {
  title?: string;
  timeRange?: [Moment, Moment];
}

export interface BasicSearchFormProps {
  className?: string;
  style?: React.CSSProperties;
  form?: FormProps<BasicSearchFormValues>['form'];
  onOk?: FormProps<BasicSearchFormValues>['onFinish'];
  onUploadClick?: ButtonProps['onClick'];
}

const prefixCls = 'basic-search-form';

export const BasicSearchForm: React.FC<BasicSearchFormProps> = (props) => {
  const { className, style, form, onOk, onUploadClick } = props;
  return <Row
    className={classNames(prefixCls, className)}
    justify="space-between"
    gutter={[0, 20]}
    style={style}
  >
    <Button
      type="primary"
      icon={<PlusOutlined/>}
      onClick={onUploadClick}
    >上传文件</Button>
    <Form
      name="search-form"
      layout="inline"
      form={form}
      onFinish={onOk}
    >
      <Space size={[0, 20]}>
        <Form.Item name="title">
          <Input placeholder="输入标题搜索" prefix={<SearchOutlined/>}/>
        </Form.Item>
        <Form.Item name="timeRange">
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm:ss' }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">搜索</Button>
        </Form.Item>
      </Space>
    </Form>
  </Row>;
};
