import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery, API_URL } from '@/utils/utils';
import { Col, Row, Button, message, Card, Grid, Typography, Progress, List, Layout } from 'antd';
import { CaretRightOutlined, LeftOutlined } from '@ant-design/icons';
import { size } from 'lodash';
import ReactPlayer from 'react-player'
import ExerciseSider from '@/components/student/ExerciseSider';
import classNames from 'classnames';
import style from './style.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ExerciseOverviewPage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [exerciseData, setExerciseData] = useState<object>({exercises: []});
  const [loading, setLoading] = useState<boolean>(true);
  const [exerciseInstruction, setExerciseInstruction] = useState<object[]>([]);
  const [instructionProgress, setInstructionProgress] = useState<number>(0);
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
          history.replace("/user/login");
        }
        setExerciseData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getCourseExerciseOverview = () => {
    const params = getPageQuery();
    const { exercise_id } = params as { exercise_id: string };
    queryExerciseOverview({exercise_id});
  }

  const sendToExercise = () => {
    const params = getPageQuery();
    const { course_id, exercise_id } = params as { course_id: string; exercise_id: string };
    return `/exercise?exercise_id=${exercise_id}&course_id=${course_id}`;
  }

  const backTo = () => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string; };
    return `/course?course_id=${course_id}`;
  }

  const queryExerciseInstruction = () => {
    const params = getPageQuery();
    const { exercise_id } = params as { exercise_id: string };
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}instruction`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          exercise_id
        }
      })
      .then((response) => {
        
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        setExerciseInstruction(response.rows);

        // Create Instruction Progress UI
        if(response.rows.length) {
          const perProgress = 100/response.rows.length;
          setInstructionProgress(perProgress*1);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getCourseExerciseOverview();
    queryExerciseInstruction();
  }, []);

  const getImgURL = (obj: any) => {
    if(obj.image_url && obj.image_url !== ""){
      return <img
        alt={`Instruction ${obj.page_number}`}
        src={obj.image_url}
        className={style.imageBox}
        style={{
          height: "300px",
        }}
      />
    } if (obj.video_url && obj.video_url !== ""){
      return <ReactPlayer
        url={obj.video_url}
        controls
        playbackRate = {2}
        className={style.playerBox}
        height = "300px"
      />
    } if (obj.sound_url && obj.sound_url !== ""){
      return <ReactPlayer
        url={obj.sound_url}
        controls
        className={style.playerBox}
        playbackRate = {2}
        height = "70px"
      />
    } 
      return <div style={{
        width: "100%",
        height: "300px",
      }} />;
    
  }

  const onCollapseSider = (collapsed: boolean) => {
    setSiderCollapse(collapsed);
  }

  const instructionChange = (page: number) => {
    const perProgress = (exerciseInstruction.length) ? 100/exerciseInstruction.length : 100;
    setInstructionProgress(perProgress*page);
  }
  
  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });

  return (
    <Layout hasSider className={layoutClassesCondition}>
      <ExerciseSider 
        onCollapse={onCollapseSider} 
        currentExercise={exerciseData} 
        isInstruction
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.backSection}>
          <Button className={style.customBtn} href={backTo()} icon={<LeftOutlined />} size={size}>
            <FormattedMessage
              id= 'pages.student.instruction.back'
              defaultMessage= 'BACK'
            />
          </Button>
        </div>
        <Card loading={loading} bordered={false} className={style.contentCardBox}>
            <List
              className={style.exerciseInstructionBox}
              itemLayout="horizontal"
              size="large"
              pagination={{
                pageSize: 1,
                onChange: instructionChange
              }}
              dataSource={exerciseInstruction}
              renderItem={(inst: any) => (
                <Row>
                  <Col lg={16} style={{width: "100%"}}>
                    <Card 
                      style={{
                        textAlign: 'left',
                        width: "100%",
                        margin: "auto",
                      }}
                      bordered={false}
                      title={
                        <Title level={3}><FormattedMessage
                          id= 'pages.student.instruction.main.inst.text'
                          defaultMessage= 'Instructions'
                        /> {inst.page_number}
                        </Title>
                      } 
                    >
                      <div style={{
                        margin: "auto",
                        textAlign: 'left',
                      }}>
                        {getImgURL(inst)}
                        <Paragraph style={{marginTop: 20}}>{inst.text}</Paragraph>
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
            />
            
            { screens.md && 
            <>
            <Progress percent={instructionProgress} showInfo={false} />
            <div className={style.exerciseBtnBox}>
              <a href={sendToExercise()}>
                <Button type="primary" shape="round" icon={<CaretRightOutlined />} size={size} style={{ float: "right", bottom: 32 }}>
                  <FormattedMessage
                    id= 'pages.student.instruction.main.start.button'
                    defaultMessage= 'Start'
                  />
                </Button>
              </a>
            </div>
            </>
            }
          </Card>

          { !screens.md && 
          <div className={style.instructionContentFooter}>
            <Progress percent={instructionProgress} showInfo={false} />
            <div className={style.exerciseBtnBox}>
              <a href={sendToExercise()}>
                <Button type="primary" shape="round" icon={<CaretRightOutlined />} size={size}>
                  <FormattedMessage
                    id= 'pages.student.instruction.main.start.button'
                    defaultMessage= 'Start'
                  />
                </Button>
              </a>
            </div>
          </div>
          }
       </Content>
    </Layout>
  );
};

export default ExerciseOverviewPage;
