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
  className?: string;
  style?: React.CSSProperties;
  /**
   * 数据
   */
  data?: Data;
}

const { Title } = Typography;

/**
 * 渲染基本信息
 * @param data
 */
const renderRow = (data?: Data) => {
  if (!data) return;
  return <Row className="row" gutter={[20, 24]}>
    {
      data.createTime && <Col className="col" span={14}>
        <span className="label">创建时间：</span>
        <span className="value">{moment(data.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
      </Col>
    }
    {
      data.fileSize && <Col className="col" span={8}>
        <span className="label">文件大小：</span>
        <span className="value">{formatFileSize(data.fileSize)}</span>
      </Col>
    }

    {
      data.duration && <Col className="col" span={14}>
        <span className="label">时长：</span>
        <span className="value">{formatDuration(data.duration)}</span>
      </Col>
    }
    {
      data.fileFormat && <Col className="col" span={8}>
        <span className="label">视频格式：</span>
        <span className="value">{data.fileFormat}</span>
      </Col>
    }

    {
      data.bitRate && <Col className="col" span={14}>
        <span className="label">码率：</span>
        <span className="value">{formatBitRate(data.bitRate)}</span>
      </Col>
    }
    {
      data.resolution && <Col className="col" span={8}>
        <span className="label">分辨率：</span>
        <span className="value">{data.resolution}</span>
      </Col>
    }

    {
      data.aspectRatio && <Col className="col" span={24}>
        <span className="label">画幅比：</span>
        <span className="value">{data.aspectRatio}</span>
      </Col>
    }
  </Row>;
};

export const BasicResult: React.FC<BasicResultProps> = (props) => {
  const {
    className, style, data
  } = props;

  return <Typography
    className={classNames('basic-result', className)}
    style={style}
  >
    <Title level={5}>基本信息</Title>
    <Card>{renderRow(data)}</Card>
  </Typography>;
};
