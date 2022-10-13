import React, { CSSProperties } from 'react';
import { Avatar, Typography } from 'antd';
import classNames from 'classnames';

import './index.scss';

interface User {
  id: string;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户名
   */
  username: string;
}

export interface PeopleListProps {
  /**
   * className
   */
  className?: string;
  /**
   * style
   */
  style?: CSSProperties;
  /**
   * 标题
   */
  title?: string;
  /**
   * 用户列表
   */
  list?: User[];
  /**
   * 当前展示的用户id
   */
  value?: string;
  /**
   * 切换用户
   * @param id
   */
  onChange?: (id: string) => void;
}

const { Title } = Typography;

const prefixCls = 'people-list';

const Empty = () => {
  return <div className={`${prefixCls}-empty`}>
    <div className={`${prefixCls}-empty-image`}>
      <svg className={`${prefixCls}-empty-image-simple`} width="64" height="41" viewBox="0 0 64 41"
           xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
          <ellipse className={`${prefixCls}-empty-image-simple-ellipse`} cx="32" cy="33" rx="32" ry="7"></ellipse>
          <g className={`${prefixCls}-empty-image-simple-g`} fillRule="nonzero">
            <path
              d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
            <path
              d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
              className={`${prefixCls}-empty-image-simple-path`}></path>
          </g>
        </g>
      </svg>
    </div>
    <div className={`${prefixCls}-empty-description`}>暂无数据</div>
  </div>;
};

export const PeopleList: React.FC<PeopleListProps> = (props) => {
  const { className, style, title, list, value, onChange } = props;

  const isNotEmpty = list && !!list.length;
  return <Typography className={classNames(prefixCls, className)} style={style}>
    <Title className={`${prefixCls}-title`} level={5}>{title}</Title>
    <div className={classNames(`${prefixCls}-list`, {
      [`${prefixCls}-list-empty`]: !isNotEmpty,
    })}>
      {
        isNotEmpty ? list?.map((item) => {
          return <div
            className={classNames(`${prefixCls}-list-item`, { [`${prefixCls}-list-item-active`]: item.id === value })}
            key={item.id}
            title={item.username}
            onClick={() => {
              if (item.id === value) return;
              onChange?.(item.id);
            }}
          >
            <Avatar className={`${prefixCls}-list-item-avatar`} size={60} gap={100} src={item.avatar}/>
            <div className={`${prefixCls}-list-item-text`}>{item.username}</div>
          </div>;
        }) : <Empty/>
      }
    </div>
  </Typography>;
};
