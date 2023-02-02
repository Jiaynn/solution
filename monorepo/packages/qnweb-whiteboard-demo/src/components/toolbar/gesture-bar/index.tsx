import React from 'react';
import classNames from 'classnames';

import IconLaser1 from './icon-gesture.svg';
import IconLaser2 from './icon-laser-2.svg';
import IconLaser3 from './icon-laser-3.svg';
import IconLaser4 from './icon-laser-4.svg';

import './index.scss';

const icons = [
  { src: IconLaser1, value: 1 },
  { src: IconLaser2, value: 2 },
  { src: IconLaser3, value: 3 },
  { src: IconLaser4, value: 4 }
] as const;

type Value = typeof icons[number]['value'];

export interface GestureBarProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /**
   * 手势
   * 1: 手, 2: 靶心, 3: 空心鼠标, 4: 实心鼠标
   */
  value?: Value;
  /**
   * 切换手势
   * @param value
   */
  onChange?: (value: Value) => void;
}

export const GestureBar: React.FC<GestureBarProps> = (props) => {
  const { className, style, value, onChange } = props;
  return <div className={classNames('gesture-bar', className)} style={style}>
    {
      icons.map(icon => {
        return <span key={icon.value} className={classNames('icon', { 'icon-checked': icon.value === value })}>
          <img
            src={icon.src}
            alt={icon.src}
            onClick={() => onChange?.(icon.value)}
          />
        </span>;
      })
    }
  </div>;
};
