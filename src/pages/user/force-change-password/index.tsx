import { Alert, Checkbox, Form, Input } from 'antd';
import React, { useState } from 'react';
import { Dispatch, AnyAction, Link, connect } from 'umi';
import { StateType } from './model';
import styles from './style.less';
import { AuthKeyParamsType } from './service';
import { encryptText } from '../../../utils/utils'
import { message } from 'antd';
import LoginFrom from './components/Login';

import Title from 'antd/lib/typography/Title';

const { Tab, UserName, Password, Submit } = LoginFrom;

interface ChangePasswordProps {
  dispatch: Dispatch<AnyAction>;
  userAndForceChangePass: StateType;
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

const ForceChangePassword: React.FC<ChangePasswordProps> = (props) => {
  const { userAndForceChangePass = {}, submitting } = props;
  const { status, type: loginType } = userAndForceChangePass;
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
    val.old_password = encryptText(val.old_password);
    console.log("dispatch val ==== ", val);

    dispatch({
      type: 'userAndForceChangePass/forceChangePassword',
      payload: {
        ...val,
        type,
      },
    });
  };
  return (
    <div className={styles.main}>
      <Form onFinish={handleSubmit}>
        <Title level={3}>Change password</Title>
          {/* <Form.Item
            name="email"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please enter username/email!' }]}
          >
            <Input className={styles.textBg} placeholder="Email" />
          </Form.Item> */}
          <Form.Item
            name="old_password"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please enter old/temporary password!' }]}
          >
            <Input type="password" className={styles.textBg} placeholder="Old password" />
          </Form.Item>
          <Form.Item
            name="new_password"
            className={styles.textBg}
            rules={[{ required: true, message: 'Please type your new password!' }]}
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
        <Submit style={{width: "100%"}} loading={submitting}>Submit</Submit>
      </Form>
    </div>
  );
};

export default connect(
  ({
    userAndForceChangePass,
    loading,
  }: {
    userAndForceChangePass: StateType;
    loading: {
      effects: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userAndForceChangePass,
    submitting: loading.effects['userAndForceChangePass/forceChangePassword'],
  }),
)(ForceChangePassword);
