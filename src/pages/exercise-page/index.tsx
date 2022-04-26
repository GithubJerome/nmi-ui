import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { isMobile } from "react-device-detect";
import { convertCommaToDot, getUserData, getPageQuery, API_URL } from '@/utils/utils';
import { Grid, Col, Space, Row, Layout, Radio, Button, Card, message, Progress, Typography, List, Input, Tooltip, Alert, Pagination, Checkbox, Timeline } from 'antd';
import { LeftOutlined, CloseCircleOutlined, CaretRightOutlined, CheckCircleOutlined, CheckOutlined, CloseOutlined, LockFilled  } from '@ant-design/icons';
import { size, isNaN } from 'lodash';
import classNames from 'classnames';
import Divider from 'antd/lib/divider';
import { Container, Draggable } from 'react-smooth-dnd';
import ExerciseSider from '@/components/student/ExerciseSider';
import QuestionBar from '@/components/student/QuestionBar';
import NumericInput from './components/NumericInput';
import style from './style.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph, Text, Link } = Typography;
const { Content } = Layout;

const timelineDotStyle = {
  fontSize: '17px',
  color: '#000'
}

const radioStyle = {
  display: 'block',
  height: '50px',
  lineHeight: '50px',
  fontSize: '17px',
  fontWeight: 'bold'
};

const fractionReg = " "; // /<f>(.*?)<\/f>/;

message.config({
  top: 75,
});

