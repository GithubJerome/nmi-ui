import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, epochToJsDate } from '@/utils/utils';
import { Col, Row, Steps, Tree, Tooltip, Popover, Radio, Button, Select, Card, Form, message, Progress, Typography, Collapse, List, Input, Alert, Statistic, Table, Modal, Checkbox, Popconfirm } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, EditFilled, LockOutlined, CaretRightOutlined, LikeOutlined, CheckCircleOutlined, PlusOutlined, ControlOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size, isNil, cloneDeep } from 'lodash';
import style from './style.less';
import { UI_URL, API_URL } from '@/utils/utils';
import { FormInstance } from 'antd/lib/form';
import { colStudent, colStudentTutorGroup } from '@/utils/tableColumns';
import SectionNavigation from '../components/SectionNavigation';
import TutorCoursesPage from '@/pages/tutor/courses';

const { Search } = Input;
const { Title, Link } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const UsersPage: React.FC<{}> = () => {
  const [selectedUsers , setSelectedUsers] = useState<object[]>([]);
  const [userList, setUserListData] = useState<object[]>([]);
  const [userRoles, setUserRoles] = useState<object[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [totalRow, setTotalRow] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [userDeleteBtnLoading, setUserDeleteBtnLoading] = useState<boolean>(false);
  const [visibleAddUserModal, setVisibleAddUserModal] = useState<boolean>(false);
  const [visibleEditUserModal, setVisibleEditUserModal] = useState<boolean>(false);
  const [editUserLoading, setEditUserLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableSearchLoading, setTableSearchLoading] = useState<boolean>(false);
  const [selectedStudentGroup, setSelectedStudentGroup] = useState<string[]>([]);
  const [selectedTutorGroup, setSelectedTutorGroup] = useState<string[]>([]);

  const [pageSizeGroup, setPageSizeGroup] = useState<number>(10);
  const [pageSizeGroupOptns, setPageSizeStdGroupOptns] = useState<string[]>(["10", "20", "50", "100"]);
  const [studentGroupList, setStudentGroupListData] = useState<object[]>([]);
  const [tutorGroupList, setTutorGroupListData] = useState<object[]>([]);
  const [groupLoading, setGroupLoading] = useState<boolean>(false);
  const [totalRowGroup, setTotalRowGroup] = useState<number>(1);
  const [currentGroup, setCurrentGroup] = useState<number>(1);
  const [currentTutorGroup, setCurrentTutorGroup] = useState<number>(1);
  const [visAssGroupModal, setVisAssGroupModal] = useState<boolean>(false);
  const [visAsTutorGroupModal, setVisAsTutorGroupModal] = useState<boolean>(false);
  const [tableSelectedStudentGroup, setTableSelectedStudentGroupRows] = useState<any>([]);
  const [tableSelectedTutorGroup, setTableSelectedTutorGroupRows] = useState<any>([]);
  const [addToLoading, setAddToLoading] = useState<boolean>(false);
  const [displayStudentGrp, setDisplayStudentGrp] = useState<boolean>(false);
  const [displayTutorGrp, setDisplayTutorGrp] = useState<boolean>(false);

  const [updateForm] = Form.useForm();
  
  const formRef = React.createRef<FormInstance>();
  const intl = useIntl();

  const userColumnExtra = {
      title: () => (
        <FormattedMessage
          id="pages.manager.users.table.last_login"
          defaultMessage="Last login date"
        />
      ),
      dataIndex: 'last_login',
      key: 'last_login',
      render: (last_login: any) => {
        if(!isNil(last_login)) {
          return epochToJsDate(last_login)
        }
        return "-";
      }
  };

  const userColumnAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: (userData: any) => (
        <Button type="primary" size="small" icon={<EditFilled />} onClick={()=>showEditUserModal(userData)} />
    )
  };

  const userColumn = [...colStudent, userColumnExtra, userColumnAction];

  const queryUserRoles = (params: { limit: number; page: number; }) => {
    const userData = getUserData();
    request
      .get(`${API_URL}role/index`, {
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

        if(response.rows.length) {
          const roles = response.rows.map((role:any) => {
            const cloneRole = cloneDeep(role);
            cloneRole.label = intl.formatMessage({
              id: `pages.user.role.${role.label}`,
              defaultMessage: role.label,
            });
            return cloneRole;
          });
          
          setUserRoles(roles);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryUsers = (params: { limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; search: string }) => {
    const userData = getUserData();
    setUsersLoading(true);
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
          let redirect = "/user/login";
          history.replace(redirect);
        }

        setTableSearchLoading(false);
        setTotalRow(response.total_rows);
        setUserListData(response.rows);
        setUsersLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const addUser = (values) => {
    const userData = getUserData();
    if (loading) return;
    setLoading(true);
    
    // return;
    const params = {
      "address": "",
      "city": "",
      "country": "",
      "email": values.email,
      "first_name": values.first_name,
      "username": values.username,
      "force_change_password": values.force_pwd_chnge,
      "is_license_renewable": true,
      "is_send_email": values.send_email,
      "language": "",
      "last_name": values.last_name,
      "middle_name": "",
      "roles": values.roles,
      "timezone": "",
      "url": window.location.origin,
      "zip_code": 0,

    }

    request
      .post(`${API_URL}user/create`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        setVisibleAddUserModal(false)
        setLoading(false);
        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }
        queryUsers({limit: pageSize, page: current, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: tableSearch });
        queryUserRoles({limit: 10, page: 1});
      })
      .catch((error) => {
        console.log(error);
      });
  }


  const deleteSelectedUsers = (params: { user_ids: object }) => {
    if(selectedUsers.length > 0) {
      const userData = getUserData();
      setUserDeleteBtnLoading(true);
      setUsersLoading(true);
      
      request
      .delete(`${API_URL}user/delete`, {
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

        queryUsers({limit: pageSize, page: current, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: tableSearch });
        queryUserRoles({limit: 10, page: 1});

        setUserDeleteBtnLoading(false);
        setUsersLoading(false);
        setSelectedUsers([]);
      })
      .catch((error) => {
        console.log(error);
      });

    }
  }

  const showDeleteConfirm = () => {
    if(selectedUsers.length > 0) {
      confirm({
        title: intl.formatMessage({
          id: 'pages.manager.general.modal.confirm',
          defaultMessage: 'Are you sure?',
        }),
        icon: <ExclamationCircleOutlined />,
        onOk() {
          deleteSelectedUsers({ user_ids: selectedUsers})
        },
        onCancel() {},
      });
    }
  }

  const updateUser  = (values) => {

    const params = {
      "account_id": values.account_id,
      "email": values.email,
      "first_name": values.first_name,
      "username": values.username,
      "last_name": values.last_name,
      "roles": values.roles,
      "student_group_ids": selectedStudentGroup.map((item:any)=>item.value),
      "tutor_group_ids": selectedTutorGroup.map((item:any)=>item.value)
    }

    const userData = getUserData();
    setEditUserLoading(true);
    
    request
    .put(`${API_URL}user/update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
    .then((response) => {
        setEditUserLoading(false);
        setVisibleEditUserModal(false)
        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }
        queryUsers({limit: pageSize, page: current, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: tableSearch });
    })
    .catch((error) => {
        console.log(error);
    });
  }

  const queryGroups = (params: { selected_ids: string; limit: number; page: number; search: string;}, group:string) => {
    const userData = getUserData();

    setGroupLoading(true);
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
          history.replace("/user/login");
        }

        if(group == "studentGroups"){

            setStudentGroupListData(response.rows);
        }
        
        if(group == "tutorGroups"){
            setTutorGroupListData(response.rows);
        }


        setTotalRowGroup(response.total_rows);
        setGroupLoading(false);
        setTableSearchLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const showEditUserModal = (userData: any) => {

    setSelectedStudentGroup([]);
    setSelectedTutorGroup([]);

    let studentGroups = [];
    let tutorGroups = [];
    let minNum = 10;
    if(userData.student_groups && userData.student_groups.length > 0) { 
      
        studentGroups = userData.student_groups.map((item:any)=> {
          return {value:item.user_group_id, label:`${item.user_group_name}`}
        });
  
        setSelectedStudentGroup(studentGroups);
        if(studentGroups.length > 10){
          minNum = Math.ceil(studentGroups.length / 10) * 10;
          setPageSizeStdGroupOptns([minNum.toString(), "50", "100"]);
          setPageSizeGroup(minNum);
        }
      }

      if(userData.tutor_groups && userData.tutor_groups.length > 0) { 
      
        tutorGroups = userData.tutor_groups.map((item:any)=> {
          return {value:item.user_group_id, label:`${item.user_group_name}`}
        });
  
        setSelectedTutorGroup(tutorGroups);
        if(tutorGroups.length > 10){
          minNum = Math.ceil(tutorGroups.length / 10) * 10;
          setPageSizeStdGroupOptns([minNum.toString(), "50", "100"]);
          setPageSizeGroup(minNum);
        }
      }
      if(userData.roles && userData.roles.length > 0){
          userData.roles.map((item:any) => {
              if(item.role_name == "student"){
                setDisplayStudentGrp(true);
              }
              if(item.role_name == "tutor"){
                setDisplayTutorGrp(true);
              }
          })
      }
      
    const additionalParams = { account_id: userData.id, roles: userData.roles.map(item=>item.role_id), 
                              student_groups: selectedStudentGroup, tutor_groups: selectedTutorGroup }
    const currentData = {
      ...userData,
      ...additionalParams
    }
    

    queryGroups({
        selected_ids: studentGroups.map((item:any)=>item.value).toString(),
        limit: minNum, 
        page: currentGroup,
        search: tableSearch
      }, "studentGroups");
    
    queryGroups({
    selected_ids: tutorGroups.map((item:any)=>item.value).toString(),
    limit: minNum, 
    page: currentTutorGroup,
    search: tableSearch
    }, "tutorGroups");

    updateForm.setFieldsValue(currentData);
    setVisibleEditUserModal(true);
  }

  const handleChangeStudentGroup = (val) => {

    setSelectedStudentGroup(val);
  }

  const handleChangeTutorGroup = (val) => {
    setSelectedTutorGroup(val);
  }

  const handleChangeRole = (val) => {

    let inRoles = [];

    if(val && val.length > 0){
        val.map((newRole:any) => {

        let index = userRoles.map(function(e) { return e.role_id; }).indexOf(newRole);
        if(index != -1 ){
            let roleName = userRoles[index].role_name;

            if(roleName == "student" || roleName == "tutor"){inRoles.push(userRoles[index].role_id);}

            if(inRoles.length == 2){
                setDisplayStudentGrp(true);
                setDisplayTutorGrp(true);
            }else{
                if(roleName == "student"){setDisplayStudentGrp(true);}else{setDisplayStudentGrp(false)}
                if(roleName == "tutor"){setDisplayTutorGrp(true);}else{setDisplayTutorGrp(false)}
            }
        }
        })
    }else{
        setDisplayTutorGrp(false);
        setDisplayStudentGrp(false);
    }

  }
  const showTableGroupsModal = (modal:string) => {
    if (modal == "studentGroup"){
        const tableSelected = selectedStudentGroup.map((item:any)=>item.value);
        setVisAssGroupModal(true);
        setTableSelectedStudentGroupRows(tableSelected);
        setCurrentGroup(1);
        queryGroups({
        selected_ids: tableSelected.toString(),
        limit: pageSizeGroup,
        page: 1,
        search: tableSearch
        }, "studentGroups")
    }
    

    if(modal === "tutorGroup") {
        const tableSelected = selectedTutorGroup.map((item:any)=>item.value);
        setVisAsTutorGroupModal(true);
        setTableSelectedTutorGroupRows(tableSelected);
        setCurrentTutorGroup(1);
        queryGroups({
        selected_ids: tableSelected.toString(),
        limit: pageSizeGroup,
        page: 1,
        search: tableSearch
    }, "tutorGroups")

  }
}

  useEffect(() => {
    queryUsers({limit: pageSize, page: current, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: tableSearch });
    queryUserRoles({limit: 10, page: 1});
  }, []);

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };

  const rowSelection = {
    onChange: selectedRowKeys => {
      setSelectedUsers(selectedRowKeys);
    },
  };

  const onChangeUserTable = (data) => {
    setPageSize(data.pageSize);
    setCurrent(data.current);
    queryUsers({limit: data.pageSize, page: data.current, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: tableSearch });
  }

  const onTableSearch = (value, event) => {
    setTableSearchLoading(true);
    setTableSearch(value);
    setCurrent(1);
    queryUsers({limit: pageSize, page: 1, sort_type: "", sort_column: "", filter_column: "", filter_value:"", search: value });
  }

  const onTableSearchGroup = (value: string, event: any, table: string) => {
    setTableSearchLoading(true);
    setTableSearch(value);

    if(table === "studentGroups") {
      setCurrentGroup(1);
      const tableSelected = (value) ? "" :  selectedStudentGroup.map((item:any)=>item.value).toString();
      queryGroups({
        selected_ids: tableSelected,
        limit: pageSizeGroup,
        page: 1,
        search: value
      }, "studentGroups");
    }

    if(table === "tutorGroups") {
      setCurrentTutorGroup(1);
      const tableSelected = (value) ? "" :  selectedTutorGroup.map((item:any)=>item.value).toString();
      queryGroups({
        selected_ids: tableSelected,
        limit: pageSizeGroup,
        page: 1,
        search: value
      }, "tutorGroups");
    }

  }

  const closeGroupModal = (modalKey:string) => {
    setTableSearch(""); // Reset the Search
    if(modalKey === "studentGroups") {
      setVisAssGroupModal(false);
    }

    if(modalKey === "tutorGroups") {
      setVisAsTutorGroupModal(false);
    }
  
  }

  const saveAsGroupModal = (modal:string) => {
    setAddToLoading(true); // Set the Loading to the Button to prevent multiple click
    setTableSearch(""); // Reset the Search
    

    if(modal == "studentGroups"){
        if(tableSelectedStudentGroup.length) {

            queryUserGroupDetails({selected_ids: tableSelectedStudentGroup.toString()}, "student");
        } else {
          setSelectedStudentGroup([]);
          setVisAssGroupModal(false);
          setAddToLoading(false); 
        }

        setCurrentGroup(1);
    }
    
    if(modal == "tutorGroups"){
        if(tableSelectedTutorGroup.length) {

            queryUserGroupDetails({selected_ids: tableSelectedTutorGroup.toString()}, "tutor");
        } else {
          setSelectedTutorGroup([]);
          setVisAsTutorGroupModal(false);
          setAddToLoading(false); 
        }

        setCurrentTutorGroup(1);
    }
  }

  const queryUserGroupDetails = (params: { selected_ids: string[]}, groupType:string) => {
    const userData = getUserData();

    request
      .get(`${API_URL}user-group/by-ids`, {
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
          const groups = response.rows.map((item:any)=> {
            return {value:item.user_group_id, label:`${item.user_group_name}`}
          });

        if(groupType == "student"){
            setSelectedStudentGroup(groups);
            setVisAssGroupModal(false);

        }
        
        if(groupType == "tutor"){
            setSelectedTutorGroup(groups);
            setVisAsTutorGroupModal(false);
            
        }

        setAddToLoading(false); 
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onChangeStudentGroupTable = (data) => {
    setPageSizeGroup(data.pageSize);
    setCurrentGroup(data.current);
    queryGroups({
        selected_ids: selectedStudentGroup.map((item:any)=>item.value).toString(),
        limit: data.pageSize,
        page: data.current,
        search: tableSearch
        }, "studentGroups");

  }

  const onChangeTutorGroupTable = (data) => {
    setPageSizeGroup(data.pageSize);
    setCurrentGroup(data.current);

    queryGroups({
      selected_ids: selectedTutorGroup.map((item:any)=>item.value).toString(),
      limit: data.pageSize,
      page: data.current,
      search: tableSearch
    }, "tutorGroups");
  }

  const rowSelectionStudentGrps = {
    onChange: (selectedRowKeys: any) => {
      setTableSelectedStudentGroupRows(selectedRowKeys);
    }
  };
  const rowSelectionTutorGrps = {
    onChange: (selectedRowKeys: any) => {
      setTableSelectedTutorGroupRows(selectedRowKeys);
    }
  };


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
                      id="pages.manager.users.title"
                      defaultMessage="USERS"
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
                  <Button icon={<PlusOutlined />} type="primary" onClick={()=>setVisibleAddUserModal(true)} style={{ marginBottom: 16, marginRight: 10 }}>
                    <FormattedMessage
                      id="pages.manager.users.add-users.button"
                      defaultMessage="ADD USER"
                    />
                  </Button>
                </Col>
                <Col sm={12} xs={12} lg={12} style={{textAlign: "right"}}>
                  <Button icon={<DeleteOutlined />} type="danger" loading={userDeleteBtnLoading} onClick={showDeleteConfirm} style={{ marginBottom: 16 }}>
                    <FormattedMessage
                      id="pages.manager.users.del-users.button"
                      defaultMessage="DELETE USER"
                    />
                  </Button>
                </Col>
                <Col sm={12} xs={24} lg={8} style={{marginBottom: 20}}>
                  <Search
                    placeholder=""
                    allowClear
                    enterButton={intl.formatMessage({
                      id: 'pages.manager.users.table.search',
                      defaultMessage: 'Search',
                    })}
                    size="middle"
                    loading={tableSearchLoading}
                    onSearch={onTableSearch}
                  />
                </Col>
              </Row>
              <Table 
                loading={usersLoading} 
                rowKey="id" 
                rowSelection={rowSelection} 
                dataSource={userList} 
                columns={userColumn} 
                pagination={{
                  pageSize: pageSize, 
                  current: current, 
                  total: totalRow,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeUserTable}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>

      <Modal
        width="50%"
        title={intl.formatMessage({
          id: 'pages.manager.users.modal.title',
          defaultMessage: 'Edit User',
        })} 
        visible={visibleEditUserModal}
        destroyOnClose={true}
        confirmLoading={editUserLoading}
        okText={intl.formatMessage({
          id: 'pages.manager.users.modal.ok.button',
          defaultMessage: 'Update',
        })} 
        onCancel={()=> { setVisibleEditUserModal(false)}}
        onOk={() => {
          updateForm
          .validateFields()
              .then(values => {
              updateUser(values);
          })
          .catch(info => {});
        }}
      >
        <Form
          {...layout}
          form={updateForm}
          id="updateUser"
          name="updateUser"
          labelAlign="left"
        >
          <Form.Item
            name="account_id"
            hidden={true}
            rules={[{ required: true }]}
          >
              <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.first_name',
              defaultMessage: 'First Name',
            })} 
            name="first_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.first_name.rules',
                defaultMessage: 'Please input your first name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.last_name',
              defaultMessage: 'Last Name',
            })} 
            name="last_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.last_name.rules',
                defaultMessage: 'Please input your last name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.username',
              defaultMessage: 'Username',
            })} 
            name="username"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.username.rules',
                defaultMessage: 'Please input your username!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.email',
              defaultMessage: 'Email',
            })} 
            name="email"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.email.rules',
                defaultMessage: 'Please input your email!',
              }) 
            }]}
          >
            <Input type="email"/>
          </Form.Item>

          <Form.Item {...tailLayout} name="roles" 
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.roles.rules',
                defaultMessage: 'Please input your roles!',
              }) 
            }]}
          >
            <Checkbox.Group options={userRoles} onChange={handleChangeRole} />
            
          </Form.Item>
            {displayStudentGrp &&
            <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.student.groups',
              defaultMessage: 'Groups',
            })} 
            name="student_groups"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder={intl.formatMessage({
                id: 'pages.manager.users.modal.form.student.groups.placeholder',
                defaultMessage: 'Please select group',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeStudentGroup}
              value={selectedStudentGroup}
            >
              {studentGroupList.map((grp, i) => (
                <Option value={grp.user_group_id} key={grp.user_group_id}>{grp.user_group_name}</Option>
              ))}
            </Select>
            <Link onClick={() => showTableGroupsModal('studentGroup')} style={{marginTop: "5px", display: "inline-block"}}>
              <FormattedMessage
                id="pages.manager.users.modal.form.student.groups.link"
                defaultMessage="ASSIGN STUDENT GROUPS"
              />
            </Link>
          </Form.Item>
            }
         
          {displayTutorGrp && 
            <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.tutor.groups',
              defaultMessage: 'Groups',
            })} 
            name="tutor_groups"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder={intl.formatMessage({
                id: 'pages.manager.users.modal.form.tutor.groups.placeholder',
                defaultMessage: 'Please select group',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeTutorGroup}
              value={selectedTutorGroup}
            >
              {tutorGroupList.map((grp, i) => (
                <Option value={grp.user_group_id} key={grp.user_group_id}>{grp.user_group_name}</Option>
              ))}
            </Select>
            <Link onClick={() => showTableGroupsModal('tutorGroup')} style={{marginTop: "5px", display: "inline-block"}}>
              <FormattedMessage
                id="pages.manager.users.modal.form.tutor.groups.link"
                defaultMessage="ASSIGN TUTOR GROUPS"
              />
            </Link>
          </Form.Item>
          }
          

        </Form>
      </Modal>

      <Modal
        width="50%"
        title={intl.formatMessage({
          id: 'pages.manager.users.modal2.title',
          defaultMessage: 'Add User',
        }) }
        visible={visibleAddUserModal}
        destroyOnClose={true}
        onCancel={()=> {formRef.current.resetFields();setVisibleAddUserModal(false)}}
        footer={[
          <Button form="addUser" key="submit" htmlType="submit" loading={loading} type="primary" >
            <FormattedMessage
              id="pages.manager.users.modal2.ok.button"
              defaultMessage="Create"
            />
          </Button>
        ]}
      >
        <Form
          {...layout}
          id="addUser"
          name="addUser"
          ref={formRef}
          onFinish={addUser}
          initialValues={{ send_email: true, force_pwd_chnge: true }}
          labelAlign="left"
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.first_name',
              defaultMessage: 'First Name',
            })} 
            name="first_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.first_name.rules',
                defaultMessage: 'Please input your first name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.last_name',
              defaultMessage: 'Last Name',
            })} 
            name="last_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.last_name.rules',
                defaultMessage: 'Please input your last name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.username',
              defaultMessage: 'Username',
            })} 
            name="username"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.username.rules',
                defaultMessage: 'Please input your username!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.users.modal.form.email',
              defaultMessage: 'Email',
            })} 
            name="email"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.email.rules',
                defaultMessage: 'Please input your email!',
              }) 
            }]}
          >
            <Input type="email"/>
          </Form.Item>

          <Form.Item {...tailLayout} name="roles" 
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.users.modal.form.roles.rules',
                defaultMessage: 'Please input your roles!',
              }) 
            }]}
          >
            <Checkbox.Group options={userRoles} />
          </Form.Item>

          <Form.Item {...tailLayout} name="send_email" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.users.modal2.form.send_email.text"
                defaultMessage="Send email with login details"
              />
            </Checkbox>
          </Form.Item>

          <Form.Item {...tailLayout} name="force_pwd_chnge" valuePropName="checked">
            <Checkbox>
              <FormattedMessage
                id="pages.manager.users.modal2.form.force_pwd_chnge.text"
                defaultMessage="Force password change"
              />
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.users.modal2.groups.title',
          defaultMessage: 'Assign Groups',
        })}
        visible={visAssGroupModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("studentGroups")}
        width="75%"
        footer={[
          <Button onClick={() => saveAsGroupModal("studentGroups")} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.users.modal2.groups.add.button"
                defaultMessage="Add to User"
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
              onSearch={(value, event) => { onTableSearchGroup(value, event, "studentGroups") }}
            />
          </Col>
        </Row>

        <Table 
          loading={groupLoading}
          dataSource={studentGroupList} 
          columns={colStudentTutorGroup} 
          rowKey="user_group_id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: tableSelectedStudentGroup,
            ...rowSelectionStudentGrps,
          }}
          pagination={{
            pageSize: pageSizeGroup, 
            current: currentGroup, 
            total: totalRowGroup,
            pageSizeOptions: pageSizeGroupOptns,
            showSizeChanger: true
          }}
          onChange={onChangeStudentGroupTable}
        />
      </Modal>
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.users.modal2.groups.title',
          defaultMessage: 'Assign Groups',
        })}
        visible={visAsTutorGroupModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("tutorGroups")}
        width="75%"
        footer={[
          <Button onClick={() => saveAsGroupModal("tutorGroups")} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.users.modal2.groups.add.button"
                defaultMessage="Add to User"
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
              onSearch={(value, event) => { onTableSearchGroup(value, event, "tutorGroups") }}
            />
          </Col>
        </Row>

        <Table 
          loading={groupLoading}
          dataSource={tutorGroupList} 
          columns={colStudentTutorGroup} 
          rowKey="user_group_id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: tableSelectedTutorGroup,
            ...rowSelectionTutorGrps,
          }}
          pagination={{
            pageSize: pageSizeGroup, 
            current: currentGroup, 
            total: totalRowGroup,
            pageSizeOptions: pageSizeGroupOptns,
            showSizeChanger: true
          }}
          onChange={onChangeTutorGroupTable}
        />
      </Modal>
    </GridContent>
  );
};

export default UsersPage;
