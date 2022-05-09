import { Modal } from 'antd';
import { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { storeContext } from '../store';
import { LoginStatus } from '../types/store';

/**
 * 监听登录状态
 */
const useMonitorLogin = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(storeContext);

  useEffect(() => {
    /**
     * 登录成功
     * @param response
     */
    function loginSuccess(response: any) {
      dispatch({
        type: 'setLogin',
        payload: LoginStatus.Logged
      });
      console.log('loginSuccess', response);
      history.push('/home');
    }

    /**
     * 登录失败
     * @param error
     */
    function loginFail(error: any) {
      dispatch({
        type: 'setLogin',
        payload: LoginStatus.NotLogged
      });
      Modal.error({
        title: 'loginFail',
        content: JSON.stringify(error)
      });
    }

    if (state.im) {
      state.im.on({
        loginSuccess,
        loginFail
      });
    }
    return () => {
      if (state.im) {
        state.im.off({
          loginSuccess,
          loginFail
        });
      }
    };
  }, [state.im]);
};

export default useMonitorLogin;