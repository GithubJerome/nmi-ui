import { UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Menu, Spin, message } from 'antd';
import React from 'react';
import { FormattedMessage } from 'umi';
import { getUserData , API_URL } from '@/utils/utils';
import request from 'umi-request';
import { setAuthority } from '@/utils/authority';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export interface GlobalHeaderRightProps {
  menu?: boolean;
}

class SelectedRole extends React.Component<GlobalHeaderRightProps> {

  setCurrentRole = (key: string) => {
    const userData = getUserData();
    userData.current_role_name = key
    localStorage.setItem('nmi-user', JSON.stringify(userData));
  }

  changeRole = (event : any) => {
    const { key } = event;
    const userData = getUserData();
    
    const role_data = {
      "role_name": key
    }
    
    request
      .put(`${API_URL}user/set-role`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: role_data
      })
      .then((response) => {

        setAuthority(key);
        this.setCurrentRole(key);

        if (response.status === "ok") {
          message.success(response.message);
          if(key === "student"){
            window.location.href = '/dashboard';
          } else if(key === "tutor"){
            window.location.href = '/tutor-dashboard';
          } else if(key === "parent"){
            window.location.href = '/account/settings';
          } else {
            window.location.href = '/admin/users';
          }
        } else {
          message.error(response.alert);
        }

      })
      .catch((error) => {
        console.log(error);
      });
  }

  render(): React.ReactNode {
    const userData = getUserData();
    const userRoles = [];
    for (let i = 0; i < userData.roles.length; i++) {
      userRoles.push(userData.roles[i].role_name);
    }
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.changeRole}>
        { (userRoles.indexOf("student") > -1 && userRoles.length > 1) && 
          <Menu.Item key="student">
              <UserOutlined />
              <FormattedMessage
                id="component.globalHeader.avatarDropdown.student"
                defaultMessage="Student"
              />
          </Menu.Item> 
        }
        { (userRoles.indexOf("student") > -1 && userRoles.length > 1) && <Menu.Divider /> }
        { (userRoles.indexOf("parent") > -1 && userRoles.length > 1) && 
          <Menu.Item key="parent">
            <UserOutlined />
            <FormattedMessage
              id="component.globalHeader.avatarDropdown.parent"
              defaultMessage="Parent"
            />
          </Menu.Item>
        }
        { (userRoles.indexOf("parent") > -1 && userRoles.length > 1) && <Menu.Divider /> }
        { (userRoles.indexOf("tutor") > -1 && userRoles.length > 1) &&
           <Menu.Item key="tutor">
              <UserOutlined />
              <FormattedMessage
                id="component.globalHeader.avatarDropdown.tutor"
                defaultMessage="Tutor"
              />
            </Menu.Item>
        }
        { (userRoles.indexOf("tutor") > -1 && userRoles.length > 1) && <Menu.Divider /> }
        { (userRoles.indexOf("manager") > -1 && userRoles.length > 1) &&
            <Menu.Item key="manager">
              <UserOutlined />
              <FormattedMessage
                id="component.globalHeader.avatarDropdown.manager"
                defaultMessage="Manager"
              />
            </Menu.Item>
        }
        </Menu>
    );
    return userData && (userData.username || userData.email) ? (
      <HeaderDropdown className={styles.roleDropdown} overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <UserSwitchOutlined style={{marginRight: "5px"}} />
          <span className={styles.name}>
            <FormattedMessage
              id={`component.globalHeader.avatarDropdown.${userData.current_role_name}`}
              defaultMessage={userData.current_role_name}
            />
          </span>
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

export default (SelectedRole);
