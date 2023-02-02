import React from 'react';
import classNames from 'classnames';
import { Popover } from 'antd';

import { GestureBar, GestureBarProps } from '../gesture-bar';

import IconGesture from './icon-gesture.svg';

import './index.scss';

export interface ToolGestureProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  value?: GestureBarProps['value'];
  onChange?: GestureBarProps['onChange'];
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export const ToolGesture: React.FC<ToolGestureProps> = (props) => {
  const { className, style, value, onClick, onChange } = props;
  return <span className={classNames('tool-gesture', className)} style={style}>
    <Popover content={<GestureBar value={value} onChange={onChange}/>} trigger="click">
       <img src={IconGesture} alt={IconGesture} onClick={onClick}/>
    </Popover>
  </span>;
};
