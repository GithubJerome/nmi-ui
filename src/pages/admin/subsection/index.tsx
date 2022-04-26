import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, Link, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Button, Card, message, Image, Typography, Collapse, List, Table, Avatar, Carousel, Modal, Form, Input, Checkbox, Radio, Upload, Select, Space, Switch } from 'antd';
import { LeftOutlined, CaretRightOutlined, AntDesignOutlined, SmileOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
import { epochToJsDate, API_URL } from '@/utils/utils';
import Divider from 'antd/lib/divider';
import { colCourseDetailsTutor } from '@/utils/tableColumns';
import { FormInstance } from 'antd/lib/form';
import TextArea from 'antd/lib/input/TextArea';
import Highlighter from 'react-highlight-words';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const TutorSubSectionPage: React.FC<{}> = () => {
  const [tutorSubSection, setTutorSubSection] = useState<object[]>([]);
  const [tutorQuestions, setTutorQuestions] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleAddExeModal, setVisibleAddExeModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [visAssQsModal, setVisAssQsModalModal] = useState<boolean>(false);
  const [hideQuestionOptn, setHideQuestionOptn] = useState<boolean>(false);
  const [tagLists, setTagLists] = useState<object[]>([]);
  
  const [currentQs, setCurrentQs] = useState<number>(1);
  const [totalRowQs, setTotalRowQs] = useState<number>(1);
  const [pageSizeQs, setPageSizeQs] = useState<number>(10);

  const formRef = React.createRef<FormInstance>();
  const intl = useIntl();

  const queryTagLists = (params) => {
    const userData = getUserData();
    request
      .get(API_URL+`tags`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryTagLists response.data == ", response.rows);
        if (response.status === "Failed") {
          message.error(response.alert);
          return;
        }
        setTagLists(response.rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryTutorQuestions = (params) => {
    const userData = getUserData();
    request
      .get(API_URL+`questions`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryTutorQuestions response.data == ", response.rows);
        if (response.status === "Failed") {
          message.error(response.alert);
          return;
        }
        setTutorQuestions(response.rows);
        setTotalRowQs(response.total_rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryTutorSubSection = () => {
    const params = getPageQuery();
    const { subsection_id, section_id } = params as { redirect: string };
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}manager/course/subsection`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          subsection_id: subsection_id,
          section_id: section_id
        }
      })
      .then((response) => {
        console.log("queryTutorSubSection response.data == ", response.children);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setTutorSubSection(response.children);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryTutorSubSection();
    queryTutorQuestions({
      limit: pageSizeQs,
      page: currentQs,
      sort_type: "",
      sort_column: "",
      filter_column: "",
      filter_value: "",
      search: ""
    });
    queryTagLists({
      limit: 100,
      page: 1
    });
  }, []);


  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };


  const downloadExerciseTemplate = () => {
    const par = getPageQuery();
    const { course_id } = par as { redirect: string };

    const params= {
      type:"csv",
      course_id
    }
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}download/exercise-template`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("downloadExerciseTemplate response.data == ", response.location);
        setLoading(false);

        if (response.status === "Failed") {
          message.error(response.alert);
          // let redirect = "/user/login";
          // history.replace(redirect);
          return;
        }

        const link = document.createElement('a');
        link.href = API_URL+response.location;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getHeaders = () => {
    const userData = getUserData();
    const par = getPageQuery();
    const { subsection_id, section_id, course_id } = par as { redirect: string };

    return {
      token: userData.token,
      userid: userData.id,
      courseid: course_id,
      sectionid: section_id,
      subsectionid: subsection_id
    };
  }

  const uploadProps = {
    name: 'upfile',
    action: `${API_URL}upload/exercise`,
    headers: getHeaders(),
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if(info.file.response.status.toLowerCase() === "failed"){
          message.error(`${info.file.response.alert}`);
        } else {
          message.success(`${info.file.response.message}`);
        }
        queryTutorSubSection();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        queryTutorSubSection();
      }
    },
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  let searchInput = null;

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={
            intl.formatMessage({
              id: `pages.tutor.questions.table.search.${dataIndex}`,
              defaultMessage: 'Search',
            })
          }
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            <FormattedMessage
              id="pages.tutor.questions.table.search"
              defaultMessage="Search"
            />
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            <FormattedMessage
              id="pages.tutor.questions.table.search.reset"
              defaultMessage="Reset"
            />
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const colQuestions = [
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.subsection.exercise.modal2.table.question_type"
          defaultMessage="QUESTION TYPE"
        />
      ),
      dataIndex: 'question_type',
      key: 'question_type',
      ...getColumnSearchProps('question_type'),
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.subsection.exercise.modal2.table.question"
          defaultMessage="QUESTION CONTENT"
        />
      ),
      dataIndex: 'question',
      key: 'question',
      ...getColumnSearchProps('question'),
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.subsection.exercise.modal2.table.choices"
          defaultMessage="QUESTION CHOICES"
        />
      ),
      dataIndex: 'choices',
      key: 'choices',
      ...getColumnSearchProps('choices'),
      render: choices => {
        if(Array.isArray(choices)){
          return choices.join(", ")
        } else {
          return choices;
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.subsection.exercise.modal2.table.correct_answer"
          defaultMessage="CORRECT ANSWER"
        />
      ),
      dataIndex: 'correct_answer',
      key: 'correct_answer',
      ...getColumnSearchProps('correct_answer'),
      render: answer => {
        if(Array.isArray(answer)){
          return answer.join(", ")
        } else {
          return answer;
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.subsection.exercise.modal2.table.tags"
          defaultMessage="TAGS"
        />
      ),
      dataIndex: 'tags',
      key: 'tags',
      ...getColumnSearchProps('tags'),
      render: tags => (
        tags.join(", ")
      )
    },
  ]

  const addExe = (values) => {
    const userData = getUserData();
    const par = getPageQuery();
    const { subsection_id, section_id, course_id } = par as { redirect: string };

    if (loading) return;
    setLoading(true);
    console.log("addExe values === ", values);
    let qTypes = [];
    if(values.shuffled){
      qTypes = values.question_types;
    }

    // return;
    const param = {
      "description": values.description || "",
      "draw_by_tag": values.draw_by_tag || false,
      "editing_allowed": true,
      "help": true,
      "instant_feedback": true,
      "moving_allowed": true,
      "number_to_draw": values.number_to_draw || 0,
      "passing_criterium": 0,
      "question_types": qTypes,
      "questions": selectedQuestions || [],
      "tags": (values.tags && typeof values.tags != "undefined") ? values.tags.split(",") : [],
      "save_seed": true,
      "seed": 0,
      "shuffled": values.shuffled || false,
      "is_repeatable": values.repeatable || false,
      "status": true,
      "text_after_end": "",
      "text_before_start": "",
      "timed_limit": 0,
      "timed_type": ""
    }

    request
      .post(API_URL+`exercise/create`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params: {
          course_id,
          section_id,
          subsection_id 
        },
        data: param
      })
      .then((response) => {
        setVisibleAddExeModal(false);
        queryTutorSubSection();
        setSelectedQuestions([]);
        if (response.status === "Failed") {
          message.error(response.alert);
          return;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const rowSelectionQuestion = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedQuestions(selectedRowKeys);
    }
  };

  const handleChangeExeQs = (val) => {
    setSelectedQuestions(val);
  }

  const onChangeTable = (data, filter, sorter, extra) => {
    setPageSizeQs(data.pageSize);
    setCurrentQs(data.current);

    let searchTxt =  "";
    let searchCol = "";
    let search = "";
    if(filter.choices !== null){
      search = filter.choices;
    } else if(filter.correct_answer !== null){
      search = filter.correct_answer;
    }
    
    if(filter.question !== null){
      search = filter.question;
    } else if(filter.question_type !== null){
      search = filter.question_type;
    } else if(filter.tags !== null){
      search = filter.tags;
    }

    queryTutorQuestions({
      limit: data.pageSize,
      page: data.current,
      sort_type: "",
      sort_column: "",
      filter_column: searchCol,
      filter_value: searchTxt,
      search: search
    });
  }

  const showAddExeModal = () => {
    setHideQuestionOptn(false);
    setVisibleAddExeModal(true);
  }

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.subsection.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                tutorSubSection &&
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
                          <Title level={3}>
                            {tutorSubSection.name}
                          </Title>
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={20} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          {tutorSubSection.description}
                        </Paragraph>
                      </Col>
                      <Col sm={4} xs={24} style={{ textAlign: "left" }} >
                        { /* <Upload {...uploadProps}>
                          <Button icon={<UploadOutlined />} type="primary" 
                            title={intl.formatMessage({
                              id: 'pages.tutor.subsection.upload.tooltip',
                              defaultMessage: 'Upload exercise',
                            })}
                          >
                            &nbsp;
                            <FormattedMessage
                              id="pages.tutor.subsection.upload"
                              defaultMessage="Upload"
                            />
                          </Button>
                        </Upload>
                        <br/>
                        <Button onClick={()=>downloadExerciseTemplate()} loading={loading} type="primary" icon={<DownloadOutlined />}
                          title={intl.formatMessage({
                            id: 'pages.tutor.subsection.download.tooltip',
                            defaultMessage: 'Download exercise template',
                          })}
                        >
                          &nbsp;
                          <FormattedMessage
                            id="pages.tutor.subsection.download"
                            defaultMessage="Download"
                          />
                        </Button> */ }
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false} loading={loading}>
              <Button icon={<PlusOutlined />} type="primary" onClick={showAddExeModal} style={{ marginBottom: 16, marginRight: 10 }}>
                <FormattedMessage
                  id="pages.tutor.subsection.exercise-add.button"
                  defaultMessage="EXERCISE"
                />
              </Button>
              <Table
                columns={colCourseDetailsTutor}
                dataSource={tutorSubSection.children}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
      <Modal
        width="50%"
        title={intl.formatMessage({
          id: 'pages.tutor.subsection.exercise.modal.title',
          defaultMessage: 'New Exercise',
        })}
        visible={visibleAddExeModal}
        destroyOnClose={true}
        onCancel={()=> {formRef.current.resetFields();setVisibleAddExeModal(false); setSelectedQuestions([])}}
        footer={[
          <Button form="addExe" key="submit" htmlType="submit" loading={loading} type="primary" >
            <FormattedMessage
              id="pages.tutor.subsection.exercise-add.button"
              defaultMessage="Create"
            />
          </Button>
        ]}
      >
        <Form
          {...layout}
          id="addExe"
          name="addExe"
          ref={formRef}
          onFinish={addExe}
          initialValues={{ 
            question_types: ["MULRE", "MATCH", "FITBT", "MULCH", "FITBD"], 
            draw_by_tag: true,
            shuffled: true,
            repeatable: false,
          }}
          labelAlign="left"
        >
          { /* <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.subsection.exercise.modal.form.exercise_number',
              defaultMessage: 'Exercise number',
            })}
            name="exercise_number"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.tutor.subsection.exercise.modal.form.exercise_number.rules',
                defaultMessage: 'Please input exercise number!' ,
              })
            }]}
          >
            <Input type="number" />
          </Form.Item> */ }

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.subsection.exercise.modal.form.description',
              defaultMessage: 'Description',
            })}
            name="description"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.tutor.subsection.exercise.modal.form.description.rules',
                defaultMessage: 'Please input description!',
              })
            }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.subsection.exercise.modal.form.draw.by.tag',
              defaultMessage: 'Draw by tag',
            })}
            name="draw_by_tag"
          >
            <Switch defaultChecked onChange={(d)=>{
              if(d){
                setSelectedQuestions([]);
                setHideQuestionOptn(false);
              } else {
                setHideQuestionOptn(true);
              }
            }} />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.subsection.exercise.modal.form.shuffled',
              defaultMessage: 'Randomized',
            })}
            name="shuffled"
          >
            <Switch defaultChecked onChange={(d)=>{
              /* if(d){
                // setSelectedQuestions([]);
                // setHideQuestionOptn(false);
              } else {
                // setHideQuestionOptn(true);
              } */
            }} />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.tutor.subsection.exercise.modal.form.repeatable',
              defaultMessage: 'Repeatable',
            })}
            name="repeatable"
          >
            <Switch  />
          </Form.Item>

          {
            hideQuestionOptn &&
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.tutor.subsection.exercise.modal.form.question',
                  defaultMessage: 'Question(s)',
                })}
                name="question"
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage({
                    id: 'pages.tutor.subsection.exercise.modal.form.question.placeholder',
                    defaultMessage: 'Please select question',
                  })}
                  optionFilterProp="children"
                  onChange={handleChangeExeQs}
                  value={selectedQuestions}
                >
                  {tutorQuestions.map((q, i) => (
                    <Option key={q.question_id}>{q.question}</Option>
                  ))}
                </Select>
                <a onClick={()=>setVisAssQsModalModal(true)}>
                  <FormattedMessage
                    id="pages.tutor.subsection.exercise.modal.form.question.select"
                    defaultMessage="SELECT QUESTIONS"
                  />
                </a>
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.tutor.subsection.exercise.modal.form.number_to_draw',
                  defaultMessage: 'Question count',
                })}
                name="number_to_draw"
                rules={[{ 
                  required: true, 
                  message: intl.formatMessage({
                    id: 'pages.tutor.subsection.exercise.modal.form.number_to_draw.rules',
                    defaultMessage: 'Please input question count!',
                  })
                }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          }

          {
            hideQuestionOptn === false &&
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.tutor.subsection.exercise.modal.form.question_types',
                  defaultMessage: 'Question type',
                })}
                name="question_types"
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage({
                    id: 'pages.tutor.subsection.exercise.modal.form.question_types.placeholder',
                    defaultMessage: 'Please select question types',
                  })}
                  defaultValue={["MULRE", "MATCH", "FITBT", "MULCH", "FITBD"]}
                >
                  <Option key="MULRE">
                    MULRE
                  </Option>
                  <Option key="MATCH">
                    MATCH
                  </Option>
                  <Option key="FITBT">
                    FITBT
                  </Option>
                  <Option key="MULCH">
                    MULCH
                  </Option>
                  <Option key="FITBD">
                    FITBD
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.tutor.subsection.exercise.modal.form.tags',
                  defaultMessage: 'Tags',
                })}
                name="tags"
              >
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  placeholder={intl.formatMessage({
                    id: 'pages.tutor.subsection.exercise.modal.form.tags.placeholder',
                    defaultMessage: 'Please select tags',
                  })}
                >
                  {
                    tagLists.map(tag => (
                      <Option key={tag.join(",")}>
                        {tag.join(", ")}
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.tutor.subsection.exercise.modal.form.number_to_draw',
                  defaultMessage: 'Question count',
                })}
                name="number_to_draw"
                rules={[{ 
                  required: true, 
                  message: intl.formatMessage({
                    id: 'pages.tutor.subsection.exercise.modal.form.number_to_draw.rules',
                    defaultMessage: 'Please input question count!',
                  })
                }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          }
        </Form>
      </Modal>
      <Modal
        title={intl.formatMessage({
          id: 'pages.tutor.subsection.exercise.modal2.title',
          defaultMessage: 'Assign Questions',
        })}
        visible={visAssQsModal}
        destroyOnClose={true}
        onCancel={()=> {setVisAssQsModalModal(false)}}
        width={"75%"}
        footer={[
          <Button onClick={()=> {setVisAssQsModalModal(false)}} loading={loading} type="primary" >
            <FormattedMessage
              id="pages.tutor.subsection.exercise.modal2.add.button"
              defaultMessage="Add to Exercise"
            />
          </Button>
          ]}
      >
        <Table 
          columns={colQuestions}
          dataSource={tutorQuestions}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedQuestions,
            ...rowSelectionQuestion,
          }}
          pagination={{pageSize: pageSizeQs, current: currentQs, total: totalRowQs}}
          onChange={onChangeTable}
        />
      </Modal>
    </GridContent>
  );
};

export default TutorSubSectionPage;
