import React, { useContext, useReducer } from 'react';

interface State {
  token?: string;
}

type Action = {
  type: 'SET_TOKEN';
  payload: string;
}

const context = React.createContext<{
  state: State,
  dispatch: React.Dispatch<Action>
}>({
  state: {},
  dispatch: () => ({})
});

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload
      };
    default:
      throw new Error();
  }
};

export const Store: React.FC = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, {
    token: localStorage.getItem('token') || ''
  });
  return <context.Provider value={{ state, dispatch }}>
    {children}
  </context.Provider>;
};

export const useStore = (): {
  state: State,
  dispatch: React.Dispatch<Action>
} => {
  return useContext(context);
};
