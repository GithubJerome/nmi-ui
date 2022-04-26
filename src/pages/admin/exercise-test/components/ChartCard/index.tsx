import { Card } from 'antd';
import { CardProps } from 'antd/es/card';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

type totalType = () => React.ReactNode;

const renderTotal = (total?: number | totalType | React.ReactNode) => {
  if (!total && total !== 0) {
    return null;
  }
  let totalDom;
  switch (typeof total) {
    case 'undefined':
      totalDom = null;
      break;
    case 'function':
      totalDom = <div className={styles.total}>{total()}</div>;
      break;
    default:
      totalDom = <div className={styles.total}>{total}</div>;
  }
  return totalDom;
};

export interface ChartCardProps extends CardProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  total?: React.ReactNode | number | (() => React.ReactNode | number);
  footer?: React.ReactNode;
  contentHeight?: number;
  avatar?: React.ReactNode;
  style?: React.CSSProperties;
}

class ChartCard extends React.Component<ChartCardProps> {
  renderContent = () => {
    const { contentHeight, title, avatar, action, total, footer, children, loading } = this.props;
    if (loading) {
      return false;
    }
    return (
      <div className={styles.chartCard}>
        {children && (
          <div className={styles.content} style={{ height: contentHeight || 'auto', width: "100%" }}>
            <div className={contentHeight && styles.contentFixed}>{children}</div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const {
      loading = false,
      contentHeight,
      title,
      avatar,
      action,
      total,
      footer,
      children,
      ...rest
    } = this.props;
    return (
      <Card loading={loading} bodyStyle={{ padding: '5px 5px 5px 5px' }} {...rest}>
        {this.renderContent()}
      </Card>
    );
  }
}

export default ChartCard;
