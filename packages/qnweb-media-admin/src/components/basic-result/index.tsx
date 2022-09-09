import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import classNames from 'classnames';
import moment from 'moment';

import {
  formatBitRate,
  formatDuration,
  formatFileSize
} from '../_utils';

import './index.scss';

type Label =
  '创建时间'
  | '文件大小'
  | '时长'
  | '视频格式'
  | '音频格式'
  | '图片格式'
  | '文件格式'
  | '码率'
  | '分辨率'
  | '画幅比';

interface Data {
  /**
   * 创建时间，时间戳，单位毫秒
   */
  createTime?: number;
  /**
   * 文件大小，单位字节(Byte)
   */
  fileSize?: number;
  /**
   * 时长，单位秒(s)
   */
  duration?: number;
  /**
   * 格式
   */
  fileFormat?: string;
  /**
   * 码率
   */
  bitRate?: number;
  /**
   * 分辨率
   */
  resolution?: string;
  /**
   * 画幅比
   */
  aspectRatio?: string;
}

export interface BasicResultProps {
  /**
   * className
   */
  className?: string;
  /**
   * style
   */
  style?: React.CSSProperties;
  /**
   * 数据
   */
  data?: Data;
  /**
   * 过滤出需要展示的label
   */
  filters?: Label[];
}

const { Title } = Typography;

/**
 * 渲染基本信息
 * @param data
 * @param filters
 */
const renderRow = (data: Data, filters?: BasicResultProps['filters']) => {
  const columns: Array<{
    label: Label;
    value?: string | number;
  }> = [
    { label: '创建时间', value: moment(data.createTime).format('YYYY-MM-DD HH:mm:ss') },
    { label: '文件大小', value: formatFileSize(data.fileSize) },
    { label: '时长', value: formatDuration(data.duration) },
    { label: '视频格式', value: data.fileFormat },
    { label: '音频格式', value: data.fileFormat },
    { label: '图片格式', value: data.fileFormat },
    { label: '文件格式', value: data.fileFormat },
    { label: '码率', value: formatBitRate(data.bitRate) },
    { label: '分辨率', value: data.resolution },
    { label: '画幅比', value: data.aspectRatio },
  ];
  return <Row className="row" gutter={[20, 24]}>
    {
      (
        filters ?
          columns.filter(item => filters.includes(item.label)) :
          columns
      ).map((item, index) => {
        return <Col className="col" span={12} key={index}>
          <span className="label">{item.label}：</span>
          <span className="value">{item.value}</span>
        </Col>;
      })
    }
  </Row>;
};

export const BasicResult: React.FC<BasicResultProps> = (props) => {
  const {
    className, style, data, filters
  } = props;

  return <Typography
    className={classNames('basic-result', className)}
    style={style}
  >
    <Title level={5}>基本信息</Title>
    <Card className="content">{data ? renderRow(data, filters) : '暂无数据'}</Card>
  </Typography>;
};
