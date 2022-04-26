import { FormattedMessage, history } from 'umi';
import { Card, Typography, Layout, PageHeader, Tooltip, message, List, Divider, Timeline, Grid } from 'antd';
import { TrophyFilled, LockFilled, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { isMobile } from "react-device-detect";
import classNames from 'classnames';
import request from 'umi-request';
import { updateSidebarUserData, getUserData, getPageQuery, API_URL } from '@/utils/utils';
import style from './index.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph, Link } = Typography;
const { Sider } = Layout;

interface ExerciseSiderProps {
  currentExercise: any;
  onCollapse: any;
  isInstruction?: boolean;
}

const ExerciseSider: React.FC<ExerciseSiderProps> = (props) => {
  const { onCollapse, currentExercise, isInstruction } = props;
  const screens = useBreakpoint();
  const userInfo = getUserData();
  const [siderLoading, setSiderLoading] = useState<boolean>(true);
  const [courseSubSectionsData, setCourseSubSectionsData] = useState<object>({exercise: []});
  const [sidebarStatus, setSidebarStatus] = useState<boolean>(!userInfo.sidebar);

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
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setCourseSubSectionsData(response.data[0]);
        setSiderLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const sendToExerciseInstruction = (exercise_id: string) => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };
    return `/exercise-instructions?exercise_id=${exercise_id}&course_id=${course_id}`;
  }

  const sendToExerciseOverview = (exercise_id: string) => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };
    return `/exercise-overview?exercise_id=${exercise_id}&course_id=${course_id}`;
  }

  const querySaveCollapse = (params: { sidebar: boolean; }) => {
    const userData = getUserData();
    request
      .put(`${API_URL}sidebar/update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        if (response.status === "ok") {
          updateSidebarUserData(params.sidebar);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  const onCollapseComponentSider = (collapsed: boolean) => {
    onCollapse(collapsed); // Parent Page Collapse
    querySaveCollapse({sidebar: !collapsed});
  }

  useEffect(() => {
    if(sidebarStatus) {
      onCollapseComponentSider(true);
    }
  }, []);

  useEffect(() => {
    // Load the Sub Section data for the sider
    if(currentExercise.course_id) {
      const {course_id, section_id, subsection_id } = currentExercise;
      queryCourseSubSections({course_id, section_id, subsection_id})
    }
  }, [currentExercise]);

  return (
    <>
    {/* Desktop Sider */}
    <Sider
      className={style.siderBox}
      // breakpoint="sm"
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
      defaultCollapsed={sidebarStatus}
      collapsible
      onCollapse={onCollapseComponentSider}
      width={300}
      collapsedWidth={5}
    >
      <Card
        loading={siderLoading}
        bordered={false}
        style={{marginTop: "40px", width: 300, minHeight: 430, paddingBottom: 120}}
      >
        { 
          currentExercise.course_id && 
          <PageHeader
            title={
              <>
                { (typeof isInstruction != "undefined" && isInstruction) && 
                  <Title level={4}> 
                  <FormattedMessage
                    id="pages.student.exercise.main.instructions"
                    defaultMessage="Instructions "
                  />
                  </Title>
                }
                { (currentExercise.exercise_number && !isInstruction) && 
                  <Title level={4}>{currentExercise.exercise_num}</Title>
                }
              </>
            }
            className={style.exerciseSiderTitle}
            avatar={{ icon: <TrophyFilled />}} />
        }
        <Typography>
          { currentExercise.course_id &&
            <Title level={5} style={{marginBottom: "0px"}}>
              <Link className={style.textLink} 
                href={`/section?section_id=${currentExercise.section_id}&course_id=${currentExercise.course_id}`}
              >{currentExercise.section_name}</Link>
            </Title>
          }
          { currentExercise.course_id &&
            <Paragraph style={{ marginTop: "0px", marginBottom: "0px"}}>
              <Link className={style.textLink} 
                href={`/subsection?section_id=${currentExercise.section_id}&course_id=${currentExercise.course_id}&subsection_id=${currentExercise.subsection_id}`}
              >{currentExercise.subsection_name}</Link>
            </Paragraph>
          }
        </Typography>
        <Divider style={{margin: "10px 0px 20px"}} />
        <Timeline className={style.exerciseTimeline}>
          { courseSubSectionsData.exercise.map((exercise: any) => (
            <React.Fragment key={exercise.exercise_id}>
              { exercise.instructions && exercise.instructions.length > 0 &&
                <>
                { exercise.is_unlocked &&
                <Timeline.Item color="#000" 
                className={classNames({
                  'current-exercise': (currentExercise.exercise_id === exercise.exercise_id && isInstruction),
                  [style.exerciseFinish]: (exercise.started_on),
                })}>
                  <Link href={sendToExerciseInstruction(exercise.exercise_id)}>
                    <FormattedMessage
                      id= 'pages.student.subsection.main.inst.text'
                      defaultMessage= 'Instructions'
                    />
                  </Link>
                </Timeline.Item>
                }

                { !exercise.is_unlocked && 
                <Timeline.Item  
                  color="#000">
                    <FormattedMessage
                      id= 'pages.student.subsection.main.inst.text'
                      defaultMessage= 'Instructions'
                    />
                    <Tooltip overlayClassName={style.unlockedBoxRequirements} trigger={(isMobile) ? "click": "hover"} title={
                      <Card bordered={false}>
                        <Paragraph>
                          <FormattedMessage
                            id="pages.student.exercise.requirements.intro"
                            defaultMessage="Available when all of the following conditions are met:"
                          />
                        </Paragraph>
                        <List
                        itemLayout="horizontal"
                        dataSource={exercise.requirements}
                        renderItem={(requirement: any) => (
                          <List.Item>
                            <List.Item.Meta
                              className={(requirement.status) ? 'completed': ''}
                              avatar={(requirement.status) ? <CheckOutlined style={{color: "#fff"}} /> : <CloseOutlined style={{color: "#fff"}}/>}
                              description={requirement.description}
                            />
                          </List.Item>
                        )}
                        />
                      </Card>
                    } color="#03dac5">
                      <LockFilled />
                    </Tooltip>
                </Timeline.Item>
                }
                </>
              }

              { exercise.is_unlocked && 
              <Timeline.Item color="#000" 
                className={classNames({
                  'current-exercise': (currentExercise.exercise_id === exercise.exercise_id && !isInstruction),
                  [style.exerciseFinish]: (exercise.progress === "100"),
                })}>
                <Link href={sendToExerciseOverview(exercise.exercise_id)}>
                  {exercise.exercise_num}
                </Link>
              </Timeline.Item>
              }

              { !exercise.is_unlocked && 
              <Timeline.Item  
                color="#000" 
                className={classNames({
                  'current-exercise': (currentExercise.exercise_id === exercise.exercise_id && !isInstruction),
                  [style.exerciseFinish]: (exercise.progress === "100"),
                })}>
                  {exercise.exercise_num}
                  <Tooltip overlayClassName={style.unlockedBoxRequirements} trigger={(isMobile) ? "click": "hover"} title={
                    <Card bordered={false}>
                      <Paragraph>
                        <FormattedMessage
                          id="pages.student.exercise.requirements.intro"
                          defaultMessage="Available when all of the following conditions are met:"
                        />
                      </Paragraph>
                      <List
                      itemLayout="horizontal"
                      dataSource={exercise.requirements}
                      renderItem={(requirement: any) => (
                        <List.Item>
                          <List.Item.Meta
                            className={(requirement.status) ? 'completed': ''}
                            avatar={(requirement.status) ? <CheckOutlined style={{color: "#fff"}} /> : <CloseOutlined style={{color: "#fff"}}/>}
                            description={requirement.description}
                          />
                        </List.Item>
                      )}
                      />
                    </Card>
                  } color="#03dac5">
                    <LockFilled />
                  </Tooltip>
              </Timeline.Item>
              }
            </React.Fragment>
          ))}
        </Timeline> 
      </Card>
    </Sider>
    

    {/* Mobile Top 
    { !screens.md &&
    <Card>
      { currentExercise.course_id && 
        <PageHeader
          title={
            <>
              { (typeof isInstruction != "undefined" && isInstruction) && 
                <Title level={4}> 
                <FormattedMessage
                  id="pages.student.exercise.main.instructions"
                  defaultMessage="Instructions "
                />
                </Title>
              }
              { (currentExercise.exercise_number && !isInstruction) && 
                <Title level={4}> 
                <FormattedMessage
                  id="pages.student.exercise.main.exe"
                  defaultMessage="Exercise "
                />
                {currentExercise.exercise_number}</Title>
              }
            </>
          }
          className={style.exerciseSiderTitle}
          avatar={{ icon: <TrophyFilled />}} />
      }
    </Card>
    } */}
    </>
  );
};

export default ExerciseSider;
