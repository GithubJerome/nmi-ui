import { Tooltip, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { connect, ConnectProps } from 'umi';
import { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
import Roles from './SelectedRole';
import HeaderSearch from '../HeaderSearch';
import SelectLang from '../SelectLang';
import { getUserData } from '@/utils/utils';

import styles from './index.less';
import NoticeIconView from './NoticeIconView';

export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}
const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const userData = getUserData();
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="Search"
        defaultValue=""
        options={[ 
          {
            label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>,
            value: 'umi ui',
          },
          {
            label: <a href="next.ant.design">Ant Design</a>,
            value: 'Ant Design',
        ]} 
        onSearch={value => {
          console.log('input', value);
        }}
      />
      */}
      {/* <Tooltip title="Documentation">
        <a
          target="_blank"
          href="https://www.miscea.com/en/products"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <QuestionCircleOutlined />
        </a>
      </Tooltip> */}
      <NoticeIconView />
      { (userData.roles.length > 1) &&
         <Roles />
      }
      <Avatar menu />
      <SelectLang className={styles.action} />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
