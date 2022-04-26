import { Avatar, List } from 'antd';

import React from 'react';
import classNames from 'classnames';
import { NoticeIconData } from './index';
import styles from './NoticeList.less';
import { BellOutlined, HeartOutlined, NotificationOutlined, StarOutlined, TrophyOutlined } from '@ant-design/icons';

export interface NoticeIconTabProps {
  count?: number;
  name?: string;
  showClear?: boolean;
  showViewMore?: boolean;
  style?: React.CSSProperties;
  title: string;
  loading: boolean;
  tabKey: string;
  data?: NoticeIconData[];
  onClick?: (item: NoticeIconData) => void;
  onClear?: () => void;
  emptyText?: string;
  clearText?: string;
  viewMoreText?: string;
  list: NoticeIconData[];
  onViewMore?: (e: any) => void;
}
const NoticeList: React.SFC<NoticeIconTabProps> = ({
  data = [],
  onClick,
  onClear,
  title,
  loading,
  onViewMore,
  emptyText,
  showClear = true,
  clearText,
  viewMoreText,
  showViewMore = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.notFound}>
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
          alt="not found"
        />
        <div>{emptyText}</div>
      </div>
    );
  }
  return (
    <div>
      <List<NoticeIconData>
        className={styles.list}
        loading={loading}
        dataSource={data}
        renderItem={(item, i) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.seen_by_user,
          });
          const leftIcon = (item) => {
            if(item.notification_type === "new tasks") {
              return <span className={styles.iconElement}><StarOutlined /></span>
            } else if(item.notification_type === "reminders") {
              return <span className={styles.iconElement}><BellOutlined /></span>
            } else if(item.notification_type === "new levels") {
              return <span className={styles.iconElement}><HeartOutlined /></span>
            } else if(item.notification_type === "new medals") {
              return <span className={styles.iconElement}><TrophyOutlined /></span>
            } else {
              return <span className={styles.iconElement}><NotificationOutlined /></span>
            }
          };

          return (
            <List.Item
              className={itemCls}
              key={item.key || i}
              onClick={() => onClick && onClick(item)}
            >
              <List.Item.Meta
                className={styles.meta}
                avatar={leftIcon(item)}
                title={
                  <div className={styles.title}>
                    {item.title || item.notification_name}
                    <div className={styles.extra}>{item.extra}</div>
                  </div>
                }
                description={
                  <div>
                    <div className={styles.description}>{item.description}</div>
                    <div className={styles.datetime}>{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <div className={styles.bottomBar}>
        {showClear ? (
          <div onClick={onClear}>
            {clearText} {title}
          </div>
        ) : null}
        {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e);
              }
            }}
          >
            {viewMoreText}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NoticeList;
