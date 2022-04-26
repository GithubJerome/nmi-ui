import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { API_URL, getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Card, message, Typography, Breadcrumb, Table, Avatar, Button } from 'antd';
import { AntDesignOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { colTutorExerciseTries } from '@/utils/tableColumns';
import { LeftOutlined } from '@ant-design/icons';
import { size } from 'lodash';
import style from './style.less';

const { Title, Paragraph, Link } = Typography;

const ExerciseTriesPage: React.FC<{}> = () => {
  const [currentStudentView, setCurrentStudentView] = useState<string>();
  const [currentStudentId, setCurrentStudentId] = useState<string>();
  const [subSectionData, setSubSectionData] = useState<object>({});
  const [exerciseTriesData, setExerciseTriesData] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCourseID, setCourseID] = useState<string>();
  const [] = useState<object>({
    message: "",
    type: ""
  });

  const queryStudentProgressCourse = (params: { student_id: string; exercise_id: string; limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}tutor/student/exercise`, {
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
        setExerciseTriesData(response.data);
        setSubSectionData(response.subsection);
        const studentDetails = response.student_details;
        const studentName = `${studentDetails.first_name} ${studentDetails.middle_name} ${studentDetails.last_name}`;
        const courseID = response.data[0].course_id;
        setCurrentStudentView(studentName);
        setCourseID(courseID);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const params = getPageQuery();
    const { student_id, exercise_id } = params as { student_id: string; exercise_id: string};
    queryStudentProgressCourse({student_id, exercise_id, limit: 100, page: 1})
    setCurrentStudentId(student_id);
  }, []);


  const backToStudentProgress = () => {
    const params = getPageQuery();
    const {student_id } = params as { student_id: string; };
    return `/student-progress-course?student_id=${student_id}&course_id=${currentCourseID}`;
  }

  const back = () => {
      return (
        <Button href={backToStudentProgress()} type="primary" shape="round" className='backStudentExercise' style={{marginTop: "30px",position:"absolute"}} icon={<LeftOutlined /> }>
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
          <Breadcrumb.Item href={`/student-progress?student_id=${currentStudentId}`}>
            <FormattedMessage
              id='pages.courses'
              defaultMessage="courses"
            />
          </Breadcrumb.Item>
          { subSectionData && 
          <Breadcrumb.Item href={`/student-progress-course?student_id=${currentStudentId}&course_id=${subSectionData.course_id}`}>{subSectionData.course_title}</Breadcrumb.Item>
          }
          <Breadcrumb.Item>{currentStudentView}</Breadcrumb.Item>
          
        </Breadcrumb>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                subSectionData.subsection_id &&
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
                            {subSectionData.subsection_name}
                          </Title>
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          {subSectionData.description}
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
                              <div className="ant-progress-bg" style={{"width": subSectionData.progress+"px", height: "20px"}} />
                            </div>
                          </div>
                          <span className="ant-progress-text" title={subSectionData.progress}>{subSectionData.progress}%</span>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            </Card>
          </Col>

          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table
                loading={loading}
                key="student_exercise_id"
                columns={colTutorExerciseTries}
                dataSource={exerciseTriesData}
                footer={back}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default ExerciseTriesPage;
