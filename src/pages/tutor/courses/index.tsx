import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Button, Card, message, Progress, Typography, Collapse, List, Table, Avatar, Upload, Alert } from 'antd';
import { LeftOutlined, CaretRightOutlined, AntDesignOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
import { epochToJsDate, API_URL } from '@/utils/utils';
import { colTutorCourse } from '@/utils/tableColumns';

const { Title, Paragraph } = Typography;
const TutorCoursesPage: React.FC<{}> = () => {
  const [tutorCouseData, setTutorCourseData] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [templateUrl, setTemplateUrl] = useState<string>("");
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();
  // const [exerciseSummary, setExerciseSummary] = useState<Object>({});

  const queryTutorCourse = (params: { limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`tutor/course`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryTutorCourse response.data == ", response.rows);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setTutorCourseData(response.rows);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryTempUrl = (params: { type: string; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`download/course-template`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryTempUrl response.data == ", response.location);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
          return;
        }
        setTemplateUrl(response.location);
        setLoading(false);

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

  useEffect(() => {
    queryTutorCourse({limit: 100, page: 1});
  }, []);

  const getHeaders = () => {
    const userData = getUserData();
    return {
      token: userData.token,
      userid: userData.id
    };
  }

  const uploadProps = {
    name: 'upfile',
    action: API_URL+`upload/course-template`,
    headers: getHeaders(),
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if(info.file.response.status.toLowerCase() === "failed"){
          message.error(`${info.file.response.alert}`);
        } else {
          message.success(`${info.file.response.message}`);
        }
        queryTutorCourse({limit: 100, page: 1});
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        queryTutorCourse({limit: 100, page: 1});
      }
    },
  };


  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          {
            alrt.message !== "" && alrt.type !== "" &&
              <Alert message={alrt.message} type={alrt.type} />
          }
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
                            id="pages.tutor.courses.title"
                            defaultMessage="Courses"
                          />
                        </Title>
                      </Typography>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={20} xs={24} style={{ textAlign: "left" }} >
                      <Paragraph>
                        Descriptions
                      </Paragraph>
                      <Paragraph>
                        one more line
                      </Paragraph>
                    </Col>
                    <Col sm={4} xs={24} style={{ textAlign: "left" }} >
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} type="primary" 
                          title={intl.formatMessage({
                            id: 'pages.tutor.courses.upload.tooltip',
                            defaultMessage: 'Upload course template',
                          })}
                        >
                          &nbsp;
                          <FormattedMessage
                            id="pages.tutor.courses.upload"
                            defaultMessage="Upload"
                          />
                        </Button>
                      </Upload>
                      <br/>
                      <Button onClick={()=>queryTempUrl({type:"csv"})} loading={loading} 
                        title={intl.formatMessage({
                          id: 'pages.tutor.courses.download.tooltip',
                          defaultMessage: 'Download course template',
                        })} type="primary" icon={<DownloadOutlined />}
                      >
                        &nbsp;
                        <FormattedMessage
                          id="pages.tutor.courses.download"
                          defaultMessage="Download"
                        />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table key={"courseProgresstables"} dataSource={tutorCouseData} columns={colTutorCourse}/>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default TutorCoursesPage;
