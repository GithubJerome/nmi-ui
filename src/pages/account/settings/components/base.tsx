import '@ant-design/compatible/assets/index.css';
import { Button, Input, Form, message } from 'antd';
import { Dispatch, connect, FormattedMessage } from 'umi';
import React, { Component } from 'react';

import styles2 from '@/layouts/BasicLayout.less';
import { getUserData, encryptText } from '@/utils/utils';
import { CurrentUser } from '../data.d';
import styles from './BaseView.less';

interface BaseViewProps {
  currentUser?: CurrentUser;
  dispatch: Dispatch<any>;
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  }

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  handleFinish = (frmData) => {
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

    const { dispatch } = this.props;
    const val = {...frmData};
    delete val.password1;
    delete val.password2;
    val.password = encryptedPass;
    val.companies = [null];
    val.groups = [null];
    val.roles = [null];

    if(currentUser.companies && currentUser.companies[0]){
      val.companies = [currentUser.companies[0].company_id];
    }
    if(currentUser.groups && currentUser.groups[0]){
      val.groups = [currentUser.groups[0].group_id];
    }
    if(currentUser.roles && currentUser.roles[0]){
      val.roles = [currentUser.roles[0].role_id];
    }
    val.account_id = currentUser.id;
    val.url = window.location.host;
    dispatch({
      type: 'accountAndsettings/saveCurrentUser',
      payload: {
        ...val
      },
    });

    message.success('Update basic information successfully');
  };

  render() {
    const currentUser = getUserData();
    console.log("currentUser === ", currentUser);
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form
            layout="vertical"
            onFinish={this.handleFinish}
            initialValues={currentUser}
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
        </div>
      </div>
    );
  }
}

export default connect(
  ({ accountAndsettings }: { accountAndsettings: { currentUser: CurrentUser } }) => ({
    currentUser: accountAndsettings.currentUser,
  }),
)(BaseView);
