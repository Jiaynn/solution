import React, { CSSProperties } from 'react';
import {
  Image,
  Space,
  Table,
  TableProps
} from 'antd';
import classNames from 'classnames';

import { formatDatetime, formatFileSize } from '@/components/_utils';
import {
  BasicSearchForm,
  BasicSearchFormProps,
} from '../basic-search-form';

import './index.scss';

export interface BasicTableDataType {
  /**
   * mongo id
   */
  _id?: string;
  /**
   * kodo的桶名称
   */
  bucket?: string;
  /**
   * kodo的key
   */
  key?: string;
  /**
   * 使用的算法
   */
  algos?: string;
  /**
   * 文件名
   */
  filename?: string;
  /**
   * 文件类型
   */
  filetype?: string;
  /**
   * 上传人
   */
  uploader?: string;
  /**
   * 文件大小
   */
  filesize?: number;
  /**
   * 文件封装格式
   */
  file_format?: string;
  /**
   * 时长，单位毫秒
   */
  duration?: number;
  /**
   * 码率
   */
  bit_rate?: number;
  /**
   * 画幅比
   */
  aspect_ratio?: string;
  /**
   * 分辨率
   */
  resolution?: string;
  /**
   * 创建时间，时间戳，单位毫秒
   */
  created_time?: number;
  /**
   * kodo对应的文件url
   */
  url?: string;
  /**
   * 视频封面
   */
  cover_url?: string;
}

export interface BasicTableProps {
  /**
   * className
   */
  className?: string;
  /**
   * style
   */
  style?: CSSProperties;
  /**
   * 搜索表单props
   */
  searchFormProps?: BasicSearchFormProps;
  /**
   * table props
   */
  tableProps?: TableProps<BasicTableDataType>;
}

const basicColumns: Required<BasicTableProps>['tableProps']['columns'] = [
  {
    title: '文件名',
    key: 'filename',
    render: (_, row) => {
      return <Space>
        <Image preview={false} src={row.cover_url} alt={row.filename} width={64}/>
        <span>{row.filename}</span>
      </Space>;
    }
  },
  {
    title: '文件类型',
    dataIndex: 'filetype',
    key: 'filetype',
    render: (text: string) => {
      if (text === 'video') return '视频';
      if (text === 'audio') return '音频';
      if (text === 'image') return '图片';
      return text;
    }
  },
  {
    title: '上传人',
    dataIndex: 'uploader',
    key: 'uploader',
  },
  {
    title: '大小',
    dataIndex: 'filesize',
    key: 'filesize',
    render: (text: number) => formatFileSize(text),
  },
  {
    title: '上传时间',
    dataIndex: 'created_time',
    key: 'created_time',
    render: (text: number) => formatDatetime(text),
  },
];

const prefixCls = 'basic-table';

export const BasicTable: React.FC<BasicTableProps> = (props) => {
  const { searchFormProps, tableProps, className, style } = props;
  const { columns, pagination, ...restTableProps } = tableProps || {};
  return <Space className={classNames(prefixCls, className)} style={style} direction="vertical" size={[0, 40]}>
    <BasicSearchForm {...searchFormProps}/>

    <Table
      rowKey="_id"
      columns={basicColumns.concat(columns || [])}
      pagination={{
        showQuickJumper: true,
        ...pagination,
      }}
      {...restTableProps}
    />
  </Space>;
};
