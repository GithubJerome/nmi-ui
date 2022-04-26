import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { convertCommaToDot, getUserData, getPageQuery, API_URL } from '@/utils/utils';
import { Grid, Button, message, Descriptions, Card, Typography, Progress, Divider, Layout, Result } from 'antd';
import { CaretRightOutlined, LeftOutlined } from '@ant-design/icons';
import { size } from 'lodash';
import classNames from 'classnames';
import ExerciseSider from '@/components/student/ExerciseSider';
import QuestionBar from '@/components/student/QuestionBar';
import style from './style.less';

const { useBreakpoint } = Grid;
const { Title, Link } = Typography;
const { Content } = Layout;

const ExerciseOverviewPage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [unavailable, setUnavailable] = useState<boolean>(false);
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [exerciseData, setExerciseData] = useState<object>({exercises: []});
  const [loading, setLoading] = useState<boolean>(true);
  const [] = useState<string[]>([]);
  const [] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();

  const queryExerciseOverview = (params: { exercise_id: string; }) => {
    const userData = getUserData();
    setLoading(true);
    
    request
      .get(`${API_URL}exercise/overview`, {
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

        if(response.data.is_unlocked) {
          setExerciseData(response.data);
        } else {
          setUnavailable(true);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getCourseExerciseOverview = () => {
    const params = getPageQuery();
    const { exercise_id } = params as { redirect: string };
    queryExerciseOverview({exercise_id});
  }

  const sendToExercise = () => {
    const params = getPageQuery();
    const { course_id, exercise_id } = params as { redirect: string };
    let redirect = "/exercise?exercise_id="+exercise_id+"&course_id="+course_id;
    return redirect;
  }

  const onCollapseSider = (collapsed) => {
    setSiderCollapse(collapsed);
  }

  useEffect(() => {
    getCourseExerciseOverview();
  }, []);

  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });
  
  return (
    <Layout hasSider className={layoutClassesCondition}>
      { unavailable &&
      <Result
        status={404}
        title="404"
        subTitle="Sorry, you are not authorized to access this page."
      />
      }
      {!unavailable &&
      <>
      <ExerciseSider 
        onCollapse={onCollapseSider} 
        currentExercise={exerciseData} 
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.backSection}>
          {exerciseData && exerciseData.course_id &&
          <Button className={style.customBtn} href={`/course?course_id=${exerciseData.course_id}`} icon={<LeftOutlined />} size={size}>
            <FormattedMessage
              id= 'pages.student.exercise-overview.back'
              defaultMessage= 'BACK'
            />
          </Button>
          }
        </div>
        <Card loading={loading} bordered={false} className={style.contentCardBox}>
          <div className={style.exerciseContent}>
            {exerciseData && exerciseData.section_name && 
            <Title level={5} style={{margin: 0}}>
              {exerciseData.section_name}
            </Title>
            }
            {exerciseData && exerciseData.subsection_name && 
            <Title level={5} style={{margin: 0}}>
              {exerciseData.subsection_name}
            </Title>
            }

            { (exerciseData.course_title) && 
            <Title level={3} style={{marginTop: 0, marginBottom: 40}}>
              <Link href={`/course?course_id=${exerciseData.course_id}`}>{exerciseData.course_title}</Link>
            </Title>
            }

            <Descriptions column={{ lg: 3, md: 2, sm: 1, xs: 1 }}>
              { /* exerciseData && exerciseData.course_name &&
                <Descriptions.Item label={intl.formatMessage({
                  id: 'pages.student.exercise-overview.side.course',
                  defaultMessage: 'Course'
                })}>{exerciseData.course_name}</Descriptions.Item>
              */ }
              <Descriptions.Item label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.numberOfQuestions',
                defaultMessage: 'Number of questions'
              })}>{exerciseData.numberOfQuestions}</Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.timed_limit',
                defaultMessage: 'Time limit'
              })}>{exerciseData.timed_limit}</Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.passing_criterium',
                defaultMessage: 'Passing criterium'
              })}>{exerciseData.passing_criterium}</Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.help',
                defaultMessage: 'Help available'
              })}>
                <FormattedMessage
                  id={`pages.student.exercise-overview.main.overview.help.${exerciseData.help ? exerciseData.help.toString() : "false"}`}
                  defaultMessage= 'Yes'
                />
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.estimate_time',
                defaultMessage: 'Time estimate'
              })}>{exerciseData.estimate_time}</Descriptions.Item>
              <Descriptions.Item span={24} label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.exercise_difficulty',
                defaultMessage: 'Exercise difficulty'
              })}>{exerciseData.exercise_difficulty}</Descriptions.Item>
              <Descriptions.Item span={24} label={intl.formatMessage({
                id: 'pages.student.exercise-overview.main.overview.question_type',
                defaultMessage: 'Type of questions'
              })}>{exerciseData.question_type ? exerciseData.question_type.join(", ") : ""}</Descriptions.Item>
              {exerciseData && exerciseData.description && 
                <Descriptions.Item span={24} label={intl.formatMessage({
                  id: 'pages.student.exercise-overview.side.desc',
                  defaultMessage: 'Description'
                })}>{exerciseData.description}</Descriptions.Item>
              }
              </Descriptions>
          </div>

          <Divider orientation="left" plain style={{marginBottom: "50px"}}/>
          
          <div className={style.exerciseContentFooter}>
            <QuestionBar questions={exerciseData.questions} />

            <div className={style.exerciseBtnBox}>
              <Link href={sendToExercise()}>
                <Button type="primary" shape="round" icon={<CaretRightOutlined />} size={size}>
                  <FormattedMessage
                    id= 'pages.student.exercise-overview.main.start.button'
                    defaultMessage= 'Start'
                  />
                </Button>
              </Link> 
            </div>
          </div>

        </Card>
      </Content>
      </>
      }
    </Layout>
  );
};

export default ExerciseOverviewPage;
