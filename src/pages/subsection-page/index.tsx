import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Grid, Layout, Col, Row, Steps, Button, Card, Timeline, message, Progress, Typography, Collapse } from 'antd';
import { LeftOutlined, PlayCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import style from './style.less';
import { API_URL } from '@/utils/utils';
import CourseSider from '@/components/student/CourseSider';
import ExerciseButton from '@/components/student/ExerciseButton';

const { useBreakpoint } = Grid;
const { Title, Paragraph, Text, Link } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { Content } = Layout;

const SubSectionPage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [courseSubSectionsData, setCourseSubSectionsData] = useState<object>({
    exercise: []
  });
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [currentExerciseProgress, setCurrentExerciseProgress] = useState<number>(0);
  const [limit, setLimit] = useState<number>(100);
  const [page, setPage] = useState<number>(1);
  const [courseDataLoading, setCourseDataLoading] = useState<boolean>(true);
  const [currAnswer, setCurrAnswer] = useState<string>("");
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  // const [exerciseSummary, setExerciseSummary] = useState<Object>({});

  const queryCourseSubSections = (params: { course_id: string; section_id: string; subsection_id: string; }) => {
    const userData = getUserData();

    request
      .get(`${API_URL}student/course/subsection`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        // console.log("queryCourseSets response.data == ", response.data[0]);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }

        const responseData = response.data[0];
        setCourseSubSectionsData(responseData);
        // courseExerciseData.exercises[0].questions.filter(q => q.answered === false)
        // setCurrentExercise(responseData.exercise.filter(q => q.answered_all === true).length);

        /**
        let totalFinishedExercise = 0;
        responseData.exercise.map((exercise:any) => {
          if(exercise.answered_all) {
            totalFinishedExercise +=1;

            if(exercise.instructions) {
              totalFinishedExercise += 1;
            }
          }

          if(!exercise.answered_all && exercise.started_on) {
            if(!currentExerciseProgress) {
              console.log(parseInt(exercise.percent_score, 10));
              setCurrentExerciseProgress(parseInt(exercise.percent_score, 10));
            }
          }
        });
        setCurrentExercise(totalFinishedExercise);
         */
        setCourseDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getCourseSubSections = () => {
    const params = getPageQuery();
    const { course_id, section_id, subsection_id } = params as { course_id: string; section_id: string; subsection_id: string; };
    queryCourseSubSections({course_id, section_id, subsection_id});
  }

  useEffect(() => {
    getCourseSubSections();
  }, []);

  const onCollapseSider = (collapsed:boolean) => {
    setSiderCollapse(collapsed);
  }

  // Type 1 = Exercise; 2 = Instruction
  const getStatus = (exercise:any, type: number) => {
    if(type === 1 && exercise.started_on && !exercise.answered_all) {
      return "process";
    }

    if(type === 1 && exercise.started_on && exercise.answered_all) {
      return "finish";
    }

    if(type === 2 && exercise.started_on) {
      return "finish";
    }
    
    return "current";
  }

  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });
  
  return (
    <Layout hasSider className={layoutClassesCondition}>
      <CourseSider
        onCollapse={onCollapseSider}
        courseData={courseSubSectionsData}
        type="sub-section"
      /> 
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.contentContainer}>
          <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />}>
            <FormattedMessage
              id="pages.student.subsection.back"
              defaultMessage="BACK"
            />
          </Button>

          <Card bordered={false} loading={courseDataLoading}> 
            <Row>
              <Col lg={16} style={{width: "100%"}}>
              <Steps direction="vertical" className={style.stepDataList}>
                { courseSubSectionsData.exercise.map((exercise:any) => (
                <React.Fragment key={exercise.exercise_id}>
                { exercise.instructions && exercise.instructions.length > 0 &&
                <Step 
                status={getStatus(exercise, 2)}
                description={
                  <Card>
                    <div>
                      <Title level={4}>
                        <FormattedMessage
                        id= 'pages.student.subsection.main.inst.text'
                        defaultMessage= 'Instructions'
                      />
                      </Title>
                      <Paragraph className={style.exerciseDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Paragraph>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <ExerciseButton 
                        isInstruction
                        exerciseId={exercise.exercise_id}
                        isUnlocked={exercise.is_unlocked}
                        requirements={exercise.requirements}
                        score={exercise.percent_score}
                        startedOn={exercise.started_on}
                        isPassed={exercise.is_passed}
                        subSectionIsUnlocked={courseSubSectionsData.is_unlocked}
                        sectionIsUnlocked={courseSubSectionsData.is_section_unlocked}
                      />
                    </div>
                  </Card>
                } />
                } 

                <Step 
                  status={getStatus(exercise, 1)}
                  description={
                    <>
                    { getStatus(exercise, 1) !== "finish" &&
                    <Progress type="circle" percent={(exercise.progress) ? exercise.progress : 0} showInfo={false} width={38} />
                    }

                    <Card>
                      <div style={{marginRight: 'auto'}}>
                        <Title level={4}>{exercise.exercise_num}</Title>
                        <Paragraph className={style.exerciseDescription}>{exercise.description}</Paragraph>
                      </div>
                      <div style={{textAlign: 'right', paddingLeft: 15}}> 
                        <ExerciseButton 
                          answeredAll={exercise.answered_all}
                          exerciseId={exercise.exercise_id}
                          score={exercise.percent_score}
                          startedOn={exercise.started_on}
                          isPassed={exercise.is_passed}
                          isRepeatable={exercise.is_repeatable}
                          isUnlocked={exercise.is_unlocked}
                          requirements={exercise.requirements}
                          subSectionIsUnlocked={courseSubSectionsData.is_unlocked}
                          sectionIsUnlocked={courseSubSectionsData.is_section_unlocked}
                        />
                      </div>
                    </Card>
                    </>
                  }
                />
                </React.Fragment>
                )) }
              </Steps>
              </Col>
            </Row>
          </Card>
          { /*
          <Card bordered={false} loading={courseDataLoading}> 
            <Row>
              <Col lg={16}>
                <Timeline className={style.timelineCourseSection}>
                { courseSubSectionsData.exercise.map((exercise:any, i:number) => (
                  <React.Fragment key={exercise.exercise_id}>

                    { exercise.instructions && exercise.instructions.length > 0 &&
                    <Timeline.Item>
                      <Card>
                        <div>
                          <Title level={4}>
                            <FormattedMessage
                            id= 'pages.student.subsection.main.inst.text'
                            defaultMessage= 'Instructions'
                          />
                          </Title>
                          <p style={{marginBottom: "0px"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <ExerciseButton 
                            exerciseId={exercise.exercise_id}
                            isInstruction
                          />
                        </div>
                      </Card>
                    </Timeline.Item>
                    }
                    <Timeline.Item color={(courseSubSectionsData.exercise.answered_all) ? 'green' : 'blue'} className={(courseSubSectionsData.exercise.length == i+1) ? 'ant-timeline-item-last' : ''}>
                      <Card>
                          <div style={{marginRight: 'auto'}}>
                            <Title level={4}>
                              <FormattedMessage
                              id= 'pages.student.subsection.main.exp'
                              defaultMessage= 'Exercise'
                            /> {exercise.exercise_number}
                            </Title>
                            <p style={{marginBottom: "0px"}}>{exercise.description}</p>
                          </div>
                          <div style={{textAlign: 'right', paddingLeft: 15}}> 
                            <ExerciseButton 
                              answeredAll={exercise.answered_all}
                              exerciseId={exercise.exercise_id}
                              score={exercise.percent_score}
                              startedOn={exercise.started_on}
                              isPassed={exercise.is_passed}
                              isLocked={false}
                            />
                          </div>
                      </Card>
                    </Timeline.Item>
                  </React.Fragment>
                ))}
                </Timeline>
              </Col>
            </Row>
          </Card> */ }
        </div>
      </Content>
    </Layout>
  );
};

export default SubSectionPage;