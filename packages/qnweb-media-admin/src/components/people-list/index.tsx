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

export const PeopleList: React.FC<PeopleListProps> = (props) => {
  const { className, style, title, list, value, onChange } = props;

  return <Typography className={classNames(prefixCls, className)} style={style}>
    <Title className={`${prefixCls}-title`} level={5}>{title}</Title>
    <div className={`${prefixCls}-list`}>
      {
        list?.map((item) => {
          return <div
            className={classNames(`${prefixCls}-list-item`, { [`${prefixCls}-list-item-active`]: item.id === value })}
            key={item.id}
            onClick={() => {
              if (item.id === value) return;
              onChange?.(item.id);
            }}
          >
            <Avatar className={`${prefixCls}-list-item-avatar`} size={60} gap={100} src={item.avatar}/>
            <div className={`${prefixCls}-list-item-text`}>{item.username}</div>
          </div>;
        })
      }
    </div>
  </Typography>;
};
