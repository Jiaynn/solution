import React from 'react';
import classNames from 'classnames';

import './index.scss';

export interface RedoUndoProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /**
   * label 文字
   */
  label?: string;
  /**
   * 禁用 undo 操作
   */
  undoButtonDisabled?: boolean;
  /**
   * 禁用 redo 操作
   */
  redoButtonDisabled?: boolean;
  /**
   * undo 操作触发
   */
  onUndoButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * redo 操作触发
   */
  onRedoButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const prefixCls = 'qn-whiteboard';

export const RedoUndo: React.FC<RedoUndoProps> = (props) => {
  const {
    className, style,
    label, undoButtonDisabled, redoButtonDisabled,
    onUndoButtonClick, onRedoButtonClick,
  } = props;
  return <div className={classNames(`${prefixCls}-redo-undo`, className)} style={style}>
    {label && <span className="label">{label}</span>}
    <button className="button" disabled={undoButtonDisabled} onClick={onUndoButtonClick}>
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 9.625h10v-1.25H5v1.25ZM18.375 13v6h1.25v-6h-1.25ZM15 9.625A3.375 3.375 0 0 1 18.375 13h1.25A4.625 4.625 0 0 0 15 8.375v1.25Z"
          fill="#5D5D5D"></path>
        <path d="M9 5 5 9l4 4" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
      </svg>
    </button>
    <button className="button" disabled={redoButtonDisabled} onClick={onRedoButtonClick}>
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M19 9.625H9v-1.25h10v1.25ZM5.625 13v6h-1.25v-6h1.25ZM9 9.625A3.375 3.375 0 0 0 5.625 13h-1.25A4.625 4.625 0 0 1 9 8.375v1.25Z"
          fill="#5D5D5D"></path>
        <path d="m15 5 4 4-4 4" stroke="#5D5D5D" strokeLinejoin="round" strokeWidth="1.25"></path>
      </svg>
    </button>
  </div>;
};
