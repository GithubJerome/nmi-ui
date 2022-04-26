import React, { useState, useRef, useEffect, useContext } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, epochToJsDate } from '@/utils/utils';
import { Col, Row, Steps, Tree, Radio, Button, Select, Card, Form, message, Progress, Typography, Input, Alert, Statistic, Table, Modal, Checkbox, Anchor, Tooltip, Switch } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EditFilled, LockOutlined, CaretRightOutlined, LikeOutlined, CheckCircleOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { API_URL } from '@/utils/utils';
import { FormInstance } from 'antd/lib/form';
import { colCourse, colCourseReq, colCourseTemp, colGroup, colStudent } from '@/utils/tableColumns';

import style from './style.less';

const { Search } = Input;
const { Title } = Typography;
const { confirm } = Modal;

const GroupsPage: React.FC<{}> = () => {
  const [groupList, setGroupListData] = useState<object[]>([]);
  const [studentList, setStudentListData] = useState<object[]>([]);
  const [managerList, setManagerListData] = useState<object[]>([]);
  const [courseList, setCourseListData] = useState<object[]>([]);

  const [currentGroups, setCurrentGroups] = useState<number>(1);
  const [totalRowGroups, setTotalRowGroups] = useState<number>(1);
  const [pageSizeGroups, setPageSizeGroups] = useState<number>(10);

  const [currentCourse, setCurrentCourse] = useState<number>(1);
  const [totalRowCourse, setTotalRowCourse] = useState<number>(1);
  const [pageSizeCourse, setPageSizeCourse] = useState<number>(10);
  const [pageSizeCourseOptns, setPageSizeCourseOptns] = useState<string[]>(["10", "20", "50", "100"]);

  const [currentTutor, setCurrentTutor] = useState<number>(1);
  const [totalRowTutor, setTotalRowTutor] = useState<number>(1);
  const [pageSizeTutor, setPageSizeTutor] = useState<number>(10);
  const [pageSizeStudentOptns, setPageSizeStudentOptns] = useState<string[]>(["10", "20", "50", "100"]);

  const [currentStudent, setCurrentStudent] = useState<number>(1);
  const [totalRowStudent, setTotalRowStudent] = useState<number>(1);
  const [pageSizeStudent, setPageSizeStudent] = useState<number>(10);
  const [pageSizeTutorOptns, setPageSizeTutorOptns] = useState<string[]>(["10", "20", "50", "100"]);

  const [addGrpLoading, setAddGrpLoading] = useState<boolean>(false);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false);
  const [courseLoading, setCourseLoading] = useState<boolean>(false);
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);

  const [groupDeleteBtnLoading, setGroupDeleteBtnLoading] = useState<boolean>(false);
  const [visibleAddGroupModal, setVisibleAddGroupModal] = useState<boolean>(false);
  const [visibleEditGroupModal, setVisibleEditGroupModal] = useState<boolean>(false);

  const [visAssCrsModal, setVisAssCrsModalModal] = useState<boolean>(false);
  const [visAssMemModal, setVisAssMemModalModal] = useState<boolean>(false);
  const [visAssTutModal, setVisAssTutModalModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string[]>([]);
  const [selectedGroups , setSelectedGroups] = useState<string[]>([]);
  const [editGroupLoading, setEditGroupLoading] = useState<boolean>(false);

  const [addToLoading, setAddToLoading] = useState<boolean>(false);
  const [courseTableSelectedRows, setCourseTableSelectedRows] = useState<any>([]);
  const [studentTableSelectedRows, setStudentTableSelectedRows] = useState<any>([]);
  const [tutorTableSelectedRows, setTutorTableSelectedRows] = useState<any>([]);

  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableSearchLoading, setTableSearchLoading] = useState<boolean>(false);

  const [updateForm] = Form.useForm();
  const intl = useIntl();

  const formRef = React.createRef<FormInstance>();

  const groupColumnAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: (groupData: any) => (
      <Tooltip placement="topLeft" title={intl.formatMessage({
        id: 'pages.manager.groups.table.edit.group',
        defaultMessage: 'Edit Group',
      })}>
        <Button size="small" icon={<EditFilled />} onClick={()=>showEditGroupModal(groupData)} />
      </Tooltip>
    )
  };

  const groupColumn = [...colGroup, groupColumnAction];

  const queryCourses = (params: { selected_ids: string; limit: number; page: number; search: string;}) => {
    const userData = getUserData();
    setCourseLoading(true);

    request
      .get(`${API_URL}course/index`, {
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
        setCourseListData(response.rows);
        setCourseLoading(false);
        setTableSearchLoading(false);
        setTotalRowCourse(response.total_rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryStudents = (params: { selected_ids: string; limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; search: string;}) => {
    const userData = getUserData();
    setStudentLoading(true);
    request
      .get(`${API_URL}user/index`, {
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
        setStudentListData(response.rows);
        setTotalRowStudent(response.total_rows);
        setStudentLoading(false);
        setTableSearchLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryManagers = (params: { selected_ids: string; limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; search: string;}) => {
    const userData = getUserData();
    setTutorLoading(true);
    request
      .get(`${API_URL}user/index`, {
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
        setManagerListData(response.rows);
        setTotalRowTutor(response.total_rows);
        setTutorLoading(false);
        setTableSearchLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryGroups = (params: { limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; }) => {
    const userData = getUserData();
    setGroupsLoading(true);

    request
      .get(`${API_URL}user-group`, {
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
        setGroupListData(response.rows);
        setTotalRowGroups(response.total_rows);
        setGroupsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const deleteSelectedGroups = (params: { user_group_ids: object }) => {
    if(selectedGroups.length > 0) {
      const userData = getUserData();
      setGroupDeleteBtnLoading(true);
      setGroupsLoading(true);

      request
      .delete(`${API_URL}user-group/delete`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {

        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }

        queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });

        setGroupDeleteBtnLoading(false);
        setGroupsLoading(false);
        setSelectedGroups([]);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }

  const updateUserGroup = (values: any) => {
    const userData = getUserData();
    
    const params = {
      "notify_managers": values.notify_managers,
      "notify_members": values.notify_members,
      "course_ids": selectedCourse.map((item:any)=>item.value),
      "student_ids": selectedStudent.map((item:any)=>item.value),
      "tutor_ids": selectedTutor.map((item:any)=>item.value),
      "user_group_id": values.user_group_id,
      "user_group_name": values.user_group_name
    }

    setEditGroupLoading(true);
    
    request
      .put(`${API_URL}user-group/update`, {
          headers: {
            token: userData.token,
            userid: userData.id
          },
          data: params
        })
      .then((response) => {
          setEditGroupLoading(false);
          setVisibleEditGroupModal(false);

          // Reset the Selected Data
          setSelectedCourse([]);
          setSelectedStudent([]);
          setSelectedTutor([]);
          
          if(response.status === "ok"){
            message.success(`${response.message}`);
          } else {
            message.error(`${response.alert}`);
          }
  
          queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });  
      })
      .catch((error) => {
          console.log(error);
      });
  }

  const addGroup = (values: any) => {
    const userData = getUserData();
    if (addGrpLoading) return;
    setAddGrpLoading(true);
    
    const params = {
      "notify_managers": values.notify_managers,
      "notify_members": values.notify_members,
      "course_ids": selectedCourse.map((item:any)=>item.value),
      "student_ids": selectedStudent.map((item:any)=>item.value),
      "tutor_ids": selectedTutor.map((item:any)=>item.value),
      "user_group_name": values.user_group_name
    }

    request
      .post(`${API_URL}user-group/create-user-group`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        setVisibleAddGroupModal(false);
        setAddGrpLoading(false);
        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }

        queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });
        
        queryCourses({ selected_ids: selectedCourse.map((item:any)=>item.value).toString(), limit: pageSizeCourse, page: currentCourse, search: tableSearch});
        queryStudents({ selected_ids: selectedStudent.map((item:any)=>item.value).toString(), limit: pageSizeStudent, page: currentStudent, sort_type: "", sort_column: "", filter_column: "role", filter_value:"student", search: tableSearch });
        queryManagers({ selected_ids: selectedTutor.toString(), limit: pageSizeTutor, page: currentTutor, sort_type: "", sort_column: "", filter_column: "role", filter_value:"tutor", search: tableSearch });
        
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const showAddGroupModal = () => {
    setVisibleAddGroupModal(true);
    setSelectedCourse([]);
    setSelectedStudent([]);
    setSelectedTutor([]);
  }

  const showEditGroupModal = (groupData: any) => {
    // Reset
    setSelectedCourse([]);
    setSelectedStudent([]);
    setSelectedTutor([]);

    let courses = [];
    let minNumCourses = 10;
    if(groupData.courses && groupData.courses.length > 0) { 
      courses = groupData.courses.map((item:any)=> {
        return {value:item.course_id, label:`${item.course_name}`}
      });
      setSelectedCourse(courses);
      if(courses.length > 10){
        minNumCourses = Math.ceil(courses.length / 10) * 10;
        setPageSizeCourseOptns([minNumCourses.toString(), "50", "100"]);
        setPageSizeCourse(minNumCourses);
      } 
    }
    queryCourses({ 
      selected_ids: courses.map((item:any)=>item.value).toString(), 
      limit: minNumCourses, 
      page: currentCourse,
      search: tableSearch
    });

    let students = [];
    let minNumStuds = 10;
    if(groupData.students && groupData.students.length > 0) { 
      students = groupData.students.map((item:any)=> {
        return {value:item.student_id, label:`${item.first_name} ${item.last_name}`}
      });
      setSelectedStudent(students);
      if(students.length > 10){
        minNumStuds = Math.ceil(students.length / 10) * 10;
        setPageSizeStudentOptns([minNumStuds.toString(), "50", "100"]);
        setPageSizeStudent(minNumStuds);
      } 
    }
    queryStudents({
      selected_ids: students.map((item:any)=>item.value).toString(),
      limit: minNumStuds, 
      page: currentStudent, 
      sort_type: "", 
      sort_column: "", 
      filter_column: "role", 
      filter_value:"student",
      search: tableSearch
    });

    let tutors = [];
    let minNumTuts = 10;
    if(groupData.tutors && groupData.tutors.length > 0) { 
      tutors = groupData.tutors.map((item:any)=> {
        return {value:item.tutor_id, label:`${item.first_name} ${item.last_name}`}
      });
      setSelectedTutor(tutors);
      if(tutors.length > 10){
        minNumTuts = Math.ceil(tutors.length / 10) * 10;
        setPageSizeTutorOptns([minNumTuts.toString(), "50", "100"]);
        setPageSizeStudent(minNumTuts);
      } 
    }
    queryManagers({
      selected_ids: tutors.map((item:any)=>item.value).toString(),
      limit: minNumTuts, 
      page: currentTutor, 
      sort_type: "", 
      sort_column: "", 
      filter_column: "role", 
      filter_value:"tutor",
      search: tableSearch
    });

    
    updateForm.setFieldsValue(groupData);
    setVisibleEditGroupModal(true);
  }

  const handleChangeGroupCrs = (val) => {
    setSelectedCourse(val);
  }
  const handleChangeGroupStd = (val) => {
    setSelectedStudent(val);
  }
  const handleChangeGroupTut = (val) => {
    setSelectedTutor(val);
  }

  const showDeleteConfirm = () => {
    if(selectedGroups.length > 0) {
      confirm({
        title: intl.formatMessage({
          id: 'pages.manager.general.modal.confirm',
          defaultMessage: 'Are you sure?',
        }),
        icon: <ExclamationCircleOutlined />,
        onOk() {
          deleteSelectedGroups({ user_group_ids: selectedGroups})
        },
        onCancel() {},
      });
    }
  }

  useEffect(() => {
    queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });

    queryCourses({ selected_ids: selectedCourse.toString(), limit: pageSizeCourse, page: currentCourse, search: tableSearch});
    queryStudents({
      selected_ids: selectedStudent.map((item:any)=>item.value).toString(),
      limit: pageSizeStudent,
      page: currentStudent,
      sort_type: "", sort_column: "", filter_column: "role", filter_value:"student",
      search: tableSearch
    });
    queryManagers({
      selected_ids: selectedStudent.toString(),
      limit: pageSizeTutor,
      page: currentTutor,
      sort_type: "", sort_column: "", filter_column: "role", filter_value:"tutor",
      search: tableSearch
    });
  }, []);

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };

  const rowTableSelectionStuds = {
    onChange: (selectedRowKeys: any) => { setStudentTableSelectedRows(selectedRowKeys); }
  };
  const rowTableSelectionCourse = {
    onChange: (selectedRowKeys: any) => { setCourseTableSelectedRows(selectedRowKeys) }
  };
  const rowTableSelectionTuts = {
    onChange: (selectedRowKeys: any) => { setTutorTableSelectedRows(selectedRowKeys); }
  };

  const rowSelectionGroups = {
    onChange: (selectedRowKeys: any) => { setSelectedGroups(selectedRowKeys); },
  };

  const onChangeGroupsTable = (data:any) => {
    setPageSizeGroups(data.pageSize);
    setCurrentGroups(data.current);
    queryGroups({limit: data.pageSize, page: data.current, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });
  }

  const onChangeCourseTable = (data:any) => {
    setPageSizeCourse(data.pageSize);
    setCurrentCourse(data.current);

    queryCourses({ selected_ids: selectedCourse.map((item:any)=>item.value).toString(), limit: data.pageSize, page: data.current, search: tableSearch });
  }

  const onChangeStudentTable = (data:any) => {
    setPageSizeStudent(data.pageSize);
    setCurrentStudent(data.current);

    queryStudents({ selected_ids: selectedStudent.map((item:any)=>item.value).toString(), limit: data.pageSize, page: data.current, sort_type: "", sort_column: "", filter_column: "role", filter_value:"student", search: tableSearch });
  }

  const onChangeTutorTable = (data:any) => {
    setPageSizeTutor(data.pageSize);
    setCurrentTutor(data.current);

    queryManagers({ selected_ids: selectedTutor.map((item:any)=>item.value).toString(), limit: data.pageSize, page: data.current, sort_type: "", sort_column: "", filter_column: "role", filter_value:"tutor", search: tableSearch });
  }

  const queryCourseDetails = (params: { selected_ids: string[]}) => {
    const userData = getUserData();
    setCourseLoading(true);

    request
      .get(`${API_URL}course/by-ids`, {
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

        if(response.rows && response.rows.length > 0) { 
          const courses = response.rows.map((item:any)=> {
            return {value:item.course_id, label:`${item.course_name}`}
          });
          setSelectedCourse(courses);
          setVisAssCrsModalModal(false);
          setAddToLoading(false); 
          setCourseLoading(false);
        }
        
      }).catch((error) => {
        console.log(error);
      });
  }

  const queryUserDetails = (params: { selected_ids: string[]}, user:string) => {
    const userData = getUserData();
    
    request
      .get(`${API_URL}user/by-ids`, {
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
        
        if(response.rows && response.rows.length > 0) { 
          const responseData = response.rows.map((item:any)=> {
            return {value:item.id, label:`${item.first_name} ${item.last_name}`}
          });

          if(user === "members") {
            setSelectedStudent(responseData);
            setVisAssMemModalModal(false);
            setAddToLoading(false); 
          } else {
            setSelectedTutor(responseData);
            setVisAssTutModalModal(false);
            setAddToLoading(false);
          }
        }

      }).catch((error) => {
        console.log(error);
      });
  }

  const showAssignModal = (modal:string) => {
    if(modal === "courses") {
      const tableSelected = selectedCourse.map((item:any)=>item.value);
      setVisAssCrsModalModal(true);
      setCourseTableSelectedRows(tableSelected);
      setCurrentCourse(1);
      queryCourses({ selected_ids: tableSelected.toString(), limit: pageSizeCourse, page: 1, search: tableSearch});
    }

    if(modal === "members") {
      const tableSelected = selectedStudent.map((item:any)=>item.value);
      setVisAssMemModalModal(true);
      setStudentTableSelectedRows(tableSelected);
      setCurrentStudent(1);
      queryStudents({ selected_ids: tableSelected.toString(), limit: pageSizeStudent, page: 1, sort_type: "", sort_column: "", filter_column: "role", filter_value:"student", search: tableSearch });
    }

    if(modal === "tutor") {
      const tableSelected = selectedTutor.map((item:any)=>item.value);
      setVisAssTutModalModal(true);
      setTutorTableSelectedRows(tableSelected);
      setCurrentTutor(1);
      queryManagers({ selected_ids: tableSelected.toString(), limit: pageSizeTutor, page: 1, sort_type: "", sort_column: "", filter_column: "role", filter_value:"tutor", search: tableSearch });
    }
  }

  const saveAssignModal = (modal:string) => {
    setAddToLoading(true); // Set the Loading to the Button to prevent multiple click
    setTableSearch(""); // Reset the Search
    if(modal === "courses") {
      if(courseTableSelectedRows.length) {
        queryCourseDetails({ selected_ids: courseTableSelectedRows.toString()});
      } else {
        setSelectedCourse([]);
        setVisAssCrsModalModal(false);
        setAddToLoading(false); 
      }

      setCurrentCourse(1);
    }

    if(modal === "members") {
      if(studentTableSelectedRows.length) {
        queryUserDetails({ selected_ids: studentTableSelectedRows.toString()}, "members");
      } else {
        setSelectedStudent([]);
        setVisAssMemModalModal(false);
        setAddToLoading(false); 
      }

      setCurrentStudent(1);
    }

    if(modal === "tutor") {
      if(tutorTableSelectedRows.length) {
        queryUserDetails({ selected_ids: tutorTableSelectedRows.toString()}, "tutor");
      } else {
        setSelectedTutor([]);
        setVisAssTutModalModal(false);
        setAddToLoading(false); 
      }

      setCurrentTutor(1);
    }
  }

  const onTableSearch = (value: string, event: any, table: string) => {
    setTableSearchLoading(true);
    setTableSearch(value);

    if(table === "courses") {
      setCurrentCourse(1);
      const tableSelected = (value) ? "" : selectedCourse.map((item:any)=>item.value).toString();
      queryCourses({ selected_ids: tableSelected, limit: pageSizeCourse, page: 1, search: value});
    }

    if(table === "students") {
      setCurrentStudent(1);
      const tableSelected = (value) ? "" : selectedStudent.map((item:any)=>item.value).toString();
      queryStudents({ selected_ids: tableSelected, limit: pageSizeStudent, page: 1, sort_type: "", sort_column: "", filter_column: "role", filter_value:"student", search: value });
    }

    if(table === "tutors") {
      setCurrentTutor(1);
      const tableSelected = (value) ? "" : selectedTutor.map((item:any)=>item.value).toString();
      queryManagers({ selected_ids: tableSelected, limit: pageSizeTutor, page: 1, sort_type: "", sort_column: "", filter_column: "role", filter_value:"tutor", search: value });
    }
  }

  const closeGroupModal = (modalKey:string) => {
    setTableSearch(""); // Reset the Search
    if(modalKey === "courses") {
      setVisAssCrsModalModal(false);
    }

    if(modalKey === "students") {
      setVisAssMemModalModal(false);
    }

    if(modalKey === "tutors") {
      setVisAssTutModalModal(false);
    }

    if(modalKey === "edit-group") {
      setVisibleEditGroupModal(false);
      // Reset the Selected Data
      setSelectedCourse([]);
      setSelectedStudent([]);
      setSelectedTutor([]);
    }
  }

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card
              style={{ minHeight: 430 }}
            >
              <Row gutter={24} type="flex">
                <Col sm={14} xs={24}>
                  <Title level={4}>
                    <FormattedMessage
                      id="pages.manager.groups.title"
                      defaultMessage="Groups"
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
                  <Button icon={<PlusOutlined />} type="primary" onClick={showAddGroupModal} style={{ marginBottom: 16, marginRight: 10 }}>
                    <FormattedMessage
                      id="pages.manager.groups.add-group.button"
                      defaultMessage="ADD GROUP"
                    />
                  </Button>
                </Col>
                <Col sm={12} xs={12} lg={12} style={{textAlign: "right"}}>
                  <Button icon={<DeleteOutlined />} type="danger" loading={groupDeleteBtnLoading} onClick={showDeleteConfirm} style={{ marginBottom: 16 }}>
                  <FormattedMessage
                      id="pages.manager.groups.del-group.button"
                      defaultMessage="DELETE GROUP"
                    />
                  </Button>
                </Col>
              </Row>
              
              <Table 
                loading={groupsLoading} 
                rowKey="user_group_id" 
                rowSelection={rowSelectionGroups} 
                dataSource={groupList} 
                columns={groupColumn}
                pagination={{
                  pageSize: pageSizeGroups, 
                  current: currentGroups, 
                  total: totalRowGroups,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeGroupsTable}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>

      <Modal
        width="50%"
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal.title',
          defaultMessage: 'Edit Group',
        })} 
        visible={visibleEditGroupModal}
        destroyOnClose
        confirmLoading={editGroupLoading}
        okText={intl.formatMessage({
          id: 'pages.manager.groups.modal.ok.button',
          defaultMessage: 'Update Group',
        })} 
        onCancel={()=> closeGroupModal("edit-group")}
        onOk={() => {
          updateForm
          .validateFields()
              .then(values => {
              updateUserGroup(values);
          })
          .catch(info => {
              console.log('Validate Failed:', info);
          });
        }}
      >
        <Form
          {...layout}
          form={updateForm}
          id="editGroup"
          name="editGroup"
          labelAlign="left"
        >
          <Form.Item
            name="user_group_id"
            hidden={true}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.name',
              defaultMessage: 'Name',
            })} 
            name="user_group_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.groups.modal.form.name.rules',
                defaultMessage: 'Please input group name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.course',
              defaultMessage: 'Course',
            })} 
            name="courses"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.course.placeholder',
                defaultMessage: 'Please select course',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeGroupCrs}
              value={selectedCourse}
            >
              {courseList.map((crs, i) => (
                <Option key={crs.course_id}>{crs.course_name}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('courses')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.course.link"
                defaultMessage="ASSIGN COURSES"
              />
            </a>
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.member',
              defaultMessage: 'Member(s)',
            })} 
            name="members"
            // rules={[{ required: true, message: 'Please select members!' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.member.placeholder',
                defaultMessage: 'Please select member',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeGroupStd}
              value={selectedStudent}
            >
              {studentList.map((stdnt: any, i) => (
                <Option key={stdnt.id}>{`${stdnt.first_name  } ${  stdnt.last_name}`}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('members')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.member.link"
                defaultMessage="ASSIGN MEMBERS"
              />
            </a>
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.tutor',
              defaultMessage: 'Tutor(s)',
            })} 
            name="tutors"
            // rules={[{ required: true, message: 'Please select tutors!' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.tutor.placeholder',
                defaultMessage: 'Please select tutor',
              })} 
              onChange={handleChangeGroupTut}
              labelInValue
              optionFilterProp="children"
              value={selectedTutor}
            >
              {managerList.map((mngr: any) => (
                <Option key={mngr.id}>{`${mngr.first_name} ${mngr.last_name}`}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('tutor')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.tutor.link"
                defaultMessage="ASSIGN TUTORS"
              />
            </a>
          </Form.Item>
          
          <Form.Item {...tailLayout} name="notify_members" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.groups.modal.form.notify-members.text"
                defaultMessage="Notify Members"
              />
            </Checkbox>
          </Form.Item>

          <Form.Item {...tailLayout} name="notify_managers" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.groups.modal.form.notify-managers.text"
                defaultMessage="Notify Managers"
              />
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal2.title',
          defaultMessage: 'Add Group',
        })}
        visible={visibleAddGroupModal}
        destroyOnClose
        onCancel={()=> {formRef.current.resetFields();setVisibleAddGroupModal(false)}}
        footer={[
          <Button form="addGroup" key="submit" htmlType="submit" loading={addGrpLoading} type="primary" >
            <FormattedMessage
              id="pages.manager.groups.modal2.ok.button"
              defaultMessage="Create"
            />
          </Button>
          ]}
      >
        <Form
          {...layout}
          id="addGroup"
          name="addGroup"
          ref={formRef}
          onFinish={addGroup}
          initialValues={{ notify_members: true, notify_managers: true }}
          labelAlign="left"
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.name',
              defaultMessage: 'Name',
            })} 
            name="user_group_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.groups.modal.form.name.rules',
                defaultMessage: 'Please input group name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.course',
              defaultMessage: 'Course',
            })} 
            name="courses"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.course.placeholder',
                defaultMessage: 'Please select course',
              })} 
              optionFilterProp="children"
              onChange={handleChangeGroupCrs}
              labelInValue
              value={selectedCourse}
            >
              {courseList.map((crs:any, i) => (
                <Option key={crs.course_id}>{crs.course_name}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('courses')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.course.link"
                defaultMessage="ASSIGN COURSES"
              />
            </a>
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.member',
              defaultMessage: 'Member(s)',
            })} 
            name="members"
            // rules={[{ required: true, message: 'Please select members!' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.member.placeholder',
                defaultMessage: 'Please select member',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeGroupStd}
              value={selectedStudent}
            >
              {studentList.map((stdnt:any, i) => (
                <Option key={stdnt.id}>{`${stdnt.first_name  } ${ stdnt.last_name}`}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('members')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.member.link"
                defaultMessage="ASSIGN MEMBERS"
              />
            </a>
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.groups.modal.form.tutor',
              defaultMessage: 'Tutor(s)',
            })} 
            name="tutors"
            // rules={[{ required: true, message: 'Please select tutors!' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.manager.groups.modal.form.tutor.placeholder',
                defaultMessage: 'Please select tutor',
              })} 
              onChange={handleChangeGroupTut}
              labelInValue
              optionFilterProp="children"
              value={selectedTutor}
            >
              {managerList.map((mngr: any, i) => (
                <Option key={mngr.id}>{`${mngr.first_name  } ${  mngr.last_name}`}</Option>
              ))}
            </Select>
            <a onClick={() => showAssignModal('tutor')}>
              <FormattedMessage
                id="pages.manager.groups.modal.form.tutor.link"
                defaultMessage="ASSIGN TUTORS"
              />
            </a>
          </Form.Item>
          
          <Form.Item {...tailLayout} name="notify_members" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.groups.modal.form.notify-members.text"
                defaultMessage="Notify Members"
              />
            </Checkbox>
          </Form.Item>

          <Form.Item {...tailLayout} name="notify_managers" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.groups.modal.form.notify-managers.text"
                defaultMessage="Notify Managers"
              />
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal3.courses.title',
          defaultMessage: 'Assign Courses',
        })}
        visible={visAssCrsModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("courses")}
        width="75%"
        footer={[
          <Button onClick={() => saveAssignModal("courses")} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.groups.modal3.courses.add.button"
                defaultMessage="Add to Group"
              />
          </Button>
          ]}
      >
        
        <Row>
          <Col sm={12} xs={24} lg={8} style={{marginBottom: 20}}>
            <Search
              placeholder=""
              allowClear
              enterButton={intl.formatMessage({
                id: 'pages.table.search',
                defaultMessage: 'Search',
              })}
              size="middle"
              loading={tableSearchLoading}
              onSearch={(value, event) => { onTableSearch(value, event, "courses") }}
            />
          </Col>
        </Row>

        <Table 
          loading={courseLoading}
          dataSource={courseList} 
          columns={colCourse} 
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: courseTableSelectedRows,
            ...rowTableSelectionCourse,

          }}
          pagination={{
            pageSize: pageSizeCourse, 
            current: currentCourse, 
            total: totalRowCourse,
            pageSizeOptions: pageSizeCourseOptns,
            showSizeChanger: true
          }}
          onChange={onChangeCourseTable}
        />
      </Modal>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal4.members.title',
          defaultMessage: 'Assign Members',
        })}
        visible={visAssMemModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("students")}
        width="75%"
        footer={[
          <Button onClick={() => saveAssignModal("members")} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.groups.modal4.members.add.button"
                defaultMessage="Add to Group"
              />
          </Button>
          ]}
      >

        <Row>
          <Col sm={12} xs={24} lg={8} style={{marginBottom: 20}}>
            <Search
              placeholder=""
              allowClear
              enterButton={intl.formatMessage({
                id: 'pages.table.search',
                defaultMessage: 'Search',
              })}
              size="middle"
              loading={tableSearchLoading}
              onSearch={(value, event) => { onTableSearch(value, event, "students") }}
            />
          </Col>
        </Row>

        <Table 
          loading={studentLoading}
          dataSource={studentList} 
          columns={colStudent} 
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: studentTableSelectedRows,
            ...rowTableSelectionStuds,
          }}
          pagination={{
            pageSize: pageSizeStudent, 
            current: currentStudent, 
            total: totalRowStudent,
            pageSizeOptions: pageSizeStudentOptns,
            showSizeChanger: true
          }}
          onChange={onChangeStudentTable}
        />
      </Modal>
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal5.tutor.title',
          defaultMessage: 'Assign Tutor',
        })}
        visible={visAssTutModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("tutors")}
        width="75%"
        footer={[
          <Button onClick={() => saveAssignModal("tutor")} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.groups.modal5.tutor.add.button"
                defaultMessage="Add to Group"
              />
          </Button>
          ]}
      >

        <Row>
          <Col sm={12} xs={24} lg={8} style={{marginBottom: 20}}>
            <Search
              placeholder=""
              allowClear
              enterButton={intl.formatMessage({
                id: 'pages.table.search',
                defaultMessage: 'Search',
              })}
              size="middle"
              loading={tableSearchLoading}
              onSearch={(value, event) => { onTableSearch(value, event, "tutors") }}
            />
          </Col>
        </Row>

        <Table 
          loading={tutorLoading}
          dataSource={managerList} 
          columns={colStudent}
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: tutorTableSelectedRows,
            ...rowTableSelectionTuts,
          }}
          pagination={{
            pageSize: pageSizeTutor, 
            current: currentTutor, 
            total: totalRowTutor,
            pageSizeOptions: pageSizeTutorOptns,
            showSizeChanger: true
          }}
          onChange={onChangeTutorTable}
        />
      </Modal>
    </GridContent>
  );
};

export default GroupsPage;
