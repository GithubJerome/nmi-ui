import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Skeleton, Button, Card, message, Typography, Table, Avatar, Breadcrumb } from 'antd';
import { LeftOutlined, AntDesignOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
import { API_URL } from '@/utils/utils';
import { colTutorStudentProgress } from '@/utils/tableColumns';

const { Title, Paragraph } = Typography;

const CoursePage: React.FC<{}> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStudentView, setCurrentStudentView] = useState<string>();
  const [courseProgressData, setCourseProgressData] = useState<object[]>([]);
  const [] = useState<object>({
    message: "",
    type: ""
  });

  const queryStudentCourseProgress = (params: { student_id: string; limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`tutor/student-progress`, {
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
        setCourseProgressData(response.rows);

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
    const par = getPageQuery();
    const { student_id } = par as { student_id: string };
    queryStudentCourseProgress({student_id: student_id, limit: 100, page: 1})
  }, []);


  const back = () => {
    return (
      <Button href='/tutor-dashboard' type="primary" shape="round" style={{marginTop: "30px",position:"absolute"}} icon={<LeftOutlined /> }>
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
            <Breadcrumb.Item>{currentStudentView}</Breadcrumb.Item>
          </Breadcrumb>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card>
              <Row gutter={24} type="flex">
                <Col sm={2} xs={24} style={{ textAlign: "left" }} >
                  <Avatar
                    size={80}
                    icon={<AntDesignOutlined />}
                  />
                </Col>
                <Col sm={22} xs={24} style={{ textAlign: "left" }} >
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <Typography>
                        <Title level={2}>
                          <FormattedMessage
                            id= 'pages.student.progress.courses.title'
                            defaultMessage= 'Courses'
                          />
                        </Title>
                      </Typography>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <Paragraph>
                        Descriptions
                      </Paragraph>
                      <Paragraph>
                        one more line
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table rowKey="course_id"
                loading={loading}
                dataSource={courseProgressData}
                columns={colTutorStudentProgress}
                footer={back}/>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default CoursePage;
