import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery, API_URL } from '@/utils/utils';
import { Col, Row, Radio, Button, Card, message, Progress, Typography, List, Input, Alert, Statistic, Checkbox } from 'antd';
import { LeftOutlined, CloseCircleOutlined, CaretRightOutlined, CheckCircleOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import classNames from 'classnames';
import style from './style.less';
import courseImg from '@/assets/course.png';
import Divider from 'antd/lib/divider';
import { Container, Draggable } from 'react-smooth-dnd';
import NumericInput from '@/components/NumericInput';

const { Title, Paragraph, Text } = Typography;

const fractionReg = " "; // /<f>(.*?)<\/f>/;

const ExerciseTestPage: React.FC<{}> = () => {
  const [courseExerciseData, setCourseExerciseData] = useState<object>({exercises: []});
  const [exerciseSummary, setExerciseSummary] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currAnswer, setCurrAnswer] = useState<string[]>([]);
  const [dropBoxCurrAnswer, setDropBoxCurrAnswer] = useState<object>({}); 

  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  const resetExercise = () => {
    const userData = getUserData();
    const par = getPageQuery();
    const { exercise_id } = par as { redirect: string };
    const params = { exercise_id }
    setLoading(true);
    request
      .get(API_URL+`manager/exercise/reset`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          // let redirect = "/user/login";
          // history.replace(redirect);
          return;
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
      .get(API_URL+`manager/summary`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          // let redirect = "/user/login";
          // history.replace(redirect);
          return;
        }
        setExerciseSummary(response.data);
        setLoading(false);
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
      .get(API_URL+`manager/course/exercise`, {
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
          // let redirect = "/user/login";
          // history.replace(redirect);
          return;
        }

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
      answ = currAnswer;//.join(",");
    }

    if(qType === "MATCH"){
      answ = Object.values(dropBoxCurrAnswer);
    }

    params.answer = answ;
    
    request
      .post(API_URL+`manager/exercise/answer`, {
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
        setAlrt(({
          message: response.data.message,
          type: response.data.isCorrect ? "success" : "error"
        }));
        setTimeout(() => {
          setAlrt(({
            message: "",
            type: ""
          }));
          location.reload();
        }, 1500);
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onChange = (e, i) => {
    const copy = [...currAnswer];
    copy[i] = e.target.value;
    setCurrAnswer(copy);
  };

  const onChangeRadio = e => {
    setCurrAnswer([e.target.value]);
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

  const onEnterSubmit = (item:any, data:any) => {
    queryAnswer(item, data);
  }

  const onChangeChecked = checkedValues => {
    setCurrAnswer(checkedValues);
  };

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
          if (!i) {
            return [current];
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
          , <Col key={keyIndex+(Math.random() * (100 - 1) + 1)} flex="none">{current}</Col>);
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
          } else {
            return prev.concat(currAnswer[i-1], current)
          }
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

  const sendToExerciseOverview = (exercise_id) => {
    const params = getPageQuery();
    const { course_id } = params as { redirect: string };
    let redirect = "/exercise-overview?exercise_id="+exercise_id+"&course_id="+course_id;
    return redirect;
  }

  useEffect(() => {
    getCourseExercise();
  }, []);
  
  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.exerciseTest.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col md={8} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card
              style={{ minHeight: 430 }}
              cover={
                <img
                  alt="example"
                  src={courseImg}
                />
              }
              actions={[
              ]}
            >
              <Typography>
                {courseExerciseData && courseExerciseData.course_title &&
                  <Paragraph style={{ marginBottom: "0px"}}>
                    <b>
                      <FormattedMessage
                        id="pages.tutor.exerciseTest.side.course"
                        defaultMessage="Course"
                      />:&nbsp;
                    </b> 
                    {courseExerciseData.course_title}
                  </Paragraph>
                }
                {courseExerciseData && courseExerciseData.exercises && courseExerciseData.exercises.length > 0 &&
                  <Paragraph style={{ marginTop: "0px", marginBottom: "0px"}}>
                    <b>
                      <FormattedMessage
                        id="pages.tutor.exerciseTest.side.section"
                        defaultMessage="Section"
                      />:&nbsp;
                    </b> 
                    {courseExerciseData.section_name}
                  </Paragraph>
                }
                {courseExerciseData && courseExerciseData.exercises && courseExerciseData.exercises.length > 0 &&
                  <Paragraph style={{ marginTop: "0px", marginBottom: "0px"}}>
                    <b>
                      <FormattedMessage
                        id="pages.tutor.exerciseTest.side.subsection"
                        defaultMessage="Subsection"
                      />:&nbsp;
                    </b> 
                    {courseExerciseData.subsection_name}
                  </Paragraph>
                }
                {courseExerciseData && courseExerciseData.description && courseExerciseData.exercises.length > 0 &&
                  <Paragraph style={{ marginTop: "0px", marginBottom: "0px"}}>
                    <b>
                      <FormattedMessage
                        id="pages.tutor.exerciseTest.side.desc"
                        defaultMessage="Description"
                      />:&nbsp;
                    </b> {courseExerciseData.description}
                  </Paragraph>
                }
              </Typography>
              <Row gutter={24} type="flex" style={{ marginTop: "20px" }}>
                <Col sm={12} xs={24} style={{ textAlign: "center" }} >
                  <Progress type="circle" percent={courseExerciseData.progress || 0} />
                </Col>
                <Col sm={12} xs={24} >
                  <b>
                    <FormattedMessage
                      id="pages.tutor.exerciseTest.side.reqs"
                      defaultMessage="Requirements"
                    />:&nbsp;
                  </b> <br/>
                  {courseExerciseData.requirements}<br/><br/>
                  {/* Expiry Date: {epochToJsDate(courseExerciseData.1600408513)} */}
                </Col>
              </Row>
            </Card>
          </Col>
          <Col md={16} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              {
                courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && 
                <Title level={3}>{courseExerciseData.exercise_num}</Title> 
              }
              {
                courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && courseExerciseData.exercises[0].answered_all === false && courseExerciseData.exercises[0].questions.length > 0 &&
                <List
                  itemLayout="horizontal"
                  dataSource={[(courseExerciseData.exercises[0].questions.filter(q => q.answered === false))[0]]}
                  renderItem={(item) => (
                    <List.Item key={item.exercise_id}>
                      <GridContent>
                        <Row gutter={24} style={{width: "100%"}}>
                          <Col sm={24} xs={24}>
                            <p>
                              {item.sequence}. &nbsp;{item.description}
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
                                <div >
                                  <Container lockAxis="y" >
                                    {item.question.map((q, keyIndex) => {
                                      return (
                                        <Row align="middle" style={{marginBottom: "10px"}}>
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
                            <Row gutter={24} style={{width: "100%", marginTop: "30px"}}>
                              <Col sm={24} xs={24} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
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
                                {formatDragContainer(item, '<ans>')}
                                <br/>
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
                            <Row gutter={24} style={{width: "100%", marginTop: "30px"}}>
                              <Col sm={24} xs={24} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                        }
                        {
                          item.question_type === "FITBT" &&
                          <React.Fragment>
                            <Divider />
                            <Row gutter={24} style={{width: "100%"}}>
                              <Col sm={16} xs={16}>
                                {formatLabel(item, '<ans>', courseExerciseData.exercises[0].exercise_id)}
                              </Col>
                              <Col sm={8} xs={8} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                        }
                        {
                          item.question_type === "MULCH" &&
                          <React.Fragment>
                            <Row gutter={24} style={{width: "100%", textAlign: "center", fontSize: "25px" }}>
                              <Col sm={24} xs={24}>
                                {item.question}
                                <br/>
                                <Radio.Group onChange={onChangeRadio} value={currAnswer[0]} style={{ width: "100%", textAlign: "justify" }}>
                                  {item.choices.map(choice => (
                                    <React.Fragment>
                                      <Divider style={{ margin: "10px 0" }} />
                                      <Radio style={radioStyle} value={choice} style={{ marginLeft: "45%" }}>
                                        {choice}
                                      </Radio>
                                    </React.Fragment>
                                  ))}
                                </Radio.Group>
                              </Col>
                            </Row>
                            <Row gutter={24} style={{width: "100%", marginTop: "30px"}}>
                              <Col sm={24} xs={24} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                        }
                        {
                          item.question_type === "MULRE" &&
                          <React.Fragment>
                            <Row gutter={24} style={{width: "100%", textAlign: "center", fontSize: "25px" }}>
                              <Col sm={24} xs={24}>
                                {item.question}
                                <br/>
                                <Checkbox.Group onChange={onChangeChecked} style={{ width: "100%" }}>
                                  {item.choices.map(choice => (
                                    <React.Fragment>
                                      <Divider style={{ margin: "10px 0" }} />
                                      <Checkbox style={radioStyle} value={choice}>
                                        {choice}
                                      </Checkbox>
                                    </React.Fragment>
                                  ))}
                                </Checkbox.Group>
                              </Col>
                            </Row>
                            <Row gutter={24} style={{width: "100%", marginTop: "30px"}}>
                              <Col sm={24} xs={24} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                        }
                        {/*
                          item.question_type === "MATCH" &&
                          <React.Fragment>
                            {
                              // setCurrAnswer(item.choices)
                              currAnswer.length === 0 ? setCurrAnswer(item.choices) : console.log("currAnswer === ", currAnswer)
                            }
                            <Row gutter={24} style={{width: "100%", textAlign: "center", fontSize: "25px" }}>
                              <Col sm={24} xs={24}>
                                <div style={{ display: 'flex', justifyContent: 'stretch' }}>
                                  <div style={{
                                    marginLeft: '50px',
                                    flex: 1
                                  }}>
                                    <Container lockAxis="y" >
                                      {item.question.map(q => {
                                        return (
                                          <div style={{ border: "1px solid gray", marginBottom: "10px"}}>
                                            {q}
                                          </div>
                                        );
                                      })}
                                    </Container>
                                  </div>
                                  <div style={{
                                    marginLeft: '50px',
                                    flex: 1
                                  }}>
                                    <Container lockAxis="y" >
                                      {item.question.map(() => {
                                        return (
                                          <div style={{marginBottom: "10px"}}>
                                            <DoubleRightOutlined />
                                          </div>
                                        );
                                      })}
                                    </Container>
                                  </div>
                                  
                                  <div style={{
                                    marginLeft: '50px',
                                    flex: 1
                                  }}>
                                    <Container lockAxis="y" groupName="1" onDrop={e => setCurrAnswer(applyDrag(currAnswer, e))}>
                                      {currAnswer.map(choice => {
                                        return (
                                          <Draggable key={choice+(Math.random() * (100 - 1) + 1)}>
                                            <div className="draggable-item" style={{ border: "1px solid gray", marginBottom: "10px", "cursor": "all-scroll"}}>
                                              {choice}
                                            </div>
                                          </Draggable>
                                        );
                                      })}
                                    </Container>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={24} style={{width: "100%", marginTop: "30px"}}>
                              <Col sm={24} xs={24} style={{ textAlign: "right" }}>
                                <Button loading={loading} type="primary" shape="round" icon={<CaretRightOutlined />} size={size} onClick={()=>queryAnswer(item, {exercise_id: courseExerciseData.exercises[0].exercise_id, question_id: item.course_question_id })}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.next.button"
                                    defaultMessage="Next"
                                  /> 
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                                    */}
                      </GridContent>
                    </List.Item>
                  )}
                />
              }
              {
                courseExerciseData.exercises && courseExerciseData.exercises.length > 0 && courseExerciseData.exercises[0].answered_all === false && courseExerciseData.exercises[0].questions.length === 0 &&
                <span>
                  <FormattedMessage
                    id="pages.tutor.exerciseTest.main.no.questions"
                    defaultMessage="No questions available"
                  />
                </span>
              }
              {
                alrt.message !== "" && alrt.type !== "" &&
                <Alert message={alrt.message} type={alrt.type} />
              }
              
              {
                courseExerciseData.exercises && courseExerciseData.exercises.length > 0 &&  courseExerciseData.exercises[0].answered_all === true && 
                <React.Fragment>
                  {
                    exerciseSummary.questions && 
                    <React.Fragment>
                      <Row gutter={24}>
                        <Col span={5}>
                          <Statistic title={intl.formatMessage({
                            id: 'pages.tutor.exerciseTest.main.stats.correct',
                            defaultMessage: 'Correctly answered questions',
                          })}
                          value={exerciseSummary.score} />
                        </Col>
                        <Col span={5}>
                          <Statistic title={intl.formatMessage({
                              id: 'pages.tutor.exerciseTest.main.stats.incorrect',
                              defaultMessage: 'Incorrectly answered questions',
                            })} 
                            value={exerciseSummary.questions.length - exerciseSummary.score} />
                        </Col>
                        <Col span={5}>
                          <Statistic title={intl.formatMessage({
                              id: 'pages.tutor.exerciseTest.main.stats.timeused',
                              defaultMessage: 'Time used',
                            })} value={exerciseSummary.time_used} />
                        </Col>
                        <Col span={5}>
                          <Statistic title={intl.formatMessage({
                              id: 'pages.tutor.exerciseTest.main.stats.passed',
                              defaultMessage: 'Passed',
                            })} value={exerciseSummary.pass} />
                        </Col>
                        <Col span={4}>
                          <Statistic title={intl.formatMessage({
                              id: 'pages.tutor.exerciseTest.main.stats.total_experience',
                              defaultMessage: 'Experience',
                            })} value={exerciseSummary.total_experience} />
                        </Col>
                      </Row>

                      <br/>
                                        
                      <Row gutter={24}>
                        <Col span={24}>
                          <List
                            dataSource={exerciseSummary.questions}
                            renderItem={(item,i) => (
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
                                <div style={{ width: "60%" }}>
                                  <FormattedMessage
                                    id="pages.tutor.exerciseTest.main.list.your-answer"
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
                                    id="pages.tutor.exerciseTest.main.list.correct-answer"
                                    defaultMessage="Correct answer"
                                  />: {(item.question_type === "MATCH" || item.question_type === "MULRE" || item.question_type === "FITBD") ? item.correct_answer.join(", ") : item.correct_answer} &nbsp; 
                                </div>
                              </List.Item>
                            )}
                          >
                          </List>
                        </Col>
                      </Row>
                    </React.Fragment>
                  }
                  
                  <br/>
                  <Row gutter={24}>
                    <Col span={4}>
                      {
                        courseExerciseData.exercises && courseExerciseData.exercises.length > 0 &&  courseExerciseData.exercises[0].answered_all === true && 
                        <Button loading={loading} onClick={()=>resetExercise()} type="primary" shape="round" icon={<CaretRightOutlined />} size={size}>
                          <FormattedMessage
                            id="pages.tutor.exerciseTest.main.try-again.button"
                            defaultMessage="Try again"
                          />
                        </Button>
                      }
                    </Col>
                    <Col span={15}>
                    </Col>
                    <Col span={4}>
                    </Col>
                  </Row>
                </React.Fragment>
              }
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default ExerciseTestPage;
