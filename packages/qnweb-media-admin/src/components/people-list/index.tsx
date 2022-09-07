import React from 'react';
import { Avatar, Space, Typography } from 'antd';
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
  title?: string;
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

export const PeopleList: React.FC<PeopleListProps> = (props) => {
  const { title, list, value, onChange } = props;

  return <Typography className="people-list">
    <Title level={5}>{title}</Title>
    <Space className="list" size={20}>
      {
        list?.map((item) => {
          return <div
            className={classNames('list-item', { 'list-item--active': item.id === value })}
            key={item.id}
            onClick={() => {
              if (item.id === value) return;
              onChange?.(item.id);
            }}
          >
            <Avatar size={60} gap={100} src={item.avatar}/>
            <div className="text">{item.username}</div>
          </div>;
        })
      }
    </Space>
  </Typography>;
};
