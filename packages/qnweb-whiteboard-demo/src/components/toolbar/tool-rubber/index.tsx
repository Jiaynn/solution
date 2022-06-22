import React from 'react';
import classNames from 'classnames';
import { Popover } from 'antd';

import { RubberBar, RubberBarProps } from '../rubber-bar';

import icon from './icon-rubber.svg';

import './index.scss';

export interface ToolRubberProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  value?: RubberBarProps['value'];
  onChange?: RubberBarProps['onChange'];
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export const ToolRubber: React.FC<ToolRubberProps> = (props) => {
  const { className, style, value, onChange, onClick } = props;
  return <span className={classNames('tool-rubber', className)} style={style}>
    <Popover content={<RubberBar value={value} onChange={onChange}/>} trigger="click">
      <img src={icon} alt={icon} onClick={onClick}/>
    </Popover>
  </span>;
};
