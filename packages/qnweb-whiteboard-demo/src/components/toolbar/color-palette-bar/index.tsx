import React from 'react';
import classNames from 'classnames';

import './index.scss';

const colorList = [
  '#000000', '#1f9f8c', '#f44336',
  '#ffffff', '#ffc000', '#0086d0'
] as const;

type Value = typeof colorList[number];

export interface ColorPaletteBarProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /**
   * 色值
   */
  value?: Value;
  /**
   * 切换色值
   * @param value
   */
  onChange?: (value: Value) => void;
}

export const ColorPaletteBar: React.FC<ColorPaletteBarProps> = (props) => {
  const { className, style, value, onChange } = props;
  return <div className={classNames('color-palette-bar', className)} style={style}>
    {
      colorList.map(color => {
        return <div
          key={color}
          className={classNames('color', { 'color-checked': color === value })}
          style={{ backgroundColor: color }}
          onClick={() => onChange?.(color)}
        />;
      })
    }
  </div>;
};
