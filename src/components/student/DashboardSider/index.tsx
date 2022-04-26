import { FormattedMessage } from 'umi';
import { Card, Typography, Layout, Grid, Row, Col, Radio, Spin, Progress } from 'antd';
import React, { useState, useEffect } from 'react';
import request from 'umi-request';
import { updateSidebarUserData, getUserData, API_URL } from '@/utils/utils';
import TimelineChart2 from '@/pages/dashboard2/components/TimelineChart2';
import courseImg from '@/assets/course.png';
import { isMobile } from "react-device-detect";
import style from './index.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph } = Typography;
const { Sider } = Layout;

interface ProgressSiderProps {
  onCollapse: any;
}

const ProgressSider: React.FC<ProgressSiderProps> = (props) => {
  const { onCollapse } = props;
  const screens = useBreakpoint();
  const userInfo = getUserData();
  const [] = useState<boolean>(true);
  const [] = useState<object>({exercise: []});
  const [experienceGraphData, setExperienceGraphData] = useState<object[]>([{ epoch: 0, total_experience: 0 }]);
  const [currentExperienceGraphFormat, setCurrentExperienceGraphFormat] = useState<string>("days");
  const [experienceGraphLoading, setExperienceGraphLoading] = useState<boolean>(true);
  const [levelProgressData, setLevelProgressData] = useState<object>({});
  const [levelProgressLoading, setLevelProgressLoading] = useState<boolean>(true);
  const [sidebarStatus, setSidebarStatus] = useState<boolean>(!userInfo.sidebar);

  const queryExperienceGraph = (params: { format: string; number: number; }) => {
    const userData = getUserData();
    request
      .get(`${API_URL}student-experience`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setExperienceGraphData(response.data);
        setExperienceGraphLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryLevelProgress = () => {
    const userData = getUserData();
    request
      .get(`${API_URL}student-level`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
      })
      .then((response) => {
        setLevelProgressData(response.data);
        setLevelProgressLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleExperienceGraphChange = (e) => {
    const format = e.target.value;
    setCurrentExperienceGraphFormat(e.target.value);
    setExperienceGraphLoading(true);
    queryExperienceGraph({format: format, number: 6});
  }

  const querySaveCollapse = (params: { sidebar: boolean; }) => {
    const userData = getUserData();
    request
      .put(`${API_URL}sidebar/update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        if (response.status === "ok") {
          updateSidebarUserData(params.sidebar);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onCollapseComponentSider = (collapsed: boolean) => {
    onCollapse(collapsed); // Parent Page Collapse
    querySaveCollapse({sidebar: !collapsed});
  }

  useEffect(() => {
    // Load the Sub Section data for the sider

    if(sidebarStatus) {
      onCollapseComponentSider(true);
    }

    queryExperienceGraph({format: "days", number: 6});
    queryLevelProgress();
  }, []);

  return (
    <>
    {/* { screens.md && */}
    <Sider
      // breakpoint="md"
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
      collapsible
      defaultCollapsed={sidebarStatus}
      onCollapse={onCollapseComponentSider}
      width={300}
      collapsedWidth={5}
    >
      <Card
        loading={levelProgressLoading}
        style={{  width: 300, minHeight: 430, paddingBottom: 120 }}
        bordered={false}
        cover={
          <img
            alt="example"
            src={courseImg}
            style={{ borderBottom: "0.1px solid #80808029" }}
          />
        }
      >
        <Row wrap={false}>
          <Col flex="auto">
            { levelProgressData &&
            <>
            <Title level={4} style={{marginBottom: 0}}>
              <FormattedMessage
                id="pages.student.dashboard.level"
                defaultMessage="Level"
              />
              &nbsp;
              {levelProgressData.level}
            </Title>
            <Progress showInfo={false} className={style.customProgress} percent={levelProgressData.experience / 10} strokeColor="#03dac5" />
            <Paragraph>
              <FormattedMessage
                  id="pages.student.next.level"
                  defaultMessage="{level} need to next level"
                  values={{level: levelProgressData.need_more}}
                />
            </Paragraph>
            </>
             }
          </Col>
        </Row>
        <br/>
        <Row>
          <Col lg={24}>
            <Title level={4} style={{marginBottom: 5}}>
              <FormattedMessage
                id="pages.student.dashboard.my-progress"
                defaultMessage="My Progress"
              />
            </Title>
          </Col>
          <Col lg={24} style={{textAlign:"left"}}>
            <Radio.Group
              onChange={handleExperienceGraphChange}
              options={[
                { label: <FormattedMessage
                  id='pages.student.dashboard.my-progress.radio.days'
                  defaultMessage='Days'
                />, value: 'days' },
                { label: <FormattedMessage
                  id='pages.student.dashboard.my-progress.radio.weeks'
                  defaultMessage='Weeks'
                />, value: 'weeks' },
                { label: <FormattedMessage
                  id='pages.student.dashboard.my-progress.radio.months'
                  defaultMessage='Months'
                />, value: 'months' }]}
              value={currentExperienceGraphFormat}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
          <Col sm={24} xs={24}>
            <Typography style={{marginBottom: "10px"}}>
              <Title level={5}>
                <FormattedMessage
                  id="pages.student.dashboard.my-experience.title"
                  defaultMessage="Experience"
                />
              </Title>
            </Typography>
            <Spin spinning={experienceGraphLoading}>
              <TimelineChart2
                height={250}
                data={experienceGraphData}
              />
            </Spin>
          </Col>
        </Row>
      </Card>
    </Sider>
    {/* } */}
    </>
  );
};

export default ProgressSider;
