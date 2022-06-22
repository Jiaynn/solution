import React from 'react';
import classNames from 'classnames';

import { ToolMouse } from './tool-mouse';
import { ToolPenPencil, ToolPenPencilProps } from './tool-pen-pencil';
import { ToolPenMark, ToolPenMarkProps } from './tool-pen-mark';
import { ToolGesture, ToolGestureProps } from './tool-gesture';
import { ToolRubber, ToolRubberProps } from './tool-rubber';
import { ToolGeometry, ToolGeometryProps } from './tool-geometry';
import { ToolUpload } from './tool-upload';

import './Toolbar.scss';

/**
 * 模式
 */
export type ToolbarMode = 'mouse' | 'penPencil' | 'penMark' |
  'gesture' | 'rubber' | 'geometry' | 'upload';

export interface BaseToolbarProps {
  mode?: ToolbarMode;
  /**
   * 定位的方向
   */
  fixed?: 'top' | null;
  /**
   * 工具栏是否可见
   */
  visible?: boolean;
  /**
   * 切换工具栏是否可见
   * @param value
   */
  onVisibleChange?: (value: boolean) => void;
  /**
   * 切换工具栏模式
   * @param mode
   */
  onModeChange?: (mode: ToolbarMode) => void;
}

export interface ToolbarComponentProps {
  toolPenPencilValue?: ToolPenPencilProps['value'];
  toolPenMarkValue?: ToolPenMarkProps['value'];
  toolGestureValue?: ToolGestureProps['value'];
  toolRubberValue?: ToolRubberProps['value'];
  toolGeometryValue?: ToolGeometryProps['value'];
  onToolPenPencilChange?: ToolPenPencilProps['onChange'];
  onToolPenMarkChange?: ToolPenMarkProps['onChange'];
  onToolGestureChange?: ToolGestureProps['onChange'];
  onToolRubberChange?: ToolRubberProps['onChange'];
  onToolGeometryChange?: ToolGeometryProps['onChange'];
}

export type ToolbarProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> &
  BaseToolbarProps &
  ToolbarComponentProps;

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    className, style, visible = false, mode, fixed,
    toolPenPencilValue, toolPenMarkValue, toolGestureValue, toolRubberValue, toolGeometryValue,
    onToolPenPencilChange, onToolPenMarkChange, onToolGestureChange, onToolRubberChange, onToolGeometryChange,
    onVisibleChange, onModeChange
  } = props;

  return <div
    className={classNames('toolbar', {
      [`toolbar-fixed-${fixed}`]: fixed,
      [`toolbar-fixed-${fixed}-visible`]: visible
    }, className)}
    style={style}
  >
    <div className="tools">
      <ToolMouse
        className={classNames('tool', { 'tool-checked': 'mouse' === mode })}
        onClick={() => onModeChange?.('mouse')}
      />
      <ToolPenPencil
        className={classNames('tool', { 'tool-checked': 'penPencil' === mode })}
        value={toolPenPencilValue}
        onChange={onToolPenPencilChange}
        onClick={() => onModeChange?.('penPencil')}
      />
      <ToolPenMark
        className={classNames('tool', { 'tool-checked': 'penMark' === mode })}
        value={toolPenMarkValue}
        onChange={onToolPenMarkChange}
        onClick={() => onModeChange?.('penMark')}
      />
      <ToolGesture
        className={classNames('tool', { 'tool-checked': 'gesture' === mode })}
        value={toolGestureValue}
        onChange={onToolGestureChange}
        onClick={() => onModeChange?.('gesture')}
      />
      <ToolRubber
        className={classNames('tool', { 'tool-checked': 'rubber' === mode })}
        value={toolRubberValue}
        onChange={onToolRubberChange}
        onClick={() => onModeChange?.('rubber')}
      />
      <ToolGeometry
        className={classNames('tool', { 'tool-checked': 'geometry' === mode })}
        value={toolGeometryValue}
        onChange={onToolGeometryChange}
        onClick={() => onModeChange?.('geometry')}
      />
      <ToolUpload
        className={classNames('tool', { 'tool-checked': 'upload' === mode })}
        onClick={() => onModeChange?.('upload')}
      />
    </div>
    <div className="button" onClick={() => onVisibleChange?.(!visible)}>
      {visible ? '缩起' : '展开'}
    </div>
  </div>;
};
