import React from 'react';
import classNames from 'classnames';

import IconArrowLine from './icon-arrow-line.svg';
import IconCircleLine from './icon-circle-line.svg';
import IconRectangleLine from './icon-rectangle-line.svg';
import IconSolidLine from './icon-solid-line.svg';

import './index.scss';

const icons = [
  { src: IconArrowLine, value: 1 },
  { src: IconCircleLine, value: 2 },
  { src: IconRectangleLine, value: 3 },
  { src: IconSolidLine, value: 4 },
] as const;

type Value = typeof icons[number]['value'];

export interface GeometryBarProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /**
   * 几何图形
   * 1: 实心箭头, 2: 圆形, 3: 正方形, 4: 线
   */
  value?: Value;
  /**
   * 切换几何图形
   * @param value
   */
  onChange?: (value: Value) => void;
}

export const GeometryBar: React.FC<GeometryBarProps> = (props) => {
  const { className, style, value, onChange } = props;
  return <div className={classNames('geometry-bar', className)} style={style}>
    {
      icons.map((icon) => {
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
