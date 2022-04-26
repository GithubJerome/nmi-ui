import { Alert, Checkbox, Input, Form, Typography } from 'antd';
import React, { useState } from 'react';
import { Dispatch, AnyAction, Link, connect } from 'umi';
import Title from 'antd/lib/typography/Title';
import { merge } from 'lodash';
import { StateType } from './model';
import styles from './style.less';
import { LoginParamsType } from './service';
import LoginFrom from './components/Login';
import { encryptText } from '../../../utils/utils';

const { Tab, UserName, Password, Submit } = LoginFrom;
interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userAndlogin: StateType;
  submitting?: boolean;
}

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = (props) => {
  const { userAndlogin = {}, submitting } = props;
  const { status, type: loginType } = userAndlogin;
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: LoginParamsType) => {
    const { dispatch } = props;
    const url = {"url": window.location.origin};
    const val = merge(url, {...values});

    val.password = encryptText(val.password);

    dispatch({
      type: 'userAndlogin/login',
      payload: {
        ...val,
        type,
      },
    });
  };
  return (
    <div className={styles.main}>
      <Form onFinish={handleSubmit}>
        {status === 'error' && loginType === 'account' && !submitting && (
          <LoginMessage content="Incorrect username or password!" />
        )}
        
        <Title level={3}>Login to your account</Title>

        <Form.Item
          name="username"
          className={styles.textBg}
          rules={[{ required: true, message: 'Please enter username!' }]}
        >
          <Input className={styles.textBg} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password className={styles.textBg} placeholder="Password" />
        </Form.Item>

        <div>
          <a
            href="/user/forgot-password"
          >
            Forgot password
          </a>
        </div>
        <Submit style={{width: "100%"}} loading={submitting}>Login</Submit>
      </Form>
    </div>
  );
};

export default connect(
  ({
    userAndlogin,
    loading,
  }: {
    userAndlogin: StateType;
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userAndlogin,
    submitting: loading.effects['userAndlogin/login'],
  }),
)(Login);
