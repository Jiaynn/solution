import React, { CSSProperties } from 'react';
import { Avatar, Table, TableProps } from 'antd';
import classNames from 'classnames';

import { formatDuration } from '@/components/_utils';
import { PeopleList, PeopleListProps } from '../people-list';


import './index.scss';

export interface FaceResultTableDataType {
  id: string;
  /**
   * 开始时间，时间戳，单位毫秒(ms)
   */
  startTime: number;
  /**
   * 结束时间，单位秒(s)
   */
  endTime: number;
}

const columns: TableProps<FaceResultTableDataType>['columns'] = [
  { title: '出入点', dataIndex: 'id' },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    render: (value) => formatDuration(value)
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    render: (value) => formatDuration(value)
  },
];

export interface FaceResultProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * loading
   */
  loading?: boolean;
  /**
   * 是否显示当前的用户信息
   */
  currentVisible?: boolean;
  /**
   * 数据
   */
  data?: {
    /**
     * 当前展示的用户id
     */
    currentUserId?: string;
    /**
     * 当前视频进度，单位毫秒(ms)
     */
    currentTime?: number;
    /**
     * 总时长，单位毫秒(ms)
     */
    duration?: number;
    /**
     * table数据
     */
    tableList?: TableProps<FaceResultTableDataType>['dataSource'];
    /**
     * 敏感人员列表
     */
    sensitiveList?: PeopleListProps['list'];
    /**
     * 未知人员列表
     */
    unknownList?: PeopleListProps['list'];
  };
  /**
   * 用户切换
   * @param id
   */
  onCurrentUserIdChange?: (id: string) => void;
  /**
   * table行选择操作
   */
  onTableRowChange?: Required<TableProps<FaceResultTableDataType>>['rowSelection']['onChange'];
}

const prefixCls = 'face-result';

export const FaceResult: React.FC<FaceResultProps> = (props) => {
  const { className, style, loading, currentVisible, data, onTableRowChange, onCurrentUserIdChange } = props;

  const {
    currentUserId, tableList, sensitiveList,
    unknownList, currentTime = 0, duration = 1
  } = data || {};

  const current = [
    ...(sensitiveList || []),
    ...(unknownList || []),
  ].find(item => item.id === currentUserId);

  const activeStyle: CSSProperties = {
    left: `${currentTime / duration * 100}%`,
  };

  return <div
    className={classNames(prefixCls, className)}
    style={style}
  >
    {
      currentVisible && current ? <div className={`${prefixCls}-main`}>
        <Avatar className={`${prefixCls}-main-avatar`} src={current.avatar} size={80} gap={100}/>
        <div className={`${prefixCls}-main-context`}>
          <div className={`${prefixCls}-main-context-title`}>{current.username}</div>
          <div className={`${prefixCls}-main-context-video-progress`}>
            {
              (tableList || []).map((item, index) => {
                const width = (item.endTime - item.startTime) / duration * 100;
                const style: CSSProperties = {
                  width: `${width}%`,
                  left: `${item.startTime / duration * 100}%`,
                };
                return <span
                  className={`${prefixCls}-main-context-video-progress-item`}
                  style={style}
                  key={index}
                />;
              })
            }
            <span className={`${prefixCls}-main-context-video-progress-item-active`} style={activeStyle}/>
          </div>
        </div>
      </div> : null
    }

    {
      tableList && <Table
        className={`${prefixCls}-table`}
        loading={loading}
        dataSource={tableList}
        rowSelection={{
          type: 'radio',
          onChange: onTableRowChange
        }}
        columns={columns}
        scroll={{ y: 180 }}
        pagination={false}
        rowKey={(row) => row.id}
      />
    }

    {
      sensitiveList && <PeopleList
        className={`${prefixCls}-people-list`}
        title="政治与敏感人物"
        list={sensitiveList}
        value={currentUserId}
        onChange={onCurrentUserIdChange}
      />
    }

    {
      unknownList && <PeopleList
        className={`${prefixCls}-people-list`}
        title="未知人物"
        list={unknownList}
        value={currentUserId}
        onChange={onCurrentUserIdChange}
      />
    }
  </div>;
};
