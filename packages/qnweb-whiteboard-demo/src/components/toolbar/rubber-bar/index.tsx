import React from 'react';
import classNames from 'classnames';
import { Slider } from 'antd';

import './index.scss';

export interface RubberBarProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  value?: number;
  onChange?: (value: number) => void;
}

export const RubberBar: React.FC<RubberBarProps> = (props) => {
  const { className, style, value, onChange } = props;
  return <div className={classNames('rubber-bar', className)} style={style}>
    <Slider className='slider' value={value} onChange={onChange}/>
  </div>;
};
