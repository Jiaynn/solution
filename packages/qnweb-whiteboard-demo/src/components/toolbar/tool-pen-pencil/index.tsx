import React from 'react';
import classNames from 'classnames';
import { Divider, Popover } from 'antd';

import { ColorPaletteBar, ColorPaletteBarProps } from '../color-palette-bar';
import { ColorSizeBar, ColorSizeBarProps } from '../color-size-bar';

import icon from './icon-pen-pencil.svg';

import './index.scss';

interface Value {
  color?: ColorPaletteBarProps['value'];
  size?: ColorSizeBarProps['value'];
}

export interface ToolPenPencilProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  value?: Value;
  onChange?: (value: Value) => void;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export const ToolPenPencil: React.FC<ToolPenPencilProps> = (props) => {
  const {
    className, style,
    value,
    onChange, onClick
  } = props;
  return <span className={classNames('tool-pen-pencil', className)} style={style}>
    <Popover content={
      <>
        <ColorPaletteBar
          value={value?.color}
          onChange={(color) => onChange?.({ ...value, color })}
        />
        <Divider/>
        <ColorSizeBar
          value={value?.size}
          onChange={(size) => onChange?.({ ...value, size })}
        />
      </>
    } trigger="click">
      <img src={icon} alt={icon} onClick={onClick}/>
    </Popover>
  </span>;
};
