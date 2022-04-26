import { Alert, Checkbox, Form, Input } from 'antd';
import React, { useState } from 'react';
import { Dispatch, AnyAction, Link, connect } from 'umi';
import { StateType } from './model';
import styles from './style.less';
import { AuthKeyParamsType } from './service';
import LoginFrom from './components/Login';
import { encryptText } from '../../../utils/utils'
import Title from 'antd/lib/typography/Title';

const { Tab, UserName, Password, Submit } = LoginFrom;
interface ForgotPasswordProps {
  dispatch: Dispatch<AnyAction>;
  userAndForgotPass: StateType;
  submitting?: boolean;
}

const ErrorMessage: React.FC<{
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

const Login: React.FC<ForgotPasswordProps> = (props) => {
  const { userAndForgotPass = {}, submitting } = props;
  const { status, type: loginType } = userAndForgotPass;
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: AuthKeyParamsType) => {
    const { dispatch } = props;
    const val = {...values};
    dispatch({
      type: 'userAndForgotPass/authKey',
      payload: {
        ...val,
      },
    });
  };
  return (
    <div className={styles.main}>
      <Form onFinish={handleSubmit}>
        <Title level={3}>Reset password</Title>

        <Form.Item
          name="username"
          className={styles.textBg}
          rules={[{ required: true, message: 'Please enter username!' }]}
        >
          <Input className={styles.textBg} placeholder="Username" />
        </Form.Item>

        <Submit style={{width: "100%"}} loading={submitting}>Submit</Submit>
        <a
          href="#"
          onClick={()=>window.history.back()}
        >
          Back to Login 
        </a>
      </Form>
    </div>
  );
};

export default connect(
  ({
    userAndForgotPass,
    loading,
  }: {
    userAndForgotPass: StateType;
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userAndForgotPass,
    submitting: loading.effects['userAndForgotPass/authKey'],
  }),
)(Login);