const ExercisePage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [courseExerciseData, setCourseExerciseData] = useState<object>({exercises: []});
  const [exerciseSummary, setExerciseSummary] = useState<object>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [currAnswer, setCurrAnswer] = useState<string[]>([]);
  const [dropBoxCurrAnswer, setDropBoxCurrAnswer] = useState<object>({}); 
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [currentQuestionNo, setCurrentQuestionNo] = useState<number>(0);
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();
  const submitBtn = useRef(null);
  // const fitbtFirstInput = useRef();

  const resetExercise = () => {
    const userData = getUserData();
    const par = getPageQuery();
    const { exercise_id } = par as { redirect: string };
    const params = { exercise_id }
    setLoading(true);
    request
      .get(`${API_URL}exercise/reset`, {
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
        setLoading(false);
        getCourseExercise();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryExerciseSummary = (params: { exercise_id: string; }) => {
    const userData = getUserData();
    setLoading(true);
    request
      .get(`${API_URL}exercise/summary`, {
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
        
        setExerciseSummary(response.data);
        setLoading(false);
        setDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryCourseExercise = (params: { course_id: string; exercise_id: string; }) => {
    setCurrAnswer([]);
    const userData = getUserData();
    setLoading(true);
    request
      .get(`${API_URL}student/course/exercise`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setCurrAnswer([]);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        
        // Testing Code
        // response.data.exercises[0].questions[0].question = "9 2/3 x 4 1/27 = <ans> <ans>/<ans>";
        setCourseExerciseData(response.data);

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getCourseExercise = () => {
    const params = getPageQuery();
    const { course_id, exercise_id } = params as { redirect: string };
    queryCourseExercise({course_id, exercise_id});
    queryExerciseSummary({exercise_id});
  }

  const queryAnswer = (item, params) => {
    const userData = getUserData();
    if (loading) return;
    setLoading(true);
    let answ = currAnswer[0];

    const qType = item.question_type;
    if(qType === "FITBT" || qType === "FITBD"){
      answ = reversFormatLabel(item.question, "<ans>", qType);
      answ = answ.join("");
    }

    if(qType === "MULRE"){
      answ = currAnswer; // .join(",");
    }

    if(qType === "MATCH"){
      answ = Object.values(dropBoxCurrAnswer);
    }
    
    params.answer = answ;
    request
      .post(`${API_URL}exercise/answer`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          exercise_id: params.exercise_id,
          question_id: params.question_id
        },
        data: params
      })
      .then((response) => {
        // getCourseExercise();

        if(response.data.isCorrect) {
          message.success(response.data.message);
        } else {
          message.error(response.data.message);
        }

        setTimeout(() => {
          location.reload();
        }, 1500);
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onChange = (e, i) => {
    const { value } = e.target;
    const copy = [...currAnswer];
    copy[i] = value;
    setCurrAnswer(copy);
  };

  const onEnterSubmit = (item:any, data:any) => {
    queryAnswer(item, data);
  }

  const onChangeRadio = e => {
    setCurrAnswer([e.target.value]);
  };

  const onChangeChecked = checkedValues => {
    setCurrAnswer(checkedValues);
  };

  const buildQuestionText = (questionText: string, type: string) => {
    if(questionText.indexOf("/") > -1 && questionText.split(fractionReg).length > 1) {
      const questionContainerClasses = classNames({
        [style.fractionalBox]: true,
        [style.FITBDquestion]: (type === "FITBD"),
      });

      return <div className={questionContainerClasses}>
        {questionText.split(fractionReg).map((strV: string) => {
          if(strV) {
            return <div className={style.dividerBox}>
              {strV.split("/").map((v:string,i) => {
                
                const contentClasses = classNames({
                  [style[`dividerLine1`]]: (i === 1),
                  [style.operator1]: (v === "-" || v === "x" || v === ":"),
                  [style.operator2]: (v === "=" || v === "+"),
                  [style.operator3]: (v === "–"),
                });

                return <div className={contentClasses}>{v}</div>
              }
              )}
            </div>
          }
          return null;
        })
        }
      </div>;
    }

    return questionText;
  }

  const formatQuestions = (label, value) => {
    if (!value) {
      return label;
    }
    return (<span>
      { label.split(value)
        .reduce((prev, current, i) => {
          if (!i) {
            return [current];
          }
          
          return prev.concat("__", current)
        }, [])
      }
    </span>);
  };

  const formatLabel = (item, value, exercise_id) => {
    const label = item.question;
    if (!value) {
      return label;
    }
    const spltd = label.split(value);
    
    if(item.is_mfraction) {
      return <div style={{fontSize: "25px", fontWeight: "bold"}}>
      {spltd.map((strV: string, i) => {
        let firstFieldFocus = false;
        if(i === 1) {
          firstFieldFocus = true;
        }

        if(strV.trim() === "/") {
          return <div className={style.frac}>
            <NumericInput
              className={`${style.inputAnswerBox } ${ style.enuDenu}`}
              onChange={onChange}
              autoFocus={firstFieldFocus}
              onEnterSubmit={onEnterSubmit}
              exerciseItem={item}
              numEval={item.num_eval}
              exerciseId={exercise_id}
              questionId={item.course_question_id}
              answerKey={i-1}
            />
            <div className={style.symbol}></div>
            <NumericInput
              className={`${style.inputAnswerBox } ${ style.enuDenu}`}
              onChange={onChange}
              autoFocus={false}
              onEnterSubmit={onEnterSubmit}
              exerciseItem={item}
              exerciseId={exercise_id}
              numEval={item.num_eval}
              questionId={item.course_question_id}
              answerKey={i}
            />
          </div>;
        } else if (strV === " ") {
          return <div className={style.frac}><NumericInput
              className={`${style.inputAnswerBox } ${ style.enuDenu}`}
              onChange={onChange}
              autoFocus={firstFieldFocus}
              onEnterSubmit={onEnterSubmit}
              exerciseItem={item}
              numEval={item.num_eval}
              exerciseId={exercise_id}
              questionId={item.course_question_id}
              answerKey={i-1}
            /></div>;
        } else {
          return  <div className={style.frac}>{buildQuestionText(strV, "FITBT")}</div>;
        }
      })}
      </div>;
    } else {
      const forRational = (content:any)=> {
        if(spltd.indexOf("/") > -1){
          return (
            <div className={style.frac}>
              {content}
            </div>
          );
        } 
        return content;
      }

      return (<div style={{fontSize: "25px", fontWeight: "bold"}}>
        {
          (spltd.indexOf("/") > -1) && buildQuestionText(spltd[0], "FITBT")
        }

        { forRational(spltd
          .reduce((prev, current, i) => {

            if (!i) {
              return [buildQuestionText(current, "FITBT")];
            }
            
            let firstFieldFocus = false;
            if(i === 1) {
              firstFieldFocus = true;
            }

            if(spltd.indexOf("/") > -1){
              
              let curr = current;
              if(current.trim() === "/"){
                curr = <div className={style.symbol}></div>;
              }
              if(i === 1) {
                return ([
                  <NumericInput
                    className={`${style.inputAnswerBox } ${ style.enuDenu}`}
                    onChange={onChange}
                    autoFocus={firstFieldFocus}
                    onEnterSubmit={onEnterSubmit}
                    exerciseItem={item}
                    numEval={item.num_eval}
                    exerciseId={exercise_id}
                    questionId={item.course_question_id}
                    answerKey={i-1}
                  />
                ]).concat(curr);
              }
              return prev.concat(
                <NumericInput
                  className={`${style.inputAnswerBox } ${ style.enuDenu}`}
                  onChange={onChange}
                  autoFocus={firstFieldFocus}
                  onEnterSubmit={onEnterSubmit}
                  exerciseItem={item}
                  exerciseId={exercise_id}
                  numEval={item.num_eval}
                  questionId={item.course_question_id}
                  answerKey={i-1}
                />
              , curr)
            } 

            return prev.concat(<NumericInput
              className={style.inputAnswerBox}
              onChange={onChange}
              autoFocus={firstFieldFocus}
              autoResize
              onEnterSubmit={onEnterSubmit}
              exerciseItem={item}
              exerciseId={exercise_id}
              numEval={item.num_eval}
              questionId={item.course_question_id}
              answerKey={i-1}
            />, current);
            
            // return prev.concat(<b key={value + current}>{ value }</b>, current);
          }, []))
        }
      </div>);
    }
  };

  const dragBoxHandler = (e, keyIndex) => {
    const { removedIndex, addedIndex, payload } = e;
    
    if (removedIndex === null && addedIndex === null) return currAnswer;

    if (removedIndex !== null) {
      setDropBoxCurrAnswer({ ...dropBoxCurrAnswer, [keyIndex]: "" });
    }
  
    if (addedIndex !== null) {
      if(dropBoxCurrAnswer[keyIndex] && dropBoxCurrAnswer[keyIndex] !== "") {
        const prevAnswer = dropBoxCurrAnswer[keyIndex];

        if(payload !== prevAnswer) {
          let result = [...currAnswer];
          result.push(prevAnswer);
          setCurrAnswer(result);
        }
      } 
      setDropBoxCurrAnswer({ ...dropBoxCurrAnswer, [keyIndex]: payload });
    }
  }

  const formatDragContainer = (item, value) => {
    const label = item.question;
    
    if (!value) {
      return {label};
    }
    
    return (<Row align="middle" className={style.questionBoxContainer}>
      { label.split(value)
        .reduce((prev, current, i) => {
          
          if(!current) {
            return [current];
          }

          if (!i && current) {
            return [<Col flex="none">{buildQuestionText(current, "FITBD")}</Col>];
          }

          const keyIndex = --i;
          
          return prev.concat(
          <Col key={keyIndex} flex="none" className={style.dragBoxContainer}>
            <Container 
              orientation="horizontal" 
              groupName="FITBD" 
              behaviour="drop-zone"
              getChildPayload={key => dropBoxCurrAnswer[keyIndex]} 
              onDrop={e => dragBoxHandler(e, keyIndex)}>
                {
                (dropBoxCurrAnswer[keyIndex] && dropBoxCurrAnswer[keyIndex] !== "")  &&
                <Draggable key={keyIndex}>
                  <div className="draggable-item drop-item-box">{dropBoxCurrAnswer[keyIndex]}</div>
                </Draggable>
                }
            </Container>
          </Col>
          , <Col key={keyIndex+(Math.random() * (100 - 1) + 1)} flex="none">{buildQuestionText(current, "FITBD")}</Col>);
        }, [])
      }
    </Row>);
  };

  const reversFormatLabel = (label, value, type) => {
    if (!value) {
      return label;
    }
    return label.split(value)
        .reduce((prev, current, i) => {
          if (!i) {
            return [current];
          }
          
          if (type === "FITBD") {
            return prev.concat(dropBoxCurrAnswer[i-1], current)
          } 
          return prev.concat(currAnswer[i-1], current)
        }, []);
  };

  const applyDrag = (arr, dragResult) => {

    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) return arr;
  
    const result = [...arr];
    let itemToAdd = payload;
  
    if (removedIndex !== null) {
      itemToAdd = result.splice(removedIndex, 1)[0];
    }
  
    if (addedIndex !== null) {
      result.splice(addedIndex, 0, itemToAdd);
    }
    return result;
  };

  const sendToNextExercise = (exercise: any) => {
    const params = getPageQuery();
    const { course_id } = params as { course_id: string };

    if(exercise.instructions && exercise.instructions.length > 0) {
      return `/exercise-instructions?exercise_id=${exercise.exercise_id}&course_id=${course_id}`;
    } 
    return `/exercise-overview?exercise_id=${exercise.exercise_id}&course_id=${course_id}`;
  }

  useEffect(() => {
    document.title = "Exercise - NMI Oefenpagina";

    getCourseExercise();
  }, []);

  useEffect(() => {
    const listener = event => {
      if ((event.code === "Enter" || event.code === "NumpadEnter") && submitBtn.current) {
        submitBtn.current.click();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  const onCollapseSider = (collapsed, type) => {
    setSiderCollapse(collapsed);
  }

  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });
  
  return (
    <Layout hasSider className={layoutClassesCondition}>
      <ExerciseSider 
        onCollapse={onCollapseSider} 
        currentExercise={courseExerciseData}
      /> 
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <div className={style.backSection}>
          {courseExerciseData && courseExerciseData.course_id &&
          <Button className={style.customBtn} href={`/course?course_id=${courseExerciseData.course_id}`} icon={<LeftOutlined />} size={size}>
            <FormattedMessage
              id="pages.student.exercise.back"
              defaultMessage="BACK"
            />
          </Button>
          }
        </div>
        <Card loading={dataLoading} bordered={false} className={style.exerciseBox}>
          {
            courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && 
            <Title level={3} className={style.exerciseBoxTitle}>
              {courseExerciseData.exercises[0].answered_all === true && 
                <FormattedMessage
                  id="pages.student.exercise.main.done"
                  defaultMessage="Done"
                />
              }
              {(courseExerciseData.exercises[0].answered_all === false && currentQuestionNo > 0) && 
                <>
                <FormattedMessage
                  id="pages.student.exercise.main.question"
                  defaultMessage="Question "
                />
                {currentQuestionNo}
                </>
              }
            </Title>
          }
          {
            courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && courseExerciseData.exercises[0].answered_all === false && courseExerciseData.exercises[0].questions.length > 0 &&
            <List
              itemLayout="horizontal"
              dataSource={[(courseExerciseData.exercises[0].questions.filter(q => q.answered === false))[0]]}
              renderItem={(item) => (
                <List.Item key={item.exercise_id}>
                  {setCurrentQuestionNo(item.sequence)}
                  <div style={{width: "100%"}}>
                    <div className={style.exerciseBoxQuestion}>
                      <Row gutter={24} className={style.exerciseDescription}>
                        <Col sm={24} xs={24}>
                          <p>
                            {item.description || "Lorem ipsum"}
                          </p>
                        </Col>
                      </Row>
                      { 
                        item.question_type === "MATCH" &&
                        <React.Fragment>
                          {  (currAnswer.length === 0 && Object.keys(dropBoxCurrAnswer).length === 0) ? setCurrAnswer(item.choices) : ""
                          }
                          <Row gutter={24} style={{width: "100%", textAlign: "center", fontSize: "25px" }}>
                            <Col sm={24} xs={24}>
                              <div className={style.exerciseDragDropBox}>
                                <Container lockAxis="y" >
                                  {item.question.map((q, keyIndex) => {
                                    return (
                                      <Row style={{marginBottom: "10px"}}>
                                        <Col flex="160px" className={style.questionContainerMatch}>
                                          <Text strong>{q}</Text>
                                        </Col>
                                        <Col flex="160px" className={style.dragBoxContainerMatch}>
                                          <Container 
                                            orientation="horizontal" 
                                            groupName="MATCH" 
                                            behaviour="drop-zone"
                                            getChildPayload={key => dropBoxCurrAnswer[keyIndex]} 
                                            onDrop={e => dragBoxHandler(e, keyIndex)}>
                                              {
                                              (dropBoxCurrAnswer[keyIndex] && dropBoxCurrAnswer[keyIndex].length > 0)  &&
                                              <Draggable key={keyIndex}>
                                                <div className="draggable-item drop-item-box">
                                                  <Text strong>{dropBoxCurrAnswer[keyIndex]}</Text>
                                                </div>
                                              </Draggable>
                                              }
                                          </Container>
                                        </Col>
                                      </Row>
                                    );
                                  })}
                                </Container>
                                <div className={style.choicesBoxMatch}>
                                  <Container orientation="horizontal" groupName="MATCH" getChildPayload={i => currAnswer[i]} onDrop={e => setCurrAnswer(applyDrag(currAnswer, e))}>
                                    {currAnswer.map((choice, index) => {
                                      return (
                                        <Draggable key={index}>
                                          <div className="draggable-item"><Text strong>{choice}</Text></div>
                                        </Draggable>
                                      );
                                    })}
                                  </Container>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </React.Fragment>
                      }
                      { 
                        item.question_type === "FITBD" &&
                        <React.Fragment>
                          { currAnswer.length === 0 ? setCurrAnswer(item.choices) : "" }
                          <Row className={style.dragAndDropContainer} gutter={24} style={{width: "100%", textAlign: "center", fontSize: "25px" }}>
                            <Col sm={24} xs={24}>
                              <div className={style.questionBoxDescription}>
                              {formatDragContainer(item, '<ans>')}
                              </div>
                              <div className={style.choicesBox}>
                                <Container orientation="horizontal" groupName="FITBD" getChildPayload={i => currAnswer[i]} onDrop={e => setCurrAnswer(applyDrag(currAnswer, e))}>
                                {currAnswer.map((choice, index) => {
                                  return (
                                    <Draggable key={index}>
                                      <div className="draggable-item">{choice}</div>
                                    </Draggable>
                                  );
                                })}
                                </Container>
                              </div>
                            </Col>
                          </Row>
                        </React.Fragment>
                      }
                      {
                        item.question_type === "FITBT" &&
                        <React.Fragment>
                          <Row gutter={24} style={{width: "100%"}}>
                            <Col sm={24} xs={24}>
                              <div className={style.questionBoxDescription}>
                                {formatLabel(item, '<ans>', courseExerciseData.exercises[0].exercise_id)}
                              </div>
                            </Col>
                          </Row>
                        </React.Fragment>
                      }
                      {
                        item.question_type === "MULCH" &&
                        <Row style={{ fontSize: "25px" }}>
                          <Col sm={24} xs={24}>
                            <div className={style.questionBoxDescription}>
                              <Text strong>{item.question}</Text>
                            </div>
                            <div className={style.radioBox}>
                              <Radio.Group onChange={onChangeRadio} value={currAnswer[0]} style={{ width: "100%", textAlign: "justify" }}>
                                {item.choices.map(choice => (
                                  <React.Fragment>
                                    <Radio style={radioStyle} value={choice}>
                                      {choice}
                                    </Radio>
                                    <Divider style={{ margin: "0px 0" }} />
                                  </React.Fragment>
                                ))}
                              </Radio.Group>
                            </div>
                          </Col>
                        </Row>
                      }
                      {
                        item.question_type === "MULRE" &&
                        <React.Fragment>
                          <Row style={{ fontSize: "25px" }}>
                            <Col sm={24} xs={24}>
                              <div className={style.questionBoxDescription}>
                                <Text strong>{item.question}</Text>
                              </div>
                              <div className={style.radioBox}>
                                <Checkbox.Group onChange={onChangeChecked} style={{ width: "100%" }}>
                                  {item.choices.map(choice => (
                                    <React.Fragment>
                                      <Checkbox style={radioStyle} value={choice}>
                                        {choice}
                                      </Checkbox>
                                      <Divider style={{ margin: "0px 0" }} />
                                    </React.Fragment>
                                  ))}
                                </Checkbox.Group>
                              </div>
                            </Col>
                          </Row>
                        </React.Fragment>
                      }
                    </div>
                    
                    { 
                      alrt.message !== "" && alrt.type !== "" &&
                      <div style={{padding: "0px 48px", marginBottom: "20px"}}>
                        <Alert message={alrt.message} type={alrt.type} />
                      </div>
                    }

                    <div className={style.exerciseContentFooter}>
                      <QuestionBar questions={courseExerciseData.exercises[0].questions} />

                      <div className={style.exerciseContentBtn}>
                        <Row align="top" className={style.exercisePagination} justify="center" style={{width: "100%", marginTop: "20px"}}>
                          <Col flex="auto" style={{textAlign: "center"}}>
                          { (exerciseSummary.questions && exerciseSummary.questions.length > 0) && 
                            <Space size="small" style={{marginTop: "-10px", marginBottom: 10}}>
                             {exerciseSummary.questions.map((item: any) => (
                                <Button 
                                  shape="circle" 
                                  disabled={(item.answer && item.answer.length > 0) ? true : false} 
                                  type={(item.sequence === currentQuestionNo) ? "primary" : "default"}
                                >{item.sequence}</Button>
                              ))}
                            </Space>
                          }
                          </Col>

                          <Col className={style.nextBtnBox} flex="none" style={{ textAlign: "right" }}>
                            <Button ref={submitBtn} loading={loading} type="primary" shape="round" icon={<CaretRightOutlined /> } size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                              <FormattedMessage
                                id="pages.tutor.exerciseTest.main.next.button"
                                defaultMessage="Next"
                              /> 
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>

                  </div>
                </List.Item>
              )}
            />
          }
          {
            courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && courseExerciseData.exercises[0].answered_all === false && courseExerciseData.exercises[0].questions.length === 0 &&
            <div className={style.summaryContentBox}>
              <FormattedMessage
                id="pages.student.exercise.main.no.questions"
                defaultMessage="No questions available"
              />
            </div>
          }
          {
            courseExerciseData.exercises && courseExerciseData.exercises.length > 0 &&  courseExerciseData.exercises[0].answered_all === true && 
            <React.Fragment>
              {
                exerciseSummary.questions && 
                <div className={style.summaryContentBox}>
                  <Row>
                    <Col md={10} sm={24} style={{width: "100%", marginBottom: 40}}>
                      <Paragraph style={{margin: "13px 0px 40px"}}>
                        <FormattedMessage
                          id="pages.student.exercise.main.finished.message"
                          defaultMessage="Correctly answered questions"
                        />
                      </Paragraph>

                      <Title level={3}>
                        <FormattedMessage
                          id="pages.student.exercise.main.stats.correct"
                          defaultMessage="Correctly answered questions"
                        />: {exerciseSummary.score} <br/>
                        <FormattedMessage
                          id="pages.student.exercise.main.stats.incorrect"
                          defaultMessage="Incorrectly answered questions"
                        />: {exerciseSummary.questions.length - exerciseSummary.score} <br/>
                        { /* <FormattedMessage
                          id="pages.student.exercise.main.stats.timeused"
                          defaultMessage="Time used"
                        />: {exerciseSummary.time_used} */ }
                      </Title>

                      <Title level={1}>
                        <FormattedMessage
                          id="pages.student.exercise.main.stats.grade"
                          defaultMessage="Grade"
                        />: <Text style={{
                            color: (exerciseSummary.score < exerciseSummary.passing_criterium) ? "#f23434" : "#03dac5", 
                            fontFamily: 'sans-serif'}}>
                              {exerciseSummary.percent_score}% <br/>
                              {exerciseSummary.pass}!
                            </Text>
                      </Title>
                    </Col>
                    <Col md={14} sm={24} style={{width: "100%", marginBottom: 40}}>
                      <List
                        dataSource={exerciseSummary.questions}
                        renderItem={(item: any,i) => (
                          <List.Item key={item.course_question_id}>
                            {
                              item.question_type === "MATCH" &&
                              <List.Item.Meta
                                title={intl.formatMessage({
                                  id: 'pages.student.exercise.main.list.question',
                                  defaultMessage: 'Question ',
                                })+(i+1)}
                                description={item.question.join(", ")}
                              />
                            }
                            {
                              item.question_type !== "MATCH" &&
                              <List.Item.Meta
                                title={intl.formatMessage({
                                  id: 'pages.student.exercise.main.list.question',
                                  defaultMessage: 'Question ',
                                })+(i+1)}
                                description={formatQuestions(item.question, "<ans>")}
                              />
                            }
                            <div style={{ width: "60%", paddingLeft: 10 }}>
                              <FormattedMessage
                                id="pages.student.exercise.main.list.your-answer"
                                defaultMessage="Your answer"
                              />: {(item.question_type === "MATCH" || item.question_type === "MULRE") ? item.answer.join(", ") : item.answer} &nbsp; 
                              { item.isCorrect === true && 
                                <CheckCircleOutlined style={{ color: "green" }} />
                              }
                              { item.isCorrect === false && 
                                <CloseCircleOutlined style={{ color: "red" }} />
                              }
                              <br/>
                              <FormattedMessage
                                id="pages.student.exercise.main.list.correct-answer"
                                defaultMessage="Correct answer"
                              />: {(item.question_type === "MATCH" || item.question_type === "MULRE" || item.question_type === "FITBD") ? item.correct_answer.join(", ") : item.correct_answer} &nbsp; 
                            </div>
                          </List.Item>
                        )}
                      />
                    </Col>
                  </Row>
                </div>
              }
              
              <div className={style.summaryFooterBox}>
                <QuestionBar questions={exerciseSummary.questions} />

                <div className={style.exerciseSummaryBtn}>
                  <Row gutter={24}>
                    <Col md={12} sm={24} style={{textAlign: "left"}}>
                      {
                        (exerciseSummary.is_repeatable || (exerciseSummary.score < exerciseSummary.passing_criterium)) &&
                        <Button loading={loading} onClick={()=>resetExercise()} type="primary" shape="round" icon={<CaretRightOutlined />} size={size}>
                          <FormattedMessage
                            id="pages.student.exercise.main.try-again.button"
                            defaultMessage="Try again"
                          />
                        </Button>
                      }
                    </Col>
                    <Col md={12} sm={24} style={{textAlign: "right"}}>
                      {
                        (exerciseSummary.next_exercise && Object.keys(exerciseSummary.next_exercise).length !== 0) &&
                        <>
                          {exerciseSummary.next_exercise.is_unlocked &&
                          <a href={sendToNextExercise(exerciseSummary.next_exercise)}>
                          <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size}>
                            <FormattedMessage
                              id="pages.student.exercise.main.next-exercise.button"
                              defaultMessage="Next exercise"
                            />
                          </Button>
                          </a>}

                          {!exerciseSummary.next_exercise.is_unlocked &&
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
                              dataSource={exerciseSummary.next_exercise.requirements}
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
                              <Button loading={loading} className={style.btnLocked} type="primary" shape="round" icon={<LockFilled />} size={size}>
                                <FormattedMessage
                                  id="pages.student.exercise.main.next-exercise.button"
                                  defaultMessage="Next exercise"
                                />
                              </Button>
                          </Tooltip>

                          }
                        </>
                      }
                    </Col>
                  </Row>
                </div>
              </div>
            </React.Fragment>
          }
        </Card>
      </Content>
    </Layout>
  );
};

export default ExercisePage;