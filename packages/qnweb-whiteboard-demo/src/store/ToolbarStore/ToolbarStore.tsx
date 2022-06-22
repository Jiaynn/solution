import React, { useContext, useReducer } from 'react';

import { ToolbarAction, ToolbarState } from './type';

export const toolbarContext = React.createContext<{
  state: ToolbarState,
  dispatch: React.Dispatch<ToolbarAction>
}>({
  state: {},
  dispatch: () => ({})
});

export const toolbarReducer: React.Reducer<ToolbarState, ToolbarAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'PATCH':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    case 'SET_TOOL_PEN_PENCIL_VALUE':
      return {
        ...state,
        toolPencilValue: action.payload,
      };
    case 'SET_TOOL_PEN_MARK_VALUE':
      return {
        ...state,
        toolPenMarkValue: action.payload,
      };
    case 'SET_TOOL_GESTURE_VALUE':
      return {
        ...state,
        toolGestureValue: action.payload,
      };
    case 'SET_TOOL_RUBBER_VALUE':
      return {
        ...state,
        toolRubberValue: action.payload,
      };
    case 'SET_TOOL_GEOMETRY_VALUE':
      return {
        ...state,
        toolGeometryValue: action.payload,
      };
    default:
      throw new Error();
  }
};

export const ToolbarStore: React.FC<{
  value?: ToolbarState
}> = props => {
  const { children, value } = props;
  const [state, dispatch] = useReducer(toolbarReducer, { ...value });

  return <toolbarContext.Provider value={{ state, dispatch }}>
    {children}
  </toolbarContext.Provider>;
};

export const useToolbarStore = (): {
  state: ToolbarState,
  dispatch: React.Dispatch<ToolbarAction>
} => {
  return useContext(toolbarContext);
};
