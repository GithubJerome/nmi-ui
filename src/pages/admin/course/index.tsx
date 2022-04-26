import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Button, Card, message, Progress, Typography, Collapse, List, Table, Avatar, Upload } from 'antd';
import { LeftOutlined, CaretRightOutlined, AntDesignOutlined, SmileOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
import courseImg from '@/assets/course.png';
import { epochToJsDate, API_URL } from '@/utils/utils';
import Divider from 'antd/lib/divider';
import { colCourseDetailsTutor } from '@/utils/tableColumns';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const TutorCoursePage: React.FC<{}> = () => {
  const [tutorCourse, setTutorCourse] = useState<object>({});
  const [tutorCourseDetails, setTutorCourseDetails] = useState<object>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();

  const queryTutorCourseDetails = (params: { course_id: string; limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`manager/course/set`, {
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

        setTutorCourse(response.data);
        setTutorCourseDetails(response.children[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryCourseDets = () =>{
    const params = getPageQuery();
    const { course_id } = params as { redirect: string };
    queryTutorCourseDetails({course_id, limit: 100, page: 1})
  }

  useEffect(() => {
    queryCourseDets();
  }, []);

  const downloadCourseUpdate = () => {
    const userData = getUserData();
    setLoading(true);
    const par = getPageQuery();
    const { course_id } = par as { redirect: string };

    request
      .get(API_URL+`download/course-update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          course_id
        }
      })
      .then((response) => {
        setLoading(false);

        if (response.status === "Failed") {
          message.error(response.alert);
          // let redirect = "/user/login";
          // history.replace(redirect);
          return;
        }

        const link = document.createElement('a');
        link.href = API_URL+response.location;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getHeaders = () => {
    const userData = getUserData();
    return {
      token: userData.token,
      userid: userData.id
    };
  }

  const uploadProps = {
    name: 'upfile',
    action: API_URL+`upload/course-update`,
    headers: getHeaders(),
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if(info.file.response.status.toLowerCase() === "failed"){
          message.error(`${info.file.response.alert}`);
        } else {
          message.success(`${info.file.response.message}`, 4);
          history.replace(`/admin/courses`);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        queryCourseDets();
      }
    },
  };

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.course.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                tutorCourseDetails &&
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
                          { tutorCourse && 
                          <Title level={3}>
                            {tutorCourse.course_title}
                          </Title>
                          }
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={20} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          {tutorCourseDetails.description}
                        </Paragraph>
                      </Col>
                      <Col sm={4} xs={24} style={{ textAlign: "left" }} >
                        <Upload {...uploadProps}>
                          <Button icon={<UploadOutlined />} type="primary" 
                            title={intl.formatMessage({
                              id: 'pages.tutor.course.upload.tooltip',
                              defaultMessage: 'Update course',
                            })}
                          >
                            &nbsp;
                            <FormattedMessage
                              id="pages.tutor.course.upload"
                              defaultMessage="Upload"
                            />
                          </Button>
                        </Upload>
                        <br/>
                        <Button onClick={()=>downloadCourseUpdate()} loading={loading} type="primary" icon={<DownloadOutlined />}
                          title={intl.formatMessage({
                            id: 'pages.tutor.course.download.tooltip',
                            defaultMessage: 'Download course',
                          })}
                        >
                          &nbsp;
                          <FormattedMessage
                            id="pages.tutor.course.download"
                            defaultMessage="Download"
                          />
                        </Button>
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
                columns={colCourseDetailsTutor}
                dataSource={tutorCourseDetails.children}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default TutorCoursePage;
