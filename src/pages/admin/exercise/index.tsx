import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
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

const TutorExercisePage: React.FC<{}> = () => {
  const [exerciseData, setExerciseData] = useState<object[]>([]);
  const [exerciseInstruction, setExerciseInstruction] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleAddInstModal, setVisibleAddInstModal] = useState<boolean>(false);
  const [currPageNumber, setCurrPageNumber] = useState<number>(0);
  const [imageList, setImageList] = useState<object[]>([]);
  const [radioValue, setRadioValue] = useState<string>("video");

  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();

  const formRef = React.createRef<FormInstance>();
  
  const queryExerciseData = () => {
    const params = getPageQuery();
    const { exercise_id } = params as { redirect: string };
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`exercise`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          exercise_id: exercise_id,
          limit: 100,
          page: 1
        }
      })
      .then((response) => {
        console.log("queryExerciseInstruction response.data == ", response.rows);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setExerciseData(response.rows[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryExerciseInstruction = () => {
    const params = getPageQuery();
    const { exercise_id } = params as { redirect: string };
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`instruction`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          exercise_id: exercise_id
        }
      })
      .then((response) => {
        console.log("queryExerciseInstruction response.data == ", response.rows);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setExerciseInstruction(response.rows);
        setCurrPageNumber(response.rows.length);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryExerciseInstructionImgs = () => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`instruction/image/list`, {
        headers: {
          token: userData.token,
          userid: userData.id
        }
      })
      .then((response) => {
        setLoading(false);
        console.log("queryExerciseInstructionImgs response.data == ", response.instruction_images);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setImageList(response.instruction_images);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryExerciseInstruction();
    queryExerciseInstructionImgs();
    queryExerciseData();
  }, []);

  const getImgURL = (obj) => {
    if(obj.image_url && obj.image_url !== ""){
      return <img
        alt={`Instruction ${obj.page_number}`}
        src={obj.image_url}
        style={{
          height: "300px",
          margin: "auto"
        }}
      />
    } 
    
    if (obj.video_url && obj.video_url !== ""){
      return <ReactPlayer
        url={obj.video_url}
        controls
        playbackRate = {2}
        height = "300px"
        style={{
          margin: "auto"
        }}
      />
    } 
    
    if (obj.sound_url && obj.sound_url !== ""){
      return <ReactPlayer
        url={obj.sound_url}
        controls
        playbackRate = {2}
        height = "300px"
        style={{
          margin: "auto"
        }}
      />
    } 
    
    return <div style={{
      width: "100%",
      height: "300px",
      margin: "auto"
    }} />;
    
  }

  const addInst = (values) => {
    const par = getPageQuery();
    const { exercise_id } = par as { redirect: string };

    const userData = getUserData();
    if (loading) return;
    setLoading(true);
    console.log("values === ", values);
    // return;
    const params = {
      "instructions": [
        {
          "image_id": values.image_id || "",
          "page_number": currPageNumber+1,
          "sound_url": values.sound_url || "",
          "text": values.text || "",
          "video_url": values.video_url || "",
        }
      ]
    }

    request
      .post(`${API_URL}instruction/create-instruction`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params,
        params: {
          exercise_id: exercise_id
        }
      })
      .then((response) => {
        setLoading(false);
        setVisibleAddInstModal(false)
        setAlrt(({
          message: response.message || response.alert,
          type: response.status === "ok" ? "success" : "error"
        }));
        
        setTimeout(() => {
          setAlrt(({
            message: "",
            type: ""
          }));
          queryExerciseInstruction()
        }, 1500);
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };

  const onChangeRadio= e => {
    console.log('onChangeRadio checked', e.target.value);
    setRadioValue(e.target.value);
    if(e.target.value === "images"){
      queryExerciseInstructionImgs();
    }
  };

  const uploadFile = file => {
    const userData = getUserData();
    const formData = new FormData();
    formData.append('upfile', file[0]);
    console.log("file === ", file);
    request
      .post(`${API_URL}instruction/image/upload`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: formData
      })
      .then((response) => {
        setAlrt(({
          message: response.message || response.alert,
          type: response.status === "ok" ? "success" : "error"
        }));
        queryExerciseInstructionImgs();
        
        setTimeout(() => {
          setAlrt(({
            message: "",
            type: ""
          }));
        }, 1500);
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getExerciseTestUrl = () =>{
    const par = getPageQuery();
    const { exercise_id, course_id } = par as { redirect: string };
    return `/admin/exercise-test?course_id=${course_id}&exercise_id=${exercise_id}`;
  }

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.exercise.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                exerciseInstruction &&
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
                          <Title level={3}>{exerciseData.exercise_num}</Title>
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          {exerciseData.description}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            {console.log("turor-exercise === ", exerciseInstruction)}
            
            <Card bordered={false}>
              <Button icon={<PlusOutlined />} type="primary" onClick={()=>setVisibleAddInstModal(true)} style={{ marginBottom: 16, marginRight: 10 }}>
                <FormattedMessage
                  id="pages.tutor.exercise.instruction.add.button"
                  defaultMessage="ADD INSTRUCTIONS"
                />
                
              </Button>
                <a href={getExerciseTestUrl()}>
                  <Button icon={<CaretRightOutlined />} type="primary" style={{ marginBottom: 16, marginRight: 10 }}>
                    <FormattedMessage
                      id="pages.tutor.exercise.instruction.testExercise.button"
                      defaultMessage="TEST EXERCISE"
                    />
                  </Button>
                </a>

                <List
                className={style.exerciseInstructionBox}
                itemLayout="horizontal"
                size="large"
                pagination={{
                  pageSize: 1,
                }}
                dataSource={exerciseInstruction}
                renderItem={inst => (
                  <div>
                    <Card 
                      style={{
                        textAlign: 'left',
                        // background: '#364d79',
                        width: "70%",
                        margin: "auto",
                      }}
                      title={<Typography>
                        <Title level={5}>
                          <FormattedMessage
                            id="pages.tutor.exercise.instruction.list.title"
                            defaultMessage="Instruction "
                          />
                          {inst.page_number}
                        </Title>
                        </Typography>
                      } 
                    >
                      <div style={{
                        margin: "auto",
                        textAlign: 'center',
                      }}>
                        {getImgURL(inst)}
                        <br/><br/>
                        <p>{inst.text}</p>
                        <br/><br/>
                      </div>
                    </Card>
                  </div>
                )}
              />

            </Card>
          </Col>
        </Row>
      </React.Fragment>
      <Modal
        width="660px"
        title={intl.formatMessage({
          id: 'pages.tutor.exercise.instruction.modal.title',
          defaultMessage: 'Add Instruction',
        })}
        visible={visibleAddInstModal}
        destroyOnClose={true}
        onCancel={()=> {formRef.current.resetFields();setVisibleAddInstModal(false)}}
        footer={[
          <Button form="addInst" key="submit" htmlType="submit" loading={loading} type="primary" >
            <FormattedMessage
              id="pages.tutor.exercise.instruction.add.button"
              defaultMessage="Create"
            />
          </Button>
          ]}
      >
        <Form
          {...layout}
          id="addInst"
          name="addInst"
          ref={formRef}
          onFinish={addInst}
          initialValues={{ send_email: true, force_pwd_chnge: true }}
          labelAlign="left"
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.exercise.instruction.modal.text',
              defaultMessage: 'Text',
            })}
            name="text"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Radio.Group onChange={onChangeRadio} value={radioValue}>
            <Radio value="video">
              <FormattedMessage
                id="pages.tutor.exercise.instruction.modal.radio.video"
                defaultMessage="Video"
              />
            </Radio>
            <Radio value="sound">
              <FormattedMessage
                id="pages.tutor.exercise.instruction.modal.radio.sound"
                defaultMessage="Sound"
              />
            </Radio>
            <Radio value="image">
              <FormattedMessage
                id="pages.tutor.exercise.instruction.modal.radio.image"
                defaultMessage="Image"
              />
            </Radio>
          </Radio.Group>
          <br/><br/>
          {
            radioValue === "video" &&
            <Form.Item
              label={intl.formatMessage({
                id: 'pages.tutor.exercise.instruction.modal.video.url',
                defaultMessage: 'Video Url',
              })}
              name="video_url"
            >
              <Input />
            </Form.Item>
          }
          {
            radioValue === "sound" &&
            <Form.Item
              label={intl.formatMessage({
                id: 'pages.tutor.exercise.instruction.modal.sound.url',
                defaultMessage: 'Sound Url',
              })}
              name="sound_url"
            >
              <Input />
            </Form.Item>
          }
          {
            radioValue === "image" &&
            <>
              <label>
                <FormattedMessage
                  id="pages.tutor.exercise.instruction.modal.image.upload"
                  defaultMessage="Upload image"
                />
              </label>
              <input type="file" accept="image/*" onChange={event => uploadFile(event.target.files)} />
              <br/>
              <Form.Item
                name="image_id"
              >
                <Radio.Group>
                  {
                    imageList.map(img => (
                      <Radio value={img.image_id}>
                        <Image width={200} src={img.image_url} />
                      </Radio>
                    ))
                  }
                </Radio.Group>
              </Form.Item>
            </>
          }
        </Form>
      </Modal>
    </GridContent>
  );
};

export default TutorExercisePage;
