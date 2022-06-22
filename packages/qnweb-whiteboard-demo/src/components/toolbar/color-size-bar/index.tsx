import React from 'react';
import classNames from 'classnames';
import { Slider } from 'antd';

import './index.scss';

export interface ColorSizeBarProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /**
   * 尺寸
   */
  value?: number;
  /**
   * 切换尺寸
   * @param value
   */
  onChange?: (value: number) => void;
}

export const ColorSizeBar: React.FC<ColorSizeBarProps> = (props) => {
  const { className, style, value, onChange } = props;
  return <div className={classNames('color-size-bar', className)} style={style}>
    <Slider className="slider" value={value} onChange={onChange}/>
  </div>;
};
