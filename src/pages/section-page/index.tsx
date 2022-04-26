import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Layout, Button, Card, message, Grid } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { size } from 'lodash';
import classNames from 'classnames';
import style from './style.less';
import { API_URL } from '@/utils/utils';
import CourseSider from '@/components/student/CourseSider';
import ExercisesPanel from '@/components/student/ExercisesPanel';

const { useBreakpoint } = Grid; 
const { Content } = Layout;

const CoursePage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [currentSection, setActiveSection] = useState<number>(1);
  const [courseSectionsData, setCourseSectionsData] = useState<object>({});
  const [courseDataLoading, setCourseDataLoading] = useState<boolean>(true);
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });

  const queryCourseSections = (params: { course_id: string; section_id: string; }) => {
    const { REACT_APP_API_URL } = process.env;
    const userData = getUserData();

    request
      .get(`${API_URL}student/course/section`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryCourseSets response.data == ", response.data);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setCourseSectionsData(response.data[0]);
        setCourseDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getCouseSections = () => {
    const params = getPageQuery();
    const { course_id, section_id } = params as { redirect: string };
    queryCourseSections({course_id, section_id});
  }

  useEffect(() => {
    getCouseSections();
  }, []);

  const onCollapseSider = (collapsed: boolean) => {
    setSiderCollapse(collapsed);
  }
  
  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });
  
  return (
    <Layout hasSider className={layoutClassesCondition}>
      <CourseSider
        onCollapse={onCollapseSider}
        courseData={courseSectionsData}
        type="section"
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.contentContainer}>
          <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />}>
            <FormattedMessage
              id= 'pages.student.section.back'
              defaultMessage= 'BACK'
            />
          </Button>

          <Card bordered={false} loading={courseDataLoading}>
          <Row>
              <Col lg={16} style={{width: "100%"}}>
              { courseSectionsData && courseSectionsData.subsection && 
                <ExercisesPanel
                  dataSource={courseSectionsData.subsection}
                  sectionIsUnlocked={courseSectionsData.is_unlocked}
                />
              } 
              </Col>
          </Row>
          { /* <Row>
              <Col lg={16}>
                <Collapse 
                  className={style.timelineCollapse} 
                  defaultActiveKey={['1']}
                  ghost 
                  expandIcon={(props) => customExpandIcon(props)}
                >
                  { courseSectionsData && courseSectionsData.subsection && courseSectionsData.subsection.map((subsections, index) => { return(
                    <Panel 
                      className={(subsections.progress) ? 'ongoing-section': ''}
                      header={<Title level={4}>{subsections.subsection_name}</Title>}
                      key={index+1}
                      extra={<a href={sendToSubSections(courseSectionsData.section_id, subsections.subsection_id)}><Button type="primary" shape="round" icon={<CaretRightOutlined />} style={{ float: "right" }}>
                      <FormattedMessage
                        id= 'pages.student.section.main.details.panel'
                        defaultMessage= 'Details'
                      />
                    </Button></a>}
                    >
                      <List
                        itemLayout="horizontal"
                        dataSource={subsections.exercises}
                        renderItem={exercise => (
                          <>
                            {
                              exercise.instructions && exercise.instructions.length > 0 &&
                              <List.Item>
                                <List.Item.Meta
                                  title={<Title level={5}>
                                    <FormattedMessage
                                      id= 'pages.student.section.main.inst.text'
                                      defaultMessage= 'Instructions'
                                    />
                                  </Title>}
                                  description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                />
                                <table style={{ width: "150px" }}>
                                  <tr>
                                    <td>
                                      <a href={sendToExerciseInstruction(exercise.exercise_id)}>
                                        <Button type="primary" shape="round" size={size} style={{ float: "right" }} icon={<CaretRightOutlined />}>
                                          <FormattedMessage
                                            id= 'pages.student.section.main.start.button'
                                            defaultMessage= 'Start'
                                          />
                                        </Button>
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </List.Item>
                            }
                            <List.Item className={(exercise.progress) ? 'ongoing-exercise': ''}>
                              <List.Item.Meta
                                title={<Title level={5}><FormattedMessage
                                  id= 'pages.student.section.main.exp'
                                  defaultMessage= 'Start'
                                /> {exercise.exercise_number}</Title>}
                                description={exercise.description}
                              />
                              <table style={{ width: "150px" }}>
                                <tr>
                                  <td>
                                    <a href={sendToExerciseOverview(exercise.exercise_id)}>
                                      <Button type="primary" shape="round" size={size} style={{ float: "right" }} icon={<CaretRightOutlined />}>
                                        <FormattedMessage
                                          id= 'pages.student.section.main.start.button'
                                          defaultMessage= 'Start'
                                        />
                                      </Button>
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </List.Item>
                          </>
                        )}
                      />
                  </Panel>
                  )})}
                </Collapse>
              </Col>
                          </Row> */ }
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CoursePage;
