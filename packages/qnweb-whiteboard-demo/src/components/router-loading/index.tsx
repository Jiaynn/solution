import React from 'react';
import classNames from 'classnames';

import IconLoading from './icon-loading.svg';

import './index.scss';

export type RouterLoadingProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'onClick'>;

export const RouterLoading: React.FC<RouterLoadingProps> = (props) => {
  const { className, ...restProps } = props;
  return <div className={classNames('router-loading', className)} {...restProps}>
    <img className="router-loading-img" alt={IconLoading} src={IconLoading}/>
  </div>;
};
