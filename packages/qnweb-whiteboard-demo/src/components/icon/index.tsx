import React from 'react';
import classNames from 'classnames';
import './index.scss';

interface IconProps extends React.HTMLAttributes<HTMLDivElement>{
  type: string;
}

const Icon: React.FC<IconProps> = props => {
  const { type, className, ...restProps } = props;
  return <img
    className={classNames('icon', className)}
    alt={`icon-${type}`}
    src={require(`../../assets/images/${type}.svg`).default}
    {...restProps}
  />
}

export default Icon;