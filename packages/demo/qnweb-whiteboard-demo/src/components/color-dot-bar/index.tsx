import classNames from 'classnames';
import React, { CSSProperties } from 'react';
import ColorDot, { ColorDotProps } from '../color-dot';
import './index.scss';

type Dots = Array<ColorDotProps>

export enum Bar {
  Color,
  Size
}

interface Props {
  dots: Dots,
  onChange?: (value: ColorDotProps & { index: number }) => void,
  className?: string;
  style?: CSSProperties;
  bar: Bar;
  active?: string | number;
}

const ColorDotBar: React.FC<Props> = props => {
  const { dots, onChange, className, bar, active, ...restProps } = props;

  return <div className={classNames('color-dot-bar', className)} {...restProps}>
    {
      dots.map((dot, index) => {
        const _active = bar === Bar.Color ? dot.color === active :
          bar === Bar.Size ? dot.size === active : ''
        return <ColorDot
          onClick={() => {
            onChange && onChange({
              ...dot,
              index
            });
          }}
          key={index}
          color={dot.color}
          size={dot.size}
          className={classNames('common-icon', { active: _active })}
        />;
      })
    }
  </div>;
};

export default ColorDotBar;