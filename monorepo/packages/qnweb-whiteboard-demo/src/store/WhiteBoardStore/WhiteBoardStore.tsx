import React, { useContext, useReducer } from 'react';

import { WhiteBoardAction, WhiteBoardState } from './type';

export const whiteBoardContext = React.createContext<{
  state: WhiteBoardState,
  dispatch: React.Dispatch<WhiteBoardAction>
}>({
  state: {},
  dispatch: () => ({})
});

export const whiteBoardReducer: React.Reducer<WhiteBoardState, WhiteBoardAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'PATCH':
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw new Error();
  }
};

export const WhiteBoardStore: React.FC<{
  value?: WhiteBoardState
}> = props => {
  const { children, value } = props;
  const [state, dispatch] = useReducer(whiteBoardReducer, { ...value });

  return <whiteBoardContext.Provider value={{ state, dispatch }}>
    {children}
  </whiteBoardContext.Provider>;
};

export const useWhiteBoardStore = (): {
  state: WhiteBoardState,
  dispatch: React.Dispatch<WhiteBoardAction>
} => {
  return useContext(whiteBoardContext);
};
