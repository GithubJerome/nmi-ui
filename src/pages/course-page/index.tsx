import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Layout, Col, Row, Steps, Button, Card, Grid, message, Progress, Typography, Collapse, List } from 'antd';
import { LeftOutlined, CaretRightOutlined, UpCircleFilled, DownCircleFilled } from '@ant-design/icons';
import { size } from 'lodash';
import classNames from 'classnames';
import style from './style.less';
import { epochToJsDate, API_URL } from '@/utils/utils';
import CourseSider from '@/components/student/CourseSider';
import ExercisesPanel from '@/components/student/ExercisesPanel';
//import tempoData from './temporarydata';

const { useBreakpoint } = Grid;
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;
const { Step } = Steps;
const { Panel } = Collapse;

const CoursePage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [currentSection, setActiveSection] = useState<number>(0);
  /* const [sample, setSample] = useState<Object>({
    0: 3,
    1: 2
  }); */
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [courseSetsData, setCourseSetsData] = useState<object>({});
  const [courseDataLoading, setCourseDataLoading] = useState<boolean>(true);

  const queryCourseSets = (params: { course_id: string; }) => {
    const userData = getUserData();

    /** Load Data locally */
    // setCourseSetsData(tempoData.data);
    // setCourseDataLoading(false);
    
    request
      .get(`${API_URL}student/course/set`, {
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
        setCourseSetsData(response.data);
        setCourseDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    
  }

  const getCouseSets = () => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };
    queryCourseSets({course_id});
  }

  const sendToSections = (section_id: string) => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };
    // history.replace(redirect);
    return `/section?section_id=${section_id}&course_id=${course_id}`;
  }

  useEffect(() => {
    getCouseSets();
  }, []);

  const onCollapseSider = (collapsed: boolean) => {
    setSiderCollapse(collapsed);
  }

  const genExtraSection = (section_id: string) => (
    <Button 
    href={sendToSections(section_id)} 
    onClick={event => {event.stopPropagation()}}
    className={style.btnDetails}
    style={{marginRight: 15}}
    type="primary" 
    shape="round">
      <FormattedMessage
        id= 'pages.student.course.main.overview.button'
        defaultMessage= 'Overview'
      />
    </Button>
  );

  const customExpandIcon = (props: {isActive: boolean}) => {
    const arrowColor = "#c8c8c8";
    if (props.isActive) {
        return <UpCircleFilled style={{fontSize: 29, color: arrowColor}}/>
    } 
    return <DownCircleFilled style={{fontSize: 29, color: arrowColor}}/>
  }

  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });

  return (
    <Layout hasSider className={layoutClassesCondition}>
      <CourseSider
        onCollapse={onCollapseSider}
        courseData={courseSetsData}
        type="course"
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.contentContainer}>
          <Button className={style.customBtn} href='/dashboard' icon={<LeftOutlined />}>
            <FormattedMessage
              id='pages.back'
              defaultMessage='BACK'
            />
          </Button>

          <Card bordered={false} loading={courseDataLoading}>
          <Row>
            <Col lg={16} style={{width: "100%"}}>
              { courseSetsData && courseSetsData.sections && 
                <Steps 
                direction="vertical" className={style.stepDataList}>
                   { courseSetsData.sections.map((section:any, index:number) => { 
                    return(
                    <Step 
                    // eslint-disable-next-line no-nested-ternary
                    status={(section.progress) ? (section.progress === "100") ? "finish" : "process" : "wait"}
                    icon={<UpCircleFilled style={{fontSize: 1, color: "#fff"}} />}
                    description={
                      <>

                      { (section.progress !== "100") &&
                      <Progress type="circle" percent={(section.progress) ? section.progress : 0} showInfo={false} width={37} />
                      }

                      <Collapse 
                        ghost 
                        defaultActiveKey={[currentSection]}
                        expandIcon={(props) => customExpandIcon(props, index)}
                      >
                        <Panel
                        key={index}
                        header={<Title level={4} style={{display:'inline-block'}}>{section.section_name}</Title>}
                        extra={genExtraSection(section.section_id)}>
                          { /** Sub Section Steps */ }
                          <ExercisesPanel 
                            dataSource={section.subsection}
                            hideDescription={!screens.md}
                            sectionIsUnlocked={section.is_unlocked}
                            ghost
                          />
                        </Panel>
                      </Collapse>
                      </>
                    }
                    />
                    )
                  })}
                </Steps>
              }
            </Col>
          </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CoursePage;