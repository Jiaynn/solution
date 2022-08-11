import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { message } from 'antd';

import { BaseApi } from '@/api';
import { useUserStore } from '@/store';
import { LoginData, LoginForm } from './login-form';

import styles from './index.module.scss';

/**
 * 表单校验
 * @param value
 */
const validateForm = (value: LoginData): string | null => {
  if (!value.phone) {
    return '请输入手机号';
  }
  if (!value.smsCode) {
    return '请输入验证码';
  }
  if (!value.checked) {
    return '请阅读并同意七牛云服务用户协议和隐私权政策';
  }
  return null;
};

interface LoginProps {
  nextUrl: string;
  version?: string | null;
}

/**
 * 登录页面
 * @constructor
 */
export const Login: React.FC<LoginProps> = (props) => {
  const history = useHistory();
  const { nextUrl, version } = props;
  const { dispatch } = useUserStore();

  // 登录数据
  const [loginData, setLoginData] = useState<LoginData>({
    phone: '',
    smsCode: '',
    checked: false
  });
  const [isSmsLoading, setIsSmsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [countdown, setCountdown] = useState<number>(0); // 倒计时

  /**
   * 验证码倒计时
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        clearTimeout(timer);
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  /**
   * 点击登录按钮
   * @param data
   */
  const onSubmit = async (data: LoginData) => {
    try {
      const errMsg = validateForm(data);
      if (errMsg) {
        return message.error(errMsg);
      }
      setIsLoading(true);
      const result = await BaseApi.signUpOrInApi({
        phone: data.phone,
        smsCode: data.smsCode
      });
      if (!result.data) {
        console.error(`result.data is ${result.data}`);
        return;
      }
      const { imConfig, loginToken, ...userInfo } = result.data;
      dispatch({
        type: 'setUserInfo',
        payload: userInfo
      });
      dispatch({
        type: 'setIMConfig',
        payload: imConfig
      });
      dispatch({
        type: 'setAuthorization',
        payload: loginToken
      });
      setIsLoading(false);
      history.push(nextUrl);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  /**
   * 点击获取验证码按钮
   */
  const onSmsClick = async () => {
    try {
      if (!loginData.phone) {
        message.error('请输入手机号');
        return;
      }
      setIsSmsLoading(true);
      await BaseApi.getSmsCodeApi({ phone: loginData.phone });
      setCountdown(60);
      message.success('验证码发送成功');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSmsLoading(false);
    }
  };

  /**
   * 表单值修改
   * @param value
   */
  const onChange = (value: LoginData) => {
    setLoginData({
      ...value,
      phone: value.phone.replace(/\D/g, '').substring(0, 11)
    });
  };

  return <div className={styles.page}>
    <div className={styles.card}>
      <LoginForm
        data={loginData}
        onChange={onChange}
        onSmsClick={onSmsClick}
        onSubmit={onSubmit}
        isSmsLoading={isSmsLoading}
        isLoading={isLoading}
        countdown={countdown}
      />
      {version && <div className={styles.version}>当前版本：{version}</div>}
    </div>
  </div>;
};
