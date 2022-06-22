import React from 'react';
import classNames from 'classnames';

import icon from './icon-upload.svg';

import './index.scss';

export type ToolUploadProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'onClick'>;

export const ToolUpload: React.FC<ToolUploadProps> = (props) => {
  const { className, ...restProps } = props;
  return <span className={classNames('tool-upload', className)} {...restProps}>
    <img src={icon} alt={icon}/>
  </span>;
};
