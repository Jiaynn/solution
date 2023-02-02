import React from 'react';
import classNames from 'classnames';

import icon from './icon-mouse.svg';

import './index.scss';

export type ToolMouseProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'onClick'>;

export const ToolMouse: React.FC<ToolMouseProps> = (props) => {
  const { className, ...restProps } = props;
  return <span className={classNames('tool-mouse', className)} {...restProps}>
    <img src={icon} alt={icon}/>
  </span>;
};
