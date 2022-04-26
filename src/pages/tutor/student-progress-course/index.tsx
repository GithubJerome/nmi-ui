import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { API_URL, getUserData, getPageQuery, convertCommaToDot } from '@/utils/utils';
import { Col, Row, Space, Button, Card, message, Typography, Collapse, Breadcrumb, Table, Avatar, Tooltip } from 'antd';
import { AntDesignOutlined, SmileOutlined, HistoryOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { colTutorCourseProgress } from '@/utils/tableColumns';
import { LeftOutlined } from '@ant-design/icons';
import style from './style.less';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const CoursePage: React.FC<{}> = () => {
  const intl = useIntl();
  const [currentStudentView, setCurrentStudentView] = useState<string>();
  const [coursesLinkBreadCrumb, setCoursesLinkBreadCrumb] = useState<string>();
  const [progressStudentCourse, setProgressStudentCourse] = useState<object>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [] = useState<object>({
    message: "",
    type: ""
  });
  const urlParam = getPageQuery();

  const tableAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: (itemData:any) => (
      <Space>
        { itemData.exercise_id && 
        <Tooltip placement="topLeft" title={<FormattedMessage
          id="pages.tutor.courses.tries.tooltip"
          defaultMessage="View All Tries"
        />}>
          <Button size="small" icon={<HistoryOutlined />} href={`/student-exercise-tries?student_id=${urlParam.student_id}&exercise_id=${itemData.exercise_id}`} />
        </Tooltip>
        }
      </Space>
    )
  };

  const tableColumn = [...colTutorCourseProgress, tableAction];

  const queryStudentProgressCourse = (params: { student_id: string; course_id: string; limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}tutor/student-course-progress`, {
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
        setProgressStudentCourse(response);
        
        const studentDetails = response.student_details;
        const studentName = `${studentDetails.first_name} ${studentDetails.middle_name} ${studentDetails.last_name}`;
        setCurrentStudentView(studentName);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const params = getPageQuery();
    const { student_id, course_id } = params as { student_id: string; course_id: string};
    queryStudentProgressCourse({student_id, course_id, limit: 100, page: 1})
    setCoursesLinkBreadCrumb(`/student-progress?student_id=${student_id}`);
  }, []);

  const backToStudentProgress = () => {
    const params = getPageQuery();
    const {student_id } = params as { student_id: string; };
    return `/student-progress?student_id=${student_id}`;
  }

  const back = () => {
    return (
      <Button href={backToStudentProgress()} type="primary" shape="round" style={{marginTop: "30px",position:"absolute"}} icon={<LeftOutlined /> }>
        <FormattedMessage
          id= 'pages.tutor.back'
          defaultMessage= 'Back'
        />
      </Button>
    )
}

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <br/>
        <Breadcrumb separator=">">
          <Breadcrumb.Item href="/tutor-dashboard">
            <FormattedMessage
              id='pages.dashboard'
              defaultMessage="Dashboard"
            />
          </Breadcrumb.Item>
          <Breadcrumb.Item href={coursesLinkBreadCrumb}>
            <FormattedMessage
              id='pages.courses'
              defaultMessage="courses"
            />
          </Breadcrumb.Item>
          <Breadcrumb.Item>{currentStudentView}</Breadcrumb.Item>
        </Breadcrumb>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                progressStudentCourse.course &&
                <Row gutter={24} type="flex">
                  <Col sm={2} xs={24} style={{ textAlign: "left" }} >
                    <Avatar
                      size={80}
                      icon={<AntDesignOutlined />}
                    />
                  </Col>
                  <Col sm={9} xs={24} style={{ textAlign: "left" }} >
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
                  </Col>
                  <Col sm={8} xs={24} style={{ textAlign: "left" }} >
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <div style={{height: 40}} />
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <div className="ant-progress ant-progress-line ant-progress-status-normal ant-progress-show-info ant-progress-default">
                          <div className="ant-progress-outer">
                            <div className="ant-progress-inner">
                              <div className="ant-progress-bg" style={{"width": convertCommaToDot(progressStudentCourse.course.progress)+"px", height: "20px"}} />
                            </div>
                          </div>
                          <span className="ant-progress-text" title={progressStudentCourse.course.progress}>{progressStudentCourse.course.progress}%</span>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  { /* <Col sm={5} xs={24} style={{ textAlign: "left" }} >
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <div style={{height: 40}} />
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={12} xs={24} style={{ textAlign: "left" }} >
                        <Typography>
                          <Title level={2}>
                            EASY
                          </Title>
                        </Typography>
                      </Col>
                      <Col sm={12} xs={24} style={{ textAlign: "left" }} >
                        <SmileOutlined  style={{fontSize: "50px"}} />
                      </Col>
                    </Row>
              </Col> */}
                </Row>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table
                loading={loading}
                columns={tableColumn}
                dataSource={progressStudentCourse.rows}
                footer={back}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default CoursePage;
