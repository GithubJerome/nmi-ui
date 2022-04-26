import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import html2canvas from "html2canvas";
import jsPdf from "jspdf";
import request from 'umi-request';
import { getUserData, getPageQuery } from '@/utils/utils';
import { Col, Row, Modal, Select, Button, Card, message, Space, Typography, Spin, Collapse, List, Table, Upload, Alert } from 'antd';
import { PlusOutlined, MailOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { isNil, size } from 'lodash';
import style from './style.less';
import { epochToJsDate, API_URL } from '@/utils/utils';

import { colTutorGroups, colTutorGroupStudents, colTutorGroupProgressTemp, colTutorStudents } from '@/utils/tableColumns';
import { Item } from 'gg-editor';

const { Option } = Select;
const { Title, Paragraph, Link, Text } = Typography;
const { Column } = Table;

const TutorDashboardPage: React.FC<{}> = () => {
  const [tutorGroupCourses, setTutorGroupCourses] = useState<object[]>([]);
  const [tutorGroupProgress, setTutorGroupProgress] = useState<object[]>([]);
  const [tutorGroups, setTutorGroups] = useState<object[]>([]);
  const [tutorGroupStudents, setTutorGroupStudents] = useState<object[]>([]);
  const [tutorGroupsLoading, setTutorGroupsLoading] = useState<boolean>(true);
  const [tutorGroupStudentsLoading, setTutorGroupStudentsLoading] = useState<boolean>(true);
  const [tutorGroupProgressLoading, setTutorGroupProgressLoading] = useState<boolean>(false);
  const [tutorStudents, setTutorStudents] = useState<object[]>([]);
  const [tutorStudentsLoading, setTutorStudentsLoading] = useState<boolean>(true);
  const [tutorGroupCoursesLoading, setTutorGroupCoursesLoading] = useState<boolean>(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isMGModalVisible, setIsMGModalVisible] = useState(false);
  const [isGPModalVisible, setIsGPModalVisible] = useState(false);
  const [activeGroupRow, setActiveGroupRow] = useState<string[]>();
  const [tutorGroupProgressColumn, setTutorGroupProgressColumn] = useState<object[]>([]);

  const [exportingStatus, setExportingStatus] = useState<boolean>(false);

  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const intl = useIntl();

  const getHeaders = () => {
    const userData = getUserData();
    return {
      token: userData.token,
      userid: userData.id
    };
  }

  const queryTutorGroupCourse = (params: { group_id: string; limit : number; page : number; }) => {
    setTutorGroupCoursesLoading(true);

    request
      .get(`${API_URL}tutor/group/course`, {
        headers: getHeaders(),
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        
        setTutorGroupCourses(response.data);
        setTutorGroupCoursesLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const queryTutorGroupProgress = (params: { group_id: string; course_id: string; }) => {
    setTutorGroupProgressLoading(true);
    
    request
      .get(`${API_URL}tutor/group/progress`, {
        headers: getHeaders(),
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }

        setTutorGroupProgress(response.data);
        setTutorGroupProgressColumn(response.exercises);

        setTutorGroupProgressLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const queryTutorGroups = (params: { limit : number; page : number; }) => {
    request
      .get(`${API_URL}tutor/groups`, {
        headers: getHeaders(),
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setTutorGroups(response.rows);
        setTutorGroupsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryTutorGroupStudents = (params: { group_id: number, limit : number; page : number; }) => {
    request
      .get(`${API_URL}tutor/group-students`, {
        headers: getHeaders(),
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        setTutorGroupStudents(response.rows);
        setTutorGroupStudentsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryTutorStudents = (params: { limit : number; page : number; }) => {
    request
      .get(`${API_URL}tutor/students`, {
        headers: getHeaders(),
        params
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        setTutorStudents(response.rows);
        setTutorStudentsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryTutorGroups({limit: 100, page: 1});
    queryTutorStudents({limit: 100, page: 1});
  }, []);

  const expandedRowGroupRender = (record, index, indent, expanded) => {
    if(expanded) {
      return <Table columns={colTutorGroupStudents} loading={tutorGroupStudentsLoading} dataSource={tutorGroupStudents} pagination={false} />;
    }
  };

  const onExpandRowGroup = (isExpanded, record) => {
      setTutorGroupStudents([]);
      setTutorGroupStudentsLoading(true);
      setActiveGroupRow(isExpanded ? record.key : undefined)

      if(isExpanded) {
        const { user_group_id } = record;
        queryTutorGroupStudents({ group_id: user_group_id, limit: 100, page: 1});
      }
  }

  const showMonitorGroup = (groupId: string) => {
    setIsMGModalVisible(true);
    setSelectedGroupId(groupId);
    queryTutorGroupCourse({group_id: groupId, limit: 100, page: 1});
  }

  const showTutorGroupProgress = (courseId: string, groupId: string) => {
    if(courseId) {
      setIsGPModalVisible(true);
      setTutorGroupProgress([]);
      setTutorGroupProgressColumn([]);
      queryTutorGroupProgress({group_id: groupId, course_id: courseId});
    }
  }

  const handleExportJPG = () => {
    setExportingStatus(true);
    
    html2canvas(document.getElementById("group_progress_table").getElementsByTagName('table')[0])
    .then((canvas) => {
      const link = document.createElement("a");
      const imgData = canvas.toDataURL("image/png");
      link.href = imgData;
      link.download = `${selectedCourseId}.jpg`;
      document.body.appendChild(link);

      // simulate click
      link.click();

      // remove the link when done
      document.body.removeChild(link);
      setExportingStatus(false);
    });
  }

  const rowSelectionGroups = {
    onChange: selectedRowKeys => {
      // setSelectedUsers(selectedRowKeys);
    },
  };

  const rowSelectionStudents = {
    onChange: (selectedRowKeys) => {}
  }

  const selectMonitorGroupCourse = (value: any) => {
    setSelectedCourseId(value);
  }

  const colTutorGroupsAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    dataIndex: 'user_group_id', 
    key: 'user_group_id',
    render: (user_group_id: string) => (
      <Button type="primary" size="small" onClick={()=>showMonitorGroup(user_group_id)}><FormattedMessage
        id="pages.tutor.btn.monitor.group"
        defaultMessage="Monitor group"
      /></Button>
    )
  };

  const colTutorGroupsColumn = [...colTutorGroups, colTutorGroupsAction];

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Row gutter={24} type="flex">
            <Col sm={16} xs={24} style={{ marginBottom: 24 }}>
              <Card style={{ marginBottom: 20 }}>
                <Row gutter={24} wrap={false}>
                  <Col flex="none">
                    <Title level={4}>
                      <FormattedMessage
                        id="pages.tutor.my-groups"
                        defaultMessage="My Groups"
                      />
                    </Title>
                  </Col>
                  <Col flex="auto">
                    <Space size="middle">
                      <Button type="primary" icon={<PlusOutlined />} size="middle">
                        <FormattedMessage
                          id="pages.tutor.assignment"
                          defaultMessage="Assignment"
                        />
                      </Button>
                      <Button size="middle" icon={<MailOutlined style={{color:"#096dd9"}} />} />
                    </Space>
                  </Col>
                </Row>
                <Row gutter={24} type="flex" style={{marginTop: "10px"}}>
                  <Col sm={24} xs={24}>
                    <Table rowSelection={{
                      type: 'checkbox',
                      ...rowSelectionGroups,
                    }}
                    loading={tutorGroupsLoading}
                    className={style.tableExpandableL2}
                    expandIconColumnIndex={1}
                    onExpand={onExpandRowGroup}
                    expandedRowKeys={[activeGroupRow]}
                    expandedRowRender={expandedRowGroupRender}
                    pagination={{position:["bottomCenter"]}} dataSource={tutorGroups} columns={colTutorGroupsColumn} />
                  </Col>
                </Row>
              </Card>

              <Card style={{ marginBottom: 20 }}>
                <Row gutter={24} wrap={false}>
                  <Col flex="none">
                    <Title level={4}>
                      <FormattedMessage
                        id="pages.tutor.my-students"
                        defaultMessage="My Students"
                      />
                    </Title>
                  </Col>
                  <Col flex="auto">
                    <Space size="middle">
                      <Button type="primary" icon={<PlusOutlined />} size="middle">
                        <FormattedMessage
                          id="pages.tutor.assignment"
                          defaultMessage="Assignment"
                        />
                      </Button>
                      <Button size="middle" icon={<MailOutlined style={{color:"#096dd9"}} />} />
                    </Space>
                  </Col>
                </Row>

                <Row gutter={24} type="flex" style={{marginTop: "10px"}}>
                  <Col sm={24} xs={24}>
                    <Table rowSelection={{
                      type: 'checkbox',
                      ...rowSelectionStudents,
                    }}
                    loading={tutorStudentsLoading}
                    className={style.tableExpandableL2}
                    pagination={{position:["bottomCenter"]}} dataSource={tutorStudents} columns={colTutorStudents} />
                  </Col>
                </Row>

              </Card>
            </Col>
            <Col sm={8} xs={24} style={{ marginBottom: 24 }}>
              <Card
                style={{ minHeight: 430 }}
              >
                <Row gutter={24} type="flex">
                  <Col sm={24} xs={24}>
                    <Title level={4}>
                      <FormattedMessage
                        id="pages.tutor.alerts"
                        defaultMessage="Alerts"
                      />
                    </Title>
                    Functionality work in progress
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Modal title={intl.formatMessage({
              id: 'pages.tutor.modal.courses',
              defaultMessage: 'Courses',
            })} 
            visible={isMGModalVisible}
            destroyOnClose
            width={400}
            onOk={() => {showTutorGroupProgress(selectedCourseId, selectedGroupId)}} 
            onCancel={() => {
              setSelectedCourseId("");
              setIsMGModalVisible(false);
            }}
            zIndex={1001}
          >
            <Spin spinning={tutorGroupCoursesLoading}>
              {tutorGroupCourses && !isNil(tutorGroupCourses) && 
              <Select defaultActiveFirstOption={false} style={{ width: "100%" }} onChange={selectMonitorGroupCourse}>
                {tutorGroupCourses.map((course:any) => {
                return <Option value={course.course_id}>{course.course_name}</Option>
                })}
              </Select>
              }
              {isNil(tutorGroupCourses) &&
              <FormattedMessage
                id="pages.tutor.no.group.courses"
                defaultMessage="No courses available"
              />
              }
            </Spin>
          </Modal>

          <Modal title={intl.formatMessage({
              id: 'pages.tutor.modal.group.progress',
              defaultMessage: 'Group Progress',
            })} 
            footer={[
              <Button type="primary" style={{marginRight: 10}} loading={exportingStatus} disabled={tutorGroupProgressLoading} onClick={handleExportJPG}>
                <FormattedMessage
                  id="pages.tutor.modal.group.progress.download"
                  defaultMessage="Download progress"
                />
              </Button>
            ]}
            visible={isGPModalVisible}
            onCancel={() => {
              setIsGPModalVisible(false);
            }}
            destroyOnClose
            width={1000}
            zIndex={1002}
            >
            {tutorGroupProgressColumn && 
              <Table 
              id="group_progress_table"
              pagination={{
                hideOnSinglePage: true
              }}
              scroll={{ x: 500}}
              bordered
              dataSource={tutorGroupProgress} loading={tutorGroupProgressLoading} className={style.tutorProgressTable}>
                <Column title={intl.formatMessage({
                  id: 'pages.tutor.table.firstname',
                  defaultMessage: 'First Name',
                })}
                dataIndex="first_name" fixed width={150} key="first_name"
                render={(first_name) => {
                  return {
                    props: {
                      className: 'td-field',
                    },
                    children: (
                      <>{first_name}</>
                    )
                  }
                }}
                />
                <Column title={intl.formatMessage({
                  id: 'pages.tutor.table.lastname',
                  defaultMessage: 'Last Name',
                })} 
                dataIndex="last_name" fixed width={150} key="last_name"
                render={(last_name) => {
                  return {
                    props: {
                      className: 'td-field',
                    },
                    children: (
                      <>{last_name}</>
                    )
                  }
                }}
                />
                { tutorGroupProgressColumn.map((col: any, colIndex:any) => {
                  return <Column title={col.exercise_number} width={70} dataIndex="exercises" render={(exercises) => { 
                    if(exercises[colIndex]) {
                      return {
                        props: {
                          className: `${exercises[colIndex].status}`,
                        },
                        children: (
                          <>
                            {exercises[colIndex].status === "passed" && <CheckOutlined />}
                            {exercises[colIndex].status === "failed" && <CloseOutlined />}
                          </>
                        )
                      }
                    }
                    return null;
                  }
                  } />
                }) }
              </Table>
            }
          </Modal>

      </React.Fragment>
    </GridContent>
  );
};

export default TutorDashboardPage;
