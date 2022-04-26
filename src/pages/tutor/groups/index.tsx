import React, { useState, useRef, useEffect, useContext } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, epochToJsDate } from '@/utils/utils';
import { Col, Row, Steps, Tree, Radio, Button, Select, Card, Form, message, Progress, Typography, Input, Alert, Statistic, Table, Modal, Checkbox, Anchor, Tooltip, Switch } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EditFilled, LockOutlined, CaretRightOutlined, LikeOutlined, CheckCircleOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import style from './style.less';
import { API_URL } from '@/utils/utils';
import { FormInstance } from 'antd/lib/form';
import { colCourse, colCourseReq, colCourseTemp, colGroup, colStudent } from '@/utils/tableColumns';

const { Title, Link } = Typography;
const { confirm } = Modal;

const GroupsPage: React.FC<{}> = () => {
  const [groupList, setGroupListData] = useState<object[]>([]);
  const [courseReqList, setCourseReqListData] = useState<object[]>([{
    sections: []
  }]);

  const [currentGroups, setCurrentGroups] = useState<number>(1);
  const [totalRowGroups, setTotalRowGroups] = useState<number>(1);
  const [pageSizeGroups, setPageSizeGroups] = useState<number>(10);
  const [expandedData, setExpandedData] = useState<object>([]);
  
  const [courseReqLoading, setCourseReqLoading] = useState<boolean>(false);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

  const [visCrsReqModal, setVisCrsReqModalModal] = useState<boolean>(false);

  const intl = useIntl();

  const groupCourseColAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: courseData => (
      <Tooltip placement="topLeft" title="Lock/Unlock contents"><Button size="small" icon={<SettingOutlined />} onClick={()=>showLockUnlickGroupModal(courseData)}></Button></Tooltip>
    )
  };


  const groupCourseColumn = [...colCourseTemp, groupCourseColAction];

  const saveLockUnlockGroup = () => {
    const userData = getUserData();
    if (courseReqLoading) return;
    setCourseReqLoading(true);
    const params = {
      "data": courseReqList[0]
    };
    
    request
      .put(`${API_URL}tutor/course-requirements-update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        setCourseReqLoading(false);
        setVisCrsReqModalModal(false)
        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }
        queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });  
        setExpandedData([]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryCourseReq = (params: { course_id: string; group_id: string; }) => {
    const userData = getUserData();
    setCourseReqLoading(true);

    request
      .get(`${API_URL}tutor/course-requirements`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryCourseReq response.data == ", response.data);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setCourseReqListData([response.data]);
        setCourseReqLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryGroups = (params: { limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; }) => {
    const userData = getUserData();
    setGroupsLoading(true);

    request
      .get(API_URL+`tutor/group-table`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        console.log("queryGroups response.data == ", response.rows);
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

  const showLockUnlickGroupModal = (courseData) => {
    queryCourseReq({
      course_id: courseData.course_id,
      group_id: courseData.user_group_id
    });
    setVisCrsReqModalModal(true);
  }

  useEffect(() => {
    queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });
  }, []);

  const onChangeGroupsTable = (data) => {
    setPageSizeGroups(data.pageSize);
    setCurrentGroups(data.current);

    queryGroups({limit: pageSizeGroups, page: currentGroups, sort_type: "", sort_column: "", filter_column: "", filter_value:"" });
  }

  const saveExpanded = (expanded, record) => {
    const keys = [];
    if(expanded){
        keys.push(record.subsection_id);
    }

    setExpandedData(keys);
  }

  const handleSave = (row) => {
    const newData = [...courseReqList];
    
    if(row.section_id) {
      for (let i = 0; i < newData[0].sections.length; i++) {
        const sec = newData[0].sections[i];
        if(row.section_id === sec.section_id){
          sec.is_lock = row.is_lock;

          // Change the Switch of Sub Section and Exercises
          for (let j = 0; j < sec.subsections.length; j++) {
            const subsec = sec.subsections[j];
            subsec.is_lock = sec.is_lock;

            for (let h = 0; h < subsec.exercises.length; h++) {
              const exec = subsec.exercises[h];
              exec.is_lock = subsec.is_lock;
            }
          }

        }
      }
    } else if(row.subsection_id) {
      for (let i = 0; i < newData[0].sections.length; i++) {
        const sec = newData[0].sections[i];
        for (let j = 0; j < sec.subsections.length; j++) {
          const subsec = sec.subsections[j];
          if(row.subsection_id === subsec.subsection_id){
            subsec.is_lock = row.is_lock;

            // Change the Switch of Exercises
            for (let h = 0; h < subsec.exercises.length; h++) {
              const exec = subsec.exercises[h];
              exec.is_lock = subsec.is_lock;
            }
          }
        }
      }
    } else if(row.exercise_id) {
      
      for (let i = 0; i < newData[0].sections.length; i++) {
        const sec = newData[0].sections[i];
        for (let j = 0; j < sec.subsections.length; j++) {
          const subsec = sec.subsections[j];
          for (let h = 0; h < subsec.exercises.length; h++) {
            const exec = subsec.exercises[h];
            if(row.exercise_id === exec.exercise_id){
              exec.is_lock = row.is_lock;
            }
          }
        }
      }
    }
    setCourseReqListData(newData);
  };

  const EditableContext = React.createContext<FormInstance<any> | null>(null);
  interface EditableRowProps {
    index: number;
  }
  const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
  }
  const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const form = useContext(EditableContext)!;
  
    useEffect(() => {
      
    }, [editing]);
  
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };
  
    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
  
    let childNode = children;
    if (editable) {
      childNode = (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
            <Switch defaultChecked={record.is_lock} onChange={save} />
        </Form.Item>
      );
    }
  
    return <td {...restProps}>{childNode}</td>;
  };
  type EditableTableProps = Parameters<typeof Table>[0];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = colCourseReq.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });
  type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

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
              
              <Table 
                loading={groupsLoading} 
                rowKey="user_group_id" 
                dataSource={groupList} 
                columns={colGroup}
                pagination={{
                  pageSize: pageSizeGroups, 
                  current: currentGroups, 
                  total: totalRowGroups,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeGroupsTable}
                expandable={{
                  expandedRowRender: record => 
                  <Table 
                    rowKey="courses" 
                    dataSource={record.courses} 
                    columns={groupCourseColumn} 
                    pagination={false}
                  />,
                  rowExpandable: record => record.courses,
                }}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal6.courses.title',
          defaultMessage: 'Lock/Unlock content',
        })}
        visible={visCrsReqModal}
        destroyOnClose
        onCancel={()=> {setVisCrsReqModalModal(false)}}
        width={"75%"}
        footer={[
          <Button onClick={()=> {saveLockUnlockGroup()}} type="primary" >
            <FormattedMessage
                id="pages.manager.groups.modal6.courses.add.button"
                defaultMessage="Save"
              />
          </Button>
          ]}
      >
       <Table 
          loading={courseReqLoading}
          dataSource={courseReqList[0].sections}
          components={components}
          rowKey="section_id"
          columns={columns as ColumnTypes}
          pagination={false}
          expandable={{
            expandedRowRender: record => 
            <Table 
              dataSource={record.subsections} 
              showHeader={false}
              rowKey="subsection_id"
              expandedRowKeys={expandedData}
              onExpand={saveExpanded}
              components={components}
              columns={columns as ColumnTypes}
              pagination={false}
              expandable={{
                expandedRowRender: record => 
                <Table 
                  showHeader={false}
                  dataSource={record.exercises} 
                  components={components}
                  columns={columns as ColumnTypes}
                  pagination={false}
                  rowKey="exercise_id"
                />,
                rowExpandable: record => record.exercises,
              }}
            />,
            rowExpandable: record => record.subsections,
          }}
        />
      </Modal>
    </GridContent>
  );
};

export default GroupsPage;
