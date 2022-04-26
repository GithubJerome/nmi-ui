import { Alert, Checkbox, Form, Input } from 'antd';
import React, { useState } from 'react';
import { Dispatch, AnyAction, Link, connect } from 'umi';
import { StateType } from './model';
import styles from './style.less';
import { AuthKeyParamsType } from './service';
import LoginFrom from './components/Login';
import { encryptText } from '../../../utils/utils'
import { message } from 'antd';
import Title from 'antd/lib/typography/Title';

const { Tab, UserName, Password, Submit } = LoginFrom;
interface ChangePasswordProps {
  dispatch: Dispatch<AnyAction>;
  userAndChangePass: StateType;
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

const Login: React.FC<ChangePasswordProps> = (props) => {
  const { userAndChangePass = {}, submitting } = props;
  const { status, type: loginType } = userAndChangePass;
  const [type, setType] = useState<string>('account');

  const handleSubmit = (values: AuthKeyParamsType) => {
    const { dispatch } = props;
    const val = {...values};
    console.log("val ==== ", val);
    if(val.new_password !== val.new_password2){
      message.error("Passwords do not match!");
      return;
    }
    val.new_password = encryptText(val.new_password);
    val.new_password2 = encryptText(val.new_password2);

    dispatch({
      type: 'userAndChangePass/resetPassword',
      payload: {
        ...val,
        type,
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
          <Form.Item
            name="new_password"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please enter new password!' }]}
          >
            <Input type="password" className={styles.textBg} placeholder="New password" />
          </Form.Item>
          <Form.Item
            name="new_password2"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please re-type new password!' }]}
          >
            <Input type="password" className={styles.textBg} placeholder="Re-type new password" />
          </Form.Item>
          <Form.Item
            name="reset_token"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please enter reset token!' }]}
          >
            <Input className={styles.textBg} placeholder="Reset Token" />
          </Form.Item>
        <Submit loading={submitting}>Submit</Submit>
      </Form>
    </div>
  );
};

export default connect(
  ({
    userAndChangePass,
    loading,
  }: {
    userAndChangePass: StateType;
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userAndChangePass,
    submitting: loading.effects['userAndChangePass/resetPassword'],
  }),
)(Login);
