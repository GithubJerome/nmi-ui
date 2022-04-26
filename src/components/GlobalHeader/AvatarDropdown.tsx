import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, message } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import { FormattedMessage, history } from 'umi';
import { getUserData , getPageQuery } from '@/utils/utils';
import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import request from 'umi-request';
import { API_URL } from '@/utils/utils';

export interface GlobalHeaderRightProps {
  menu?: boolean;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {

  logoutAccnt = () => {
    const { redirect } = getPageQuery();
    const userData = getUserData();
    if(userData === null){
      return;
    }
    request
      .post(API_URL+`user/logout`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
      })
      .then((response) => {
        if (response.status === "ok") {
          localStorage.clear();
          if (window.location.pathname !== '/user/login' && !redirect) {
            window.location.href = '/user/login';
          }
        } else {
          message.error(response.alert);
          window.location.href = '/user/login';
        }
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { redirect } = getPageQuery();
      this.logoutAccnt();

      // localStorage.clear();
      if (window.location.pathname !== '/user/login' && !redirect) {
        // history.replace({
        //   pathname: '/user/login',
        //   search: stringify({
        //     redirect: window.location.href,
        //   }),
        // });
        // window.location.href = '/user/login';
      }

      return;
    }

    history.push(`/account/${key}`);
  };

  render(): React.ReactNode {
    const {
      menu,
    } = this.props;
    const userData = getUserData();
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {menu && (
          <Menu.Item key="settings">
            <UserOutlined />
            <FormattedMessage
              id="component.globalHeader.avatarDropdown.profile"
              defaultMessage="Profile"
            />
          </Menu.Item>
        )}
        {menu && <Menu.Divider />}

        <Menu.Item key="logout">
          <LogoutOutlined />
          <FormattedMessage
            id="component.globalHeader.avatarDropdown.logout"
            defaultMessage="Logout"
          />
        </Menu.Item>
      </Menu>
    );
    return userData && (userData.username || userData.email) ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <UserOutlined style={{marginRight: "5px"}} />
          {/* <span className={styles.name}>{(`${userData.first_name } ${ userData.last_name}`)}</span> */}
          <span className={styles.name}>{(userData.username || userData.email)}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <span className={`${styles.action} ${styles.account}`}>
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        />
      </span>
    );
  }
}

export default (AvatarDropdown);
