import React, { useEffect, useReducer } from 'react';
import { GeometryMode, InputMode, PenType } from 'qnweb-whiteboard';
import { log } from '../utils';

interface StoreProps extends React.HTMLAttributes<HTMLDivElement> {
}

interface State {
  penColor: string; // 画笔颜色
  penSize: number; // 画笔大小
  penType: PenType; // 画笔类型
  whiteboardClient: any;
  rubberSize: number; // 橡皮大小
  geometryMode: GeometryMode; // 图形模式
  inputMode: InputMode, // 白板输入模式
  isDebug: boolean, // 是否开启 debug 调试
}

interface Action {
  type: 'updatePenColor' | 'updatePenSize' |
    'updatePenType' | 'updateWhiteboardClient' |
    'updateRubberSize' | 'updateGeometryMode' |
    'updateInputMode' | 'updateIsDebug';
  payload: any;
}

interface StoreContext {
  state: State;
  dispatch: (action: Action) => void;
}

const defaultState = {
  penColor: '#000000',
  penSize: 10,
  penType: PenType.WritingPen,
  whiteboardClient: null,
  rubberSize: 30,
  geometryMode: GeometryMode.Line,
  inputMode: InputMode.Pencil,
  isDebug: false,
};

export const storeContext = React.createContext({} as StoreContext);

export function reducer(state: State, action: Action) {
  const { type, payload } = action;
  switch (type) {
    case 'updateWhiteboardClient':
      return {
        ...state,
        whiteboardClient: payload
      };
    case 'updatePenType':
      return {
        ...state,
        penType: payload
      };
    case 'updatePenColor':
      return {
        ...state,
        penColor: payload
      };
    case 'updatePenSize':
      return {
        ...state,
        penSize: payload
      };
    case 'updateRubberSize':
      return {
        ...state,
        rubberSize: payload
      };
    case 'updateGeometryMode':
      return {
        ...state,
        geometryMode: payload
      };
    case 'updateInputMode':
      return {
        ...state,
        inputMode: payload
      };
    case 'updateIsDebug':
      return {
        ...state,
        isDebug: payload
      };
  }
  return state;
}

const Store = (props: StoreProps) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { penType, penSize, penColor, whiteboardClient, rubberSize, inputMode, geometryMode } = state;

  /**
   * 切换白板输入模式
   */
  useEffect(() => {
    if (whiteboardClient) {
      log('inputMode', inputMode);
      whiteboardClient.setInputMode(inputMode);
    }
  }, [whiteboardClient, inputMode]);

  /**
   * 设置画笔
   */
  useEffect(() => {
    const style = {
      type: penType,
      size: penSize,
      color: penType === 1 ? `#7f${penColor.replace('#', '')}` : `#ff${penColor.replace('#', '')}`
    };
    log('style', style);
    if (whiteboardClient) {
      whiteboardClient.setPenStyle(style);
    }
  }, [whiteboardClient, penColor, penSize, penType]);

  /**
   * 设置橡皮大小
   */
  useEffect(() => {
    if (whiteboardClient && inputMode === InputMode.Rubber) {
      whiteboardClient.setEraseSize(rubberSize);
    }
  }, [whiteboardClient, rubberSize, inputMode]);

  /**
   * 设置图形模式
   */
  useEffect(() => {
    if (whiteboardClient && inputMode === InputMode.Geometry) {
      whiteboardClient.setGeometryMode(geometryMode);
      dispatch({
        type: 'updatePenType',
        payload: PenType.WritingPen
      });
    }
  }, [whiteboardClient, inputMode, geometryMode, penSize, penColor]);

  return <storeContext.Provider value={{ state, dispatch }}>
    {children}
  </storeContext.Provider>;
};

export default Store;
