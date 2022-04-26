import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Steps, Button, Card, message, Image, Typography, Collapse, List, Table, Avatar, Carousel, Modal, Form, Input, Checkbox, Radio, Upload, Space } from 'antd';
import { LeftOutlined, CaretRightOutlined, AntDesignOutlined, SmileOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import style from './style.less';
// import { colQuestions } from '@/utils/tableColumns';
import { API_URL } from '@/utils/utils';
import Highlighter from 'react-highlight-words';

const { Title, Paragraph } = Typography;

const TutorQuestionsPage: React.FC<{}> = () => {
  const [currentTableSearch, setCurrentTableSearch] = useState<string>("");
  const [tutorQuestions, setTutorQuestions] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const [activeColumn, setActiveColumn] = useState<string>("");
  const [current, setCurrent] = useState<number>(1);
  const [totalRow, setTotalRow] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const intl = useIntl();

  const queryTutorQuestions = (params) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`questions`, {
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
        setTutorQuestions(response.rows);
        setLoading(false);
        setTotalRow(response.total_rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryTutorQuestions({
      limit: pageSize,
      page: current,
      sort_type: "",
      sort_column: "",
      filter_column: "",
      filter_value: "",
      search: ""
    });
  }, []);


  const downloadQuestionTemplate = (params: { type: string; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(API_URL+`download/question-template`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setLoading(false);

        if (response.status === "Failed") {
          message.error(response.alert);
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
    return {
      token: userData.token,
      userid: userData.id
    };
  }

  const uploadProps = {
    name: 'upfile',
    action: API_URL+`upload/questions`,
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
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      queryTutorQuestions({
        limit: pageSize,
        page: current,
        sort_type: "",
        sort_column: "",
        filter_column: "",
        filter_value: "",
        search: ""
      });
    },
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    confirm();
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
    setActiveColumn('');
    setCurrentTableSearch('');
    queryTutorQuestions({
      limit: pageSize,
      page: current,
      sort_type: "",
      sort_column: "",
      filter_column: "",
      filter_value: "",
      search: ""
    });
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
    /* render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ), */ 
  });

  const colQuestions = [
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.questions.table.question_type"
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
          id="pages.tutor.questions.table.question"
          defaultMessage="QUESTION CONTENT"
        />
      ),
      dataIndex: 'question',
      key: 'question',
      ...getColumnSearchProps('question'),
      render: question => {
        if(Array.isArray(question)){
          return question.join(", ")
        } else {
          return question;
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.tutor.questions.table.choices"
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
          id="pages.tutor.questions.table.correct_answer"
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
          id="pages.tutor.questions.table.tags"
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

  const onChangeTable = (data, filter, sorter, extra) => {

    setPageSize(data.pageSize);
    setCurrent(data.current);

    let search = "";
    let isChangeFilter = false;
    let column = "";

    if(filter.choices !== null && filter.choices.length > 0){
      search = filter.choices;
      isChangeFilter = true;
      column = "choices";
    } else if(filter.correct_answer !== null && filter.correct_answer.length > 0){
      search = filter.correct_answer;
      isChangeFilter = true;
      column = "correct_answer";
    }
    
    if(filter.question !== null && filter.question.length > 0){
      search = filter.question;
      isChangeFilter = true;
      column = "question";
    } else if(filter.question_type !== null && filter.question_type.length > 0){
      search = filter.question_type;
      isChangeFilter = true;
      column = "question_type";
    } else if(filter.tags !== null && filter.tags.length > 0){
      search = filter.tags;
      isChangeFilter = true;
      column = "tags";
    }

    if(isChangeFilter) {
      setCurrentTableSearch(search);
    } else {
      search = currentTableSearch;
    }

    if(column) {
      setActiveColumn(column);
    }
    
    queryTutorQuestions({
      limit: data.pageSize,
      page: (data.current) ? data.current : 1,
      sort_type: "",
      sort_column: "",
      filter_column: (column) || activeColumn,
      filter_value: search,
      search: "",
    });
  }

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.tutor.questions.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/>
        <br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card loading={loading}>
              {
                tutorQuestions &&
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
                          <Title level={2}>
                            <FormattedMessage
                              id="pages.tutor.questions.title"
                              defaultMessage="Questions Page"
                            />
                          </Title>
                        </Typography>
                      </Col>
                    </Row>
                    <Row gutter={24} type="flex">
                      <Col sm={20} xs={24} style={{ textAlign: "left" }} >
                        <Paragraph>
                          Questions Description
                        </Paragraph>
                      </Col>
                      <Col sm={4} xs={24} style={{ textAlign: "left" }} >
                        <Upload {...uploadProps}>
                          <Button icon={<UploadOutlined />} type="primary" 
                            title={intl.formatMessage({
                              id: 'pages.tutor.questions.upload.tooltip',
                              defaultMessage: 'Upload questions',
                            })}
                          >
                            &nbsp;
                            <FormattedMessage
                              id="pages.tutor.questions.upload"
                              defaultMessage="Upload"
                            />
                          </Button>
                        </Upload>
                        <br/>
                        <Button onClick={()=>downloadQuestionTemplate({type:"csv"})} loading={loading} type="primary" icon={<DownloadOutlined />}
                          title={intl.formatMessage({
                            id: 'pages.tutor.questions.download.tooltip',
                            defaultMessage: 'Download question template',
                          })}
                        >
                          &nbsp;
                          <FormattedMessage
                            id="pages.tutor.questions.download"
                            defaultMessage="Download"
                          />
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false} loading={loading}>
              <Table
                columns={colQuestions}
                dataSource={tutorQuestions}
                pagination={{pageSize, current, total: totalRow}}
                onChange={onChangeTable}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    </GridContent>
  );
};

export default TutorQuestionsPage;
