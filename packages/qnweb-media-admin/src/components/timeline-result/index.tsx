import React, { useState } from 'react';
import { Input, InputProps, Space, Timeline } from 'antd';
import classNames from 'classnames';

import './index.scss';

export interface TimelineResultProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  onChange?: InputProps['onChange'];
  list?: {
    title: string;
    content: string;
  }[];
}

export const TimelineResult: React.FC<TimelineResultProps> = (props) => {
  const {
    className, style,
    list = [],
  } = props;
  const [inputValue, setInputValue] = useState('');

  /**
   * 渲染内容
   * @param content
   */
  const renderContent = (content: string) => {
    if (!inputValue) return content;
    const reg = new RegExp(inputValue, 'ig');
    return content.replace(reg, function (match) {
      return `<span class="highlight">${match}</span>`;
    });
  };

  return <Space
    className={classNames('timeline-result', className)}
    size={20}
    direction="vertical"
    style={style}
  >
    <Input
      placeholder="请输入搜索内容"
      value={inputValue}
      onChange={event => setInputValue(event.target.value)}
    />

    <Timeline>
      {
        list.map((item, index) => {
          return <Timeline.Item key={index}>
            <div>{item.title}</div>
            <div dangerouslySetInnerHTML={{ __html: renderContent(item.content) }}/>
          </Timeline.Item>;
        })
      }
    </Timeline>
  </Space>;
};
