import React, { Component, Suspense } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import moment from 'moment';
import { connect, Dispatch } from 'umi';
import request from 'umi-request';

import PageLoading from './components/PageLoading';
import { AnalysisData } from './data.d';
import { message } from 'antd';
import { getUserData } from '@/utils/utils';

const IntroduceRow = React.lazy(() => import('./components/IntroduceRow'));

type RangePickerValue = RangePickerProps<moment.Moment>['value'];

interface AnalysisProps {
  dashboardAndanalysis: AnalysisData;
  dispatch: Dispatch<any>;
  loading: boolean;
}

class Analysis extends Component<AnalysisProps> {
  reqRef: number = 0;

  timeoutId: number = 0;

  state = {
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.reqRef = requestAnimationFrame(() => {
      dispatch({
        type: 'dashboardAndanalysis/fetchCourse',
      });
      dispatch({
        type: 'dashboardAndanalysis/fetchSkills',
      });
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboardAndanalysis/clear',
    });
    cancelAnimationFrame(this.reqRef);
    clearTimeout(this.timeoutId);
  }

  render() {
    const { dashboardAndanalysis, loading } = this.props;
    const {
      Course, Skills
    } = dashboardAndanalysis;

    return (
      <GridContent>
        <React.Fragment>
          <Suspense fallback={<PageLoading />}>
            <IntroduceRow course={Course} skills={Skills} loading={loading} />
          </Suspense>
        </React.Fragment>
      </GridContent>
    );
  }
}

export default connect(
  ({
    dashboardAndanalysis,
    loading,
  }: {
    dashboardAndanalysis: any;
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    dashboardAndanalysis,
    loading: loading.effects['dashboardAndanalysis/fetchSystemInfo'],
  }),
)(Analysis);
