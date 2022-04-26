import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Button, Card, message, Image, Typography, Collapse, List, Table, Avatar, Carousel, Modal, Form, Input, Checkbox, Radio } from 'antd';
import { LeftOutlined, CaretRightOutlined, AntDesignOutlined, SmileOutlined, PlusOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
import { epochToJsDate, API_URL } from '@/utils/utils';
import Divider from 'antd/lib/divider';
import { colCourseDetailsTutor } from '@/utils/tableColumns';
import { FormInstance } from 'antd/lib/form';
import TextArea from 'antd/lib/input/TextArea';
import ReactPlayer from 'react-player'

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const TutorSectionPage: React.FC<{}> = () => {
  const [tutorSection, setTutorSection] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleAddInstModal, setVisibleAddInstModal] = useState<boolean>(false);
  const [imageList, setImageList] = useState<object[]>([]);
  const [radioValue, setRadioValue] = useState<string>("video");

  const formRef = React.createRef<FormInstance>();

  const queryTutorSection = () => {
    const params = getPageQuery();
    const { course_id, section_id } = params as { redirect: string };
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`manager/course/section`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          course_id: course_id,
          section_id: section_id
        }
      })
      .then((response) => {
        console.log("queryTutorSection response.data == ", response.children);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setTutorSection(response.children);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryTutorSection();
  }, []);


  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.section.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                tutorSection &&
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
                          <Title level={3}>
                            {tutorSection.name}
                          </Title>
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          {tutorSection.description}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            {console.log("turor-section === ", tutorSection)}
            
            <Card bordered={false} loading={loading}>
              <Table
                columns={colCourseDetailsTutor}
                dataSource={tutorSection.children}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default TutorSectionPage;
