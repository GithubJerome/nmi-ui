import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { convertCommaToDot, getUserData, getPageQuery, API_URL } from '@/utils/utils';
import { Col, Row, Button, Card, message, Typography, Table, Avatar, Tooltip, Layout, Grid, Slider, Progress } from 'antd';
import { LeftOutlined, AntDesignOutlined } from '@ant-design/icons';
import { size } from 'lodash';
import { colCourseProgress2 } from '@/utils/tableColumns';
import ProgressSider from '@/components/student/ProgressSider';
import { isMobile } from "react-device-detect";
import style from './style.less';

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const CoursePage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [progressStudentCourse, setProgressStudentCourse] = useState<object>({});
  const [studentProgressText, setStudentProgressText] = useState<string>("0");
  const [studentProgress, setStudentProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [] = useState<object>({
    message: "",
    type: ""
  });

  const queryProgressStudentCourse = (params: { course_id: string; limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}progress/student/course`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        
        if(response.course.progress) {
          setStudentProgressText(response.course.progress);
          setStudentProgress(convertCommaToDot(response.course.progress));
        }

        setProgressStudentCourse(response);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }


  const onCollapseSider = (collapsed:boolean) => {
    setSiderCollapse(collapsed);
  }

  useEffect(() => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };
    queryProgressStudentCourse({course_id, limit: 100, page: 1})
  }, []);

  const progressFormatter = (value:any) => {
    return `${value}%`;
  }

  return (
    <Layout hasSider className={style.layoutWithSider}>
      <ProgressSider 
        onCollapse={onCollapseSider} 
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div style={{padding: "15px 15px"}}>
          <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
            &nbsp;
            <FormattedMessage
              id= 'pages.student.exercise-overview.back'
              defaultMessage= 'BACK'
            />
          </Button>
        </div>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                progressStudentCourse.course &&
                <>
                  <Row wrap={false}>
                    {(screens.sm) &&
                    <Col flex="100px">
                      <Avatar
                        size={80}
                        icon={<AntDesignOutlined />}
                      />
                    </Col>
                    }
                    <Col flex="auto">
                      <Row gutter={24} type="flex">
                        <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                          <Typography>
                            <Title level={2}>
                              {progressStudentCourse.course.course_title}
                            </Title>
                          </Typography>
                        </Col>
                      </Row>
                      <Row gutter={24} type="flex">
                        <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                          <Paragraph>
                            {progressStudentCourse.course.description}
                          </Paragraph>
                        </Col>
                      </Row>
                      <Row gutter={24} type="flex">
                        <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                          <Paragraph>
                            <FormattedMessage
                              id= 'pages.student.progress-course.desc'
                              defaultMessage= 'Click on an item to expand it'
                            />
                          </Paragraph>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <div className={style.customSliderBar}>
                        <Tooltip trigger={(isMobile) ? "click": "hover"} color="#03dac5" title={<>{`${studentProgressText}%`}</>}>
                          <div className={style.customerSliderBarDot} style={{ 
                            left: `${studentProgress}%`, 
                            marginLeft: (studentProgress === 0) ? "7px": (studentProgress === 100) ? "-6px" : "0px" 
                          }}/>
                        </Tooltip>
                         <Progress percent={studentProgress} showInfo={false} />
                      </div>
                    </Col>
                  </Row>
                </>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table
                scroll={{ x: (!screens.xl) ? 1000 : true}}
                columns={colCourseProgress2}
                dataSource={progressStudentCourse.rows}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default CoursePage;
