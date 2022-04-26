import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import { List, Tooltip, Grid, Button, message, Card, Typography } from 'antd';
import request from 'umi-request';
import { isMobile } from "react-device-detect";
import { getUserData, getPageQuery, API_URL } from '@/utils/utils';
import classNames from 'classnames';
import { CaretRightOutlined, LockFilled, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import style from './index.less';

const { useBreakpoint } = Grid;
const { Paragraph } = Typography;

const btnAttr = {
  shape:"round",
  size:"middle" 
}

interface ExerciseButtonProps {
  exerciseId: string;
  score?: string;
  startedOn?: Date;
  answeredAll?: boolean;
  isInstruction?: boolean;
  isPassed?: boolean;
  isRepeatable?: boolean;
  isUnlocked?: boolean;
  requirements?: any; // Holding the Requirements to unlock the exercisee
  sectionIsUnlocked?: boolean;
  subSectionIsUnlocked?: boolean;
}

const ExerciseButton: React.FC<ExerciseButtonProps> = (props) => {
  const screens = useBreakpoint();
  const { exerciseId, 
          score, 
          startedOn, 
          answeredAll, isInstruction, isPassed, isUnlocked, 
          requirements, sectionIsUnlocked, subSectionIsUnlocked, isRepeatable } = props;
  const [ btnColor, setBtnColor ] =  useState<string>("btnStart");
  const [ idMsg, setIdMsg ] =  useState<string>("pages.student.btn.start");
  const [ defaultMsg, setDefaultMsg ] =  useState<string>("START");
  const [ showGrade, setShowGrade ] = useState<boolean>(false);
  const [ retry, setRetry] = useState<boolean>(false);
  const [ twiceClick, setTwiceClick ] = useState<number>(0);
  const [ resetLoading, setResetLoading ] = useState<boolean>(false);

  const resetExercise = (exercise_id: string) => {
    const userData = getUserData();
    const pageQuery = getPageQuery();
    const { course_id } = pageQuery;
    setResetLoading(true);

    request
      .get(`${API_URL}exercise/reset`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: { exercise_id }
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        setResetLoading(false);
        // Redirect to the exercise after reset
        history.push(`/exercise?exercise_id=${exercise_id}&course_id=${course_id}`);
      })
      .catch((error) => {
        console.log(error);
      });
    
  }

  const sendToExerciseInstruction = (exercise_id: string) => {
    const params = getPageQuery();
    const { course_id } = params;
    return `/exercise-instructions?exercise_id=${exercise_id}&course_id=${course_id}`;
  }

  const sendToExercise = (exercise_id: string) => {
    const params = getPageQuery();
    const { course_id } = params;
    history.push(`/exercise?exercise_id=${exercise_id}&course_id=${course_id}`);
  }
  
  const generateButtonText = () => {
    let idMsgText; let defaultMsgText;
    // If content is open but not started, show blue “start” button.
    
    // If content is open and already started, show blue “continue” button
    if(startedOn && !answeredAll) {
      idMsgText = 'pages.student.btn.continue';
      defaultMsgText = 'Continue';

      setBtnColor("btnContinue");
    }

    // If content is open and finished with a passing grade
    if(startedOn && answeredAll) {
      setShowGrade(true);
      setBtnColor("btnFinished");
    }

    if (idMsgText && defaultMsgText) {
      setIdMsg(idMsgText)
      setDefaultMsg(defaultMsgText);
    }
  }

  useEffect(() => {
    if (isUnlocked) {
      generateButtonText()
    }
  }, []);

  const onMouseOverBtn = () => {
    if(!retry && (isRepeatable || !isPassed)) { setRetry(true); }
  }

  const onMouseOutBtn = () => {
    if(retry && (isRepeatable || !isPassed)) { setRetry(false); }
  }

  const redirectToExercise = (exercise_id: string) => {
    if(isRepeatable || !isPassed) {
      resetExercise(exercise_id)
    } else if(!isRepeatable || isPassed) {
      sendToExercise(exercise_id);
    } else {
      sendToExercise(exercise_id);
    }
  }

  // Only trigger the reset if the user clicked twice + not passed
  const onTwiceClick = (exercise_id: string) => {
    if(isRepeatable || !isPassed) {
      if(!twiceClick) {
        setTwiceClick(twiceClick+1);
      } else{
        // Redirect
        resetExercise(exercise_id)
      }
    }
  }
                          
  return (
    <>
      {/** Instruction Button */ }
      { (isInstruction && (isUnlocked)) && 
        <>
          { (startedOn) && 
            <Button 
            {...btnAttr}
            className={classNames({
              [style.btnFinished] : true,
              [style.mobileBtn]: !screens.md
            })} 
            href={sendToExerciseInstruction(exerciseId)}>
              <FormattedMessage
                id="pages.student.btn.retry"
                defaultMessage="RETRY"
              />
            </Button>
          }

          { (!startedOn) && 
            <Button 
            {...btnAttr}
            className={classNames({
              [style.btnStart] : true,
              [style.btnWithIcon] : true,
              [style.mobileBtn]: !screens.md
            })}
            href={sendToExerciseInstruction(exerciseId)}
            icon={<CaretRightOutlined />}>
              <FormattedMessage
                id="pages.student.btn.start"
                defaultMessage="START"
              />
            </Button>
          }
        </>
      }

      {/** Locked Button */}
      { 
      // console.log(sectionIsUnlocked,subSectionIsUnlocked, isUnlocked)
      }
      
      { (!isUnlocked) && 
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
          dataSource={requirements}
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
        <Button 
          {...btnAttr}
          className={classNames({
            [style.btnLocked] : true,
            [style.mobileBtn]: !screens.md
          })}
          icon={<LockFilled />} />
      </Tooltip>
      }

      {/** Normal Button (Score, Passed, Continue & Start) */}
      { (!isInstruction && (isUnlocked)) &&
      <>
        { showGrade && 
        <>
          { isMobile && 
          <Button 
          {...btnAttr}
          onClick={() => onTwiceClick(exerciseId)}
          className={classNames({
            [style[btnColor]] : true,
            [style.mobileBtn]: !screens.md
          })}
          icon={(!showGrade) && <CaretRightOutlined />}>
            {(twiceClick >= 1 && (isRepeatable || !isPassed)) ? 
            <FormattedMessage
              id="pages.student.btn.retry"
              defaultMessage="RETRY"
            /> :`${score}%`
            }
          </Button>
          }
          { !isMobile &&
          <Button 
            {...btnAttr}
            loading={resetLoading}
            onClick={()=>redirectToExercise(exerciseId)}
            onMouseOver={onMouseOverBtn}
            onMouseOut={onMouseOutBtn}
            className={classNames({
              [style[btnColor]] : true,
              [style.mobileBtn]: !screens.md
            })}
            icon={(!showGrade) && <CaretRightOutlined />}>
              {(retry) ? 
              <FormattedMessage
                id="pages.student.btn.retry"
                defaultMessage="RETRY"
              /> :`${score}%`
              }
          </Button>}
        </>
        }

        { !showGrade && 
        <Button 
          {...btnAttr}
          onClick={()=>sendToExercise(exerciseId)}
          className={classNames({
            [style[btnColor]] : true,
            [style.btnWithIcon] : true,
            [style.mobileBtn]: !screens.md
          })}
          icon={(!showGrade) && <CaretRightOutlined />}>
            <FormattedMessage
              id= {idMsg}
              defaultMessage= {defaultMsg}
            />
        </Button>
        }
       </>
      }
    </>
  )
}

export default ExerciseButton;