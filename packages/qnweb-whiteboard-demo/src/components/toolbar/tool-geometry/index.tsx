import React from 'react';
import classNames from 'classnames';
import { Divider, Popover } from 'antd';

import { GeometryBar, GeometryBarProps } from '../geometry-bar';
import { ColorPaletteBar, ColorPaletteBarProps } from '../color-palette-bar';
import { ColorSizeBar, ColorSizeBarProps } from '../color-size-bar';

import icon from './icon-geometry.svg';

import './index.scss';

interface Value {
  geometryMode?: GeometryBarProps['value'];
  color?: ColorPaletteBarProps['value'];
  size?: ColorSizeBarProps['value'];
}

export interface ToolGeometryProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  value?: Value;
  onChange?: (value: Value) => void;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export const ToolGeometry: React.FC<ToolGeometryProps> = (props) => {
  const { className, style, value, onChange, onClick } = props;
  return <span className={classNames('tool-geometry', className)} style={style}>
    <Popover content={
      <>
        <GeometryBar value={value?.geometryMode} onChange={(geometryMode) => onChange?.({ ...value, geometryMode })}/>
        <Divider/>
        <ColorPaletteBar value={value?.color} onChange={(color) => onChange?.({ ...value, color })}/>
        <Divider/>
        <ColorSizeBar value={value?.size} onChange={(size) => onChange?.({ ...value, size })}/>
      </>
    } trigger="click">
      <img src={icon} alt={icon} onClick={onClick}/>
    </Popover>
  </span>;
};
