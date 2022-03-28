import React from 'react';
import classNames from 'classnames';
import './index.scss';

export interface ColorDotProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
}

const ColorDot: React.FC<ColorDotProps> = props => {
  const { size = 20, color = '#000000', className, ...restProps } = props;
  return <div
  className={classNames('color-dot', 'color-dot-gap', className)}
  style={{ width: `${size}px`, height: `${size}px`, backgroundColor: color }}
    {...restProps}
  />;
};

export default ColorDot;