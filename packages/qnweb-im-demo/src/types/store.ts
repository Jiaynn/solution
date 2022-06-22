export interface StoreProps {

}

export enum LoginStatus {
  NotLogged, // 未登录
  Logging, // 登录中
  Logged, // 已登录
}

export interface State {
  im: any;
  loginStatus: LoginStatus;
}

export interface Action {
  type: 'setIM' | 'setLogin';
  payload: any;
}

export interface StoreContext {
  state: State;
  dispatch: (action: Action) => void;
}