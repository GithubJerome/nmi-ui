import '@ant-design/compatible/assets/index.css';
import { Button, Input, Form, message, Spin } from 'antd';
import { Dispatch, connect, FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import React, { Component, useState, useEffect } from 'react';

import styles2 from '@/layouts/BasicLayout.less';
import { getUserData, encryptText, API_URL } from '@/utils/utils';
import { CurrentUser } from '../data';
import styles from './BaseView.less';

interface ProfileViewProps {
  currentUser?: CurrentUser;
}

const ProfileView: React.FC<ProfileViewProps> = (props) => {
  const [userProfile, setUserProfile] = useState<object>({});
  const [userProfileLoading, setUserProfileLoading] = useState<boolean>(true);
  const intl = useIntl();

  const queryUserProfile = () => {
    setUserProfileLoading(true);

    const currentUser = getUserData();
    request
    .get(`${API_URL}user/profile`, {
      headers: {
        token: currentUser.token,
        userid: currentUser.id
      },
    })
    .then((response) => {
      if (response.status === "Failed") {
        message.error(response.alert);
        history.replace("/user/login");
      }

      setUserProfile(response.data);
      setUserProfileLoading(false);
    })
    .catch((error) => {
      console.log(error);
    });

  }
  const handleFinish = (frmData: any) => {
    const currentUser = getUserData();
    if(!frmData.email || frmData.email === ""){
      message.error("Email can not be empty!");
      return;
    }
    if(!frmData.username || frmData.username === ""){
      message.error("Username can not be empty!");
      return;
    }

    let encryptedPass = currentUser.password;
    if((frmData.password1 !== undefined && frmData.password2 !== undefined) && (frmData.password1 !== "" && frmData.password2 !== "")){
      if(frmData.password1 !== frmData.password2){
        message.error("Passwords do not match!");
        return;
      }
      encryptedPass = encryptText(frmData.password1);
    }

    const val = {...frmData};
    delete val.password1;
    delete val.password2;
    val.password = encryptedPass;
    val.account_id = currentUser.id;
    val.url = window.location.host;

    setUserProfileLoading(true);
    request
      .put(`${API_URL}user/update`, {
        headers: {
          token: currentUser.token,
          userid: currentUser.id
        },
        data: val
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        
        message.success(intl.formatMessage({
          id: 'pages.account.settings.base.update',
          defaultMessage: 'Update basic information successfully',
        }));

        setUserProfileLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    queryUserProfile();
  }, []);

  return (
    <div className={styles.baseView}>
      <div className={styles.left}>
        <Spin spinning={userProfileLoading}>
        { userProfile && userProfile.id &&
        <Form
          layout="vertical"
          onFinish={handleFinish}
          initialValues={userProfile}
          hideRequiredMark
        >
          <Form.Item
            name="email"
            label={<FormattedMessage
              id="pages.account.settings.base.email"
              defaultMessage="Email"
            />}
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="username"
            label={<FormattedMessage
              id="pages.account.settings.base.username"
              defaultMessage="Username"
            />}
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="first_name"
            label={<FormattedMessage
              id="pages.account.settings.base.firstname"
              defaultMessage="First Name"
            />}
            rules={[
              {
                required: true,
                message: "Please input your first name!",
              },
            ]}
          >
            <Input className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="middle_name"
            label={<FormattedMessage
              id="pages.account.settings.base.middlename"
              defaultMessage="Middle Name"
            />}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={<FormattedMessage
              id="pages.account.settings.base.lastname"
              defaultMessage="Last Name"
            />}
            rules={[
              {
                required: true,
                message: "Please input your last name!",
              },
            ]}
          >
            <Input className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="password1"
            label={<FormattedMessage
              id="pages.account.settings.base.password"
              defaultMessage="Password"
            />}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input type="password" className={styles2.textInput} />
          </Form.Item>
          <Form.Item
            name="password2"
            label={<FormattedMessage
              id="pages.account.settings.base.repassword"
              defaultMessage="Re-type password"
            />}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input type="password" className={styles2.textInput} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              <FormattedMessage
                id="pages.account.settings.base.updatebtn"
                defaultMessage="Update Information"
              />
            </Button>
          </Form.Item> 
        </Form>
        }
        </Spin>
      </div>
    </div>
  );
}

export default ProfileView;
