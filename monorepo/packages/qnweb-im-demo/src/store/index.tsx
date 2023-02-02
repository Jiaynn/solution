import React, { useReducer } from 'react';
import { Action, LoginStatus, State, StoreContext, StoreProps } from '../types/store';

const defaultState = {
  im: null,
  loginStatus: LoginStatus.NotLogged
};

export const storeContext = React.createContext({} as StoreContext);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'setIM':
      return {
        ...state,
        im: action.payload
      };
    case 'setLogin':
      return {
        ...state,
        loginStatus: action.payload
      };
  }
  return state;
}

const Store: React.FC<StoreProps> = props => {

  const { children } = props;

  const [state, dispatch] = useReducer(reducer, defaultState);

  return <storeContext.Provider value={{ state, dispatch }}>
    {children}
  </storeContext.Provider>;
};

export default Store;