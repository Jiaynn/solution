import { ToolbarMode, ToolbarProps } from '../../components';

export interface ToolbarState {
  mode?: ToolbarMode;
  toolPenPencilValue?: ToolbarProps['toolPenPencilValue'];
  toolPenMarkValue?: ToolbarProps['toolPenMarkValue'];
  toolGestureValue?: ToolbarProps['toolGestureValue'];
  toolRubberValue?: ToolbarProps['toolRubberValue'];
  toolGeometryValue?: ToolbarProps['toolGeometryValue'];
}

export type ToolbarAction = {
  type: 'PATCH';
  payload: ToolbarState;
} | {
  type: 'SET_MODE',
  payload: ToolbarMode;
} | {
  type: 'SET_TOOL_PEN_PENCIL_VALUE',
  payload: ToolbarProps['toolPenPencilValue'];
} | {
  type: 'SET_TOOL_PEN_MARK_VALUE',
  payload: ToolbarProps['toolPenMarkValue'];
} | {
  type: 'SET_TOOL_GESTURE_VALUE',
  payload: ToolbarProps['toolGestureValue'];
} | {
  type: 'SET_TOOL_RUBBER_VALUE',
  payload: ToolbarProps['toolRubberValue'];
} | {
  type: 'SET_TOOL_GEOMETRY_VALUE',
  payload: ToolbarProps['toolGeometryValue'];
};
