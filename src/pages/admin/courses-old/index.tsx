import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData } from '@/utils/utils';
import { Col, Row, Button, Card, message, Form, Typography, Alert, Table, Modal, Upload, Input, InputNumber, Switch, Select } from 'antd';
import { DeleteOutlined, EditFilled, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import style from './style.less';
import { API_URL } from '@/utils/utils';
import { colCoursewithStudent, colStudent } from '@/utils/tableColumns';
import SectionNavigation from '../components/SectionNavigation';

const { Title, Link } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const CoursesPage: React.FC<{}> = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(100);
    const [loading, setLoading] = useState<boolean>(false);
    const [templateUrl, setTemplateUrl] = useState<string>("");
    const [courseList, setCourseListData] = useState<object[]>([]);
    const [studentList, setStudentListData] = useState<object[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string[]>([]);
    const [coursesLoading, setCoursesLoading] = useState<boolean>(false);
    const [editCourseStatus, setEditCourseStatus] = useState<boolean>(false);
    const [editCourseLoading, setEditCourseLoading] = useState<boolean>(false);
    const [visAssStudentModal, setVisAssStudentModal] = useState<boolean>(false);
    const [visibleEditCourseModal, setVisibleEditCourseModal] = useState<boolean>(false);
    const [courseDeleteBtnLoading, setCourseDeleteBtnLoading] = useState<boolean>(false);
    
    const [alrt, setAlrt] = useState<object>({
        message: "",
        type: ""
    });
    const intl = useIntl();

    const [updateForm] = Form.useForm();

    const courseColumnAction = {
        title: 'Action',
        render: courseData => (
          <Button type="primary" size="small" icon={<EditFilled />} onClick={()=>showEditCourseModal(courseData)}></Button>
        )
    };
    
    const courseColumn = [...colCoursewithStudent, courseColumnAction];

    const queryStudents = (params: { limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; }) => {
      const userData = getUserData();
      
      request
        .get(API_URL+`user/index`, {
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
          setStudentListData(response.rows);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    const queryCourses = (params: { limit: number; page: number; }) => {
        const userData = getUserData();
        setCoursesLoading(true);

        request
          .get(API_URL+`course/index`, {
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
            setCourseListData(response.rows);
            setCoursesLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
    }

    const deleteSelectedCourses = (params: { course_ids: object }) => {
        if(selectedCourses.length > 0) {
          const userData = getUserData();
          setCourseDeleteBtnLoading(true);
          
          request
          .delete(API_URL+`course/delete`, {
            headers: {
              token: userData.token,
              userid: userData.id
            },
            data: params
          })
          .then((response) => {
            
            setAlrt(({
              message: response.message || response.alert,
              type: response.status === "ok" ? "success" : "error"
            }));
    
            setTimeout(() => {
              setAlrt(({
                message: "",
                type: ""
              }));
            }, 1500);

            queryCourses({limit, page});
            setCourseDeleteBtnLoading(false);
            setSelectedCourses([]);
          })
          .catch((error) => {
            console.log(error);
          });
        }
    }

    const queryTempUrl = (params: { type: string; }) => {
        const userData = getUserData();
        setLoading(true);
    
        request
          .get(API_URL+`download/course-template`, {
            headers: {
              token: userData.token,
              userid: userData.id
            },
            params
          })
          .then((response) => {
            console.log("queryTempUrl response.data == ", response.location);
            if (response.status === "Failed") {
              message.error(response.alert);
              let redirect = "/user/login";
              history.replace(redirect);
              return;
            }
            setTemplateUrl(response.location);
            setLoading(false);
    
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

    const showDeleteConfirm = () => {
        if(selectedCourses.length > 0) {
          confirm({
            title: intl.formatMessage({
              id: 'pages.manager.general.modal.confirm',
              defaultMessage: 'Are you sure?',
            }),
            icon: <ExclamationCircleOutlined />,
            onOk() {
              deleteSelectedCourses({ course_ids: selectedCourses})
            },
            onCancel() {},
          });
        }
    }

    const updateCourse = (values) => {
        const userData = getUserData();
        
        const params = {
          "course_id": values.course_id,
          "course_name": values.course_name,
          "description": values.description,
          "difficulty_level": values.difficulty_level,
          "requirements": values.requirements,
          "status": values.status,
          "student_ids": selectedStudent,
        }

        setEditCourseLoading(true);

        request
        .put(API_URL+`course/update`, {
            headers: {
              token: userData.token,
              userid: userData.id
            },
            data: params
          })
        .then((response) => {
            setEditCourseLoading(false);
            setVisibleEditCourseModal(false)
            setAlrt(({
                message: response.message || response.alert,
                type: response.status === "ok" ? "success" : "error"
            }));

            setTimeout(() => {
                setAlrt(({
                    message: "",
                    type: ""
                }));
            }, 1500);
            
            queryCourses({limit, page});
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
        action: API_URL+`upload/course-template`,
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
            queryCourses({limit: 100, page: 1});
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            queryCourses({limit: 100, page: 1});
          }
        },
    };

    const showEditCourseModal = (courseData) => {
      setEditCourseStatus(courseData.status) //Set the Status Switch
      setSelectedStudent([]);

      if(courseData.students && courseData.students.length > 0) { 
        const students = courseData.students.map((item: { id: string; })=>item.id);
        setSelectedStudent(students) 
      }

      updateForm.setFieldsValue(courseData);
      setVisibleEditCourseModal(true);
    }

    useEffect(() => {
      queryCourses({limit, page});
      queryStudents({limit, page, sort_type: "", sort_column: "", filter_column: "role", filter_value:"student" });
    }, []);

    const rowSelectionCourses = {
        onChange: selectedRowKeys => {
            setSelectedCourses(selectedRowKeys);
        },
    };

    const rowSelectionStuds = {
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedStudent(selectedRowKeys);
      }
    };

    const handleChangeStudents = (val) => {
      setSelectedStudent(val);
    }

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    return (
        <GridContent className={style.fontColor}>
          <React.Fragment>
            {
            alrt.message !== "" && alrt.type !== "" &&
            <Alert message={alrt.message} type={alrt.type} style={{ position: "absolute", width: "200px", textAlign: "center", marginLeft: "35%", zIndex: 2, marginTop: "10px" }} />
            }
            <Row gutter={24} type="flex">
              <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
                <Card
                style={{ minHeight: 430 }}
                >
                  <Row gutter={24} type="flex">
                    <Col sm={14} xs={24}>
                        <Title level={4}>
                          <FormattedMessage
                            id="pages.manager.courses.title"
                            defaultMessage="Courses"
                          />
                        </Title>
                    </Col>
                    <Col sm={10} xs={24} style={{textAlign: "right"}}>
                      {/* <SectionNavigation /> */}
                    </Col>
                  </Row>
                  <br/>
                  <Row gutter={24}>
                    <Col sm={12} xs={12} lg={12}>
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} type="primary" title="Upload course template">
                          <FormattedMessage
                            id="pages.manager.courses.up-courses.button"
                            defaultMessage="Upload"
                          />
                        </Button>
                      </Upload>
                      <br/>
                      <Button onClick={()=>queryTempUrl({type:"csv"})} loading={loading} title="Download course template" type="primary" icon={<DownloadOutlined />}>
                        <FormattedMessage
                          id="pages.manager.courses.dl-courses.button"
                          defaultMessage="Download"
                        />
                      </Button>
                    </Col>
                    <Col sm={12} xs={12} lg={12} style={{textAlign: "right"}}>
                      <Button icon={<DeleteOutlined />} loading={courseDeleteBtnLoading} type="danger" onClick={showDeleteConfirm} style={{ marginBottom: 16 }}>
                        <FormattedMessage
                          id="pages.manager.courses.del-courses.button"
                          defaultMessage="Delete"
                        />
                      </Button>
                    </Col>
                  </Row>
                  <Table style={{marginTop: "20px"}} rowKey="course_id" loading={coursesLoading} rowSelection={rowSelectionCourses} dataSource={courseList} columns={courseColumn} />
                </Card>
              </Col>
            </Row>
          </React.Fragment>

          <Modal
            title={intl.formatMessage({
              id: 'pages.manager.courses.modal.title',
              defaultMessage: 'Edit Course',
            })} 
            visible={visibleEditCourseModal}
            destroyOnClose={true}
            confirmLoading={editCourseLoading}
            okText={intl.formatMessage({
              id: 'pages.manager.courses.modal.ok.text',
              defaultMessage: 'Update',
            })} 
            onCancel={()=> { setVisibleEditCourseModal(false)}}
            onOk={() => {
                updateForm
                .validateFields()
                    .then(values => {
                    updateCourse(values);
                })
                .catch(info => {
                    console.log('Validate Failed:', info);
                });
            }}
          >
            <Form
              {...layout}
              form={updateForm}
              id="updateCourse"
              name="updateCourse"
              labelAlign="left"
            >
              <Form.Item
                name="course_id"
                hidden={true}
                rules={[{ required: true }]}
              >
                  <Input />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.manager.courses.modal.form.difficulty_level',
                  defaultMessage: 'Difficulty Level',
                })} 
                name="difficulty_level"
                rules={[{ 
                  required: true, 
                  message: intl.formatMessage({
                    id: 'pages.manager.courses.modal.form.difficulty_level.rules',
                    defaultMessage: 'Please input difficulty level!',
                  }) 
                }]}
              >
                <InputNumber />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.manager.courses.modal.form.course_name',
                  defaultMessage: 'Course Name',
                })}
                name="course_name"
                rules={[{ 
                  required: true, 
                  message: intl.formatMessage({
                    id: 'pages.manager.courses.modal.form.course_name.rules',
                    defaultMessage: 'Please input course name!',
                  })
                }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.manager.courses.modal.form.description',
                  defaultMessage: 'Description',
                })}
                name="description"
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.manager.courses.modal.form.requirements',
                  defaultMessage: 'Requirements',
                })}
                name="requirements"
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.manager.courses.modal.form.students',
                  defaultMessage: 'Students',
                })} 
                name="students"
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder={intl.formatMessage({
                    id: 'pages.manager.courses.modal.form.students.placeholder',
                    defaultMessage: 'Please select student',
                  })} 
                  optionFilterProp="children"
                  onChange={handleChangeStudents}
                  value={selectedStudent}
                >
                  {studentList.map((stdnt, i) => (
                    <Option value={stdnt.id} key={stdnt.id}>{stdnt.first_name + " " + stdnt.last_name}</Option>
                  ))}
                </Select>
                <Link onClick={()=>setVisAssStudentModal(true)} style={{marginTop: "5px", display: "inline-block"}}>
                  <FormattedMessage
                    id="pages.manager.courses.modal.form.students.link"
                    defaultMessage="ASSIGN STUDENTS"
                  />
                </Link>
              </Form.Item>
              <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.manager.courses.modal.form.status',
                    defaultMessage: 'Status',
                  })}
                  name="status"
              >
                  <Switch checked={editCourseStatus} onChange={(checked)=>setEditCourseStatus(checked)} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={intl.formatMessage({
              id: 'pages.manager.courses.modal2.courses.title',
              defaultMessage: 'Assign Students',
            })}
            visible={visAssStudentModal}
            destroyOnClose={true}
            onCancel={()=> {setVisAssStudentModal(false)}}
            width={"75%"}
            footer={[
              <Button onClick={()=> {setVisAssStudentModal(false)}} loading={loading} type="primary" >
                <FormattedMessage
                    id="pages.manager.courses.modal4.courses.add.button"
                    defaultMessage="Add to Course"
                  />
              </Button>
              ]}
          >
            <Table 
              dataSource={studentList} 
              columns={colStudent} 
              rowKey="id"
              rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectedStudent,
                ...rowSelectionStuds,
              }}
            />
          </Modal>

        </GridContent>
    );
};

export default CoursesPage;
