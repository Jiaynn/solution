import React from 'react';
import classNames from 'classnames';

import './index.scss';

export interface PageControllerProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  current?: number;
  total?: number;
  onPreButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
  onNextButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
  onAddButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const prefixCls = 'qn-whiteboard';

export const PageController: React.FC<PageControllerProps> = (props) => {
  const {
    className, style,
    current = 1, total = 1,
    onPreButtonClick, onNextButtonClick, onAddButtonClick,
  } = props;

  return <div className={classNames(`${prefixCls}-page-controller`, className)} style={style}>
    <button className="button" onClick={onPreButtonClick}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="m14 8-2 2-2 2 2 2 2 2" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
      </svg>
    </button>
    <span>
      <span>{current}</span>
      <span>/</span>
      <span>{total}</span>
    </span>
    <button className="button" onClick={onNextButtonClick}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="m10 8 2 2 2 2-2 2-2 2" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
      </svg>
    </button>
    <button className="button" onClick={onAddButtonClick}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20h16M4 6h16" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
        <rect height="10" rx="1" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25" width="14" x="5"
              y="8"></rect>
        <path d="M12 4v2m-3 7h6m-3-3v6" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
      </svg>
    </button>
  </div>;
};
