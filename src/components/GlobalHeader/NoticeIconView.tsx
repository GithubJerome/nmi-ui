import React, { Component } from 'react';
import { connect, ConnectProps, formatMessage } from 'umi';
import { Tag, message } from 'antd';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import { NoticeItem } from '@/models/global';
import { CurrentUser } from '@/models/usersssss';
import { ConnectState } from '@/models/connect';
import NoticeIcon from '../NoticeIcon';
import styles from './index.less';
import request from 'umi-request';
import { getUserData, epochToJsDate } from '@/utils/utils';
import { API_URL } from '@/utils/utils';
import { history } from 'umi';

import io from "socket.io-client";

const { UMI_APP_SOCKET_ENDPOINT } = process.env;

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  notices?: NoticeItem[];
  currentUser?: CurrentUser;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
}

class GlobalHeaderRight extends Component<GlobalHeaderRightProps> {
  
  constructor(props) {
    super(props);
    this.state = {
      notifs: [],
      unseen: 0,
      page: 1,
      limit: 10,
      loading: true
    };
  }

  componentDidMount() {
    const socket = io.connect(UMI_APP_SOCKET_ENDPOINT);
    const userData = getUserData();
    if(userData){
      socket.on("connect", data => {
        socket.emit('notif', {
          token: userData.token,
          userid: userData.id,
          type: 'notification'
        })
      });
      const ths = this;
  
      socket.on('notification', function(msg) {
        if(msg.message !== "Connected!"){
          let d = [{
            description: msg.message,
            notification_id: msg.notification_id,
            notification_name: msg.notification_type,
            notification_type: msg.notification_type,
            seen_by_user: false
          }]
          ths.setState({
            notifs: [...d, ...ths.state.notifs],
            unseen: ths.state.unseen+1
          });
        }
      })
    }

    this.queryNotifs("new");
  }

  changeReadState = (clickedItem: NoticeItem): void => {
    const { id } = clickedItem;
    const { dispatch } = this.props;

    if (dispatch) {
      dispatch({
        type: 'global/changeNoticeReadState',
        payload: id,
      });
    }
  };

  handleNoticeClear = (title: string, key: string) => {
    const { dispatch } = this.props;
    message.success(`${'Empty'} ${title}`);

    if (dispatch) {
      dispatch({
        type: 'global/clearNotices',
        payload: key,
      });
    }
  };

  seenNotifs = (params: { notification_ids: number[]; }) => {
    const userData = getUserData();
    if(userData === null){
      return;
    }
    request
      .put(API_URL+`notification/seen`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        if (response.status === "ok") {
          let newList = [...this.state.notifs];
          for (let i = 0; i < newList.length; i++) {
            if(newList[i].notification_id === params.notification_ids[0]){
              newList[i].seen_by_user = true;
            }
          }
          this.setState({
            unseen: response.unseen,
            notifs: newList
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  queryNotifs = (type: string) => {
    const userData = getUserData();
    if(userData === null){
      return;
    }
    this.setState({
      loading: true
    })
    const params = { 
      limit: this.state.limit,
      page: this.state.page
    }
    request
      .get(API_URL+`notification`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        const notifs = [...this.state.notifs];
        if(type === "append"){
          this.setState({
            notifs: notifs.concat(response.rows),
            unseen: response.unseen,
            loading: false
          });
        } else {
          this.setState({
            notifs: response.rows,
            unseen: response.unseen,
            loading: false
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchMoreData = () => {
    this.setState({
      page: this.state.page + 1
    },()=>{
      this.queryNotifs("append");
    });
    
  };

  render() {
    const { fetchingNotices, onNoticeVisibleChange } = this.props;
    
    return (
      <NoticeIcon
        className={styles.action}
        count={this.state.unseen}
        onItemClick={(item) => {
          this.changeReadState(item as NoticeItem);
          
          this.seenNotifs({ notification_ids: [item.notification_id] });
        }}
        loading={this.state.loading}
        // clearText="Clear Text"
        viewMoreText={formatMessage({
          id:"notifs.config.view.more",
          defaultMessage:"View More"
        })}
        // onClear={this.handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => this.fetchMoreData()}
        clearClose
      >
        <NoticeIcon.Tab
          tabKey="notification"
          count={this.state.notifs}
          list={this.state.notifs}
          loading={this.state.loading}
          title={formatMessage({
            id:"notifs.config.title",
            defaultMessage:"Notifications"
          })}
          
          emptyText={formatMessage({
            id:"notifs.config.no-notifs",
            defaultMessage:"You have no notifications"
          })}
          showViewMore
        />
      </NoticeIcon>
    );
  }
}

export default connect(({ user, global, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingMoreNotices: loading.effects['global/fetchMoreNotices'],
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(GlobalHeaderRight);
