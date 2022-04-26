import React, { useState, useEffect, useContext } from 'react';
import { FormattedMessage, history, useIntl, getLocale } from 'umi';
import request from 'umi-request';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { getUserData, API_URL } from '@/utils/utils';
import { Col, Row, Checkbox, Steps, Button, Card, message, Space, Typography, Table, Avatar, Upload, Alert, Modal, Form, Input, InputNumber, Select, Switch, Tooltip, Radio, Image } from 'antd';
import { LeftOutlined, MenuOutlined, VideoCameraAddOutlined, AntDesignOutlined, DownloadOutlined, UploadOutlined, DeleteOutlined, ExclamationCircleOutlined, EditFilled, SettingOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size, isNil, cloneDeep } from 'lodash';
import { colAdminCourse, colCourseVideo, colCourseSubVideo, colCourseReq2, colStudent, colUserGroup, colVideo } from '@/utils/tableColumns';
import { FormInstance } from 'antd/es/form';
import arrayMove from 'array-move';
import style from './style.less';

const { Title, Paragraph, Link } = Typography;
const { Option } = Select;
const { TextArea, Search } = Input;
const { confirm } = Modal;
const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

const SortableItem = sortableElement(props => <tr {...props} />);
const SortableContainer = sortableContainer(props => <tbody {...props} />);

interface CourseVideoItem {
  key: string;
  name: string;
  videos: string;
}

const AdminCoursesPage: React.FC<{}> = () => {
  const selectedLang = getLocale();
  const [adminCouseData, setAdminCourseData] = useState<object[]>([]);
  const [courseVideoData, setCourseVideoData] = useState<object[]>([]);
  const [courseReqList, setCourseReqListData] = useState<object[]>([{
    sections: []
  }]);
  const [courseReqLoading, setCourseReqLoading] = useState<boolean>(false);
  const [addToLoading, setAddToLoading] = useState<boolean>(false);

  const [dlBtnLoading, setDlBtnLoading] = useState<boolean>(false);
  const [currentCourse, setCurrentCourse] = useState<number>(1);
  const [totalRowCourse, setTotalRowCourse] = useState<number>(1);
  const [pageSizeCourse, setPageSizeCourse] = useState<number>(10);
  const [currentStudent, setCurrentStudent] = useState<number>(1);
  const [totalRowStudent, setTotalRowStudent] = useState<number>(1);
  const [pageSizeStudent, setPageSizeStudent] = useState<number>(10);
  const [pageSizeStudentOptns, setPageSizeStudentOptns] = useState<string[]>(["10", "20", "50", "100"]);

  const [currentGroup, setCurrentGroup] = useState<number>(1);
  const [totalRowGroup, setTotalRowGroup] = useState<number>(1);
  const [pageSizeGroup, setPageSizeGroup] = useState<number>(10);
  const [pageSizeGroupOptns, setPageSizeGroupOptns] = useState<string[]>(["10", "20", "50", "100"]);

  const [expandedData, setExpandedData] = useState<object[]>([]);

  const [tableSelectedRows, setTableSelectedRows] = useState<any>([]);
  const [tableSelectedGroupRows, setTableSelectedGroupRows] = useState<any>([]);
  const [deleteQuestions, setDeleteQuestions] = useState<boolean>(true);
  const [studentList, setStudentListData] = useState<object[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string[]>([]);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(false);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [editCourseStatus, setEditCourseStatus] = useState<boolean>(false);
  const [editCourseLoading, setEditCourseLoading] = useState<boolean>(false);
  const [visAssStudentModal, setVisAssStudentModal] = useState<boolean>(false);

  const [groupList, setGroupListData] = useState<object[]>([]);
  const [groupLoading, setGroupLoading] = useState<boolean>(false);
  const [visAssGroupModal, setVisAssGroupModal] = useState<boolean>(false);
  const [visibleEditCourseModal, setVisibleEditCourseModal] = useState<boolean>(false);
  const [courseDeleteBtnLoading, setCourseDeleteBtnLoading] = useState<boolean>(false);
  const [visCrsReqModal, setVisCrsReqModalModal] = useState<boolean>(false);
  const [visCrsVideoModal, setVisCrsVideoModal] = useState<boolean>(false);
  const [videoCourseLoading, setVideoCourseLoading] = useState<boolean>(false);

  const [visibleDeleteCourseModal, setVisibleDeleteCourseModal] = useState<boolean>(false);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState<boolean>(false);

  const [videos, setVideos] = useState<object[]>([]);
  const [videosDataLoading, setVideosDataLoading] = useState<boolean>(false);
  const [visEditCourseVideoModal, setVisEditCourseVideoModal] = useState<boolean>(false);
  const [videoCurrent, setVideoCurrent] = useState<number>(1);
  const [videoTotalRow, setVideoTotalRow] = useState<number>(1);
  const [videoPageSize, setVideoPageSize] = useState<number>(10);
  const [videoTableSelectedRows, setVideoTableSelectedRows] = useState<any>([]);
  const [addCourseVideoBtnLoading, setAddCourseVideoBtnLoading] = useState<boolean>(false);
  const [currentEditingCourseKey, setCurrentEditingCourseKey] = useState('');
  const [editingCourseVideo, setEditingCourseVideo] = useState<object>({});
  const [repeatableSwitchAllStatus, setRepeatableSwitchAllStatus] = useState<boolean>(false);
  const [gradeLockingSwitchAllStatus, setGradeLockingSwitchAllStatus] = useState<boolean>(false);

  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableSearchLoading, setTableSearchLoading] = useState<boolean>(false);

  const intl = useIntl();
  const [updateForm] = Form.useForm();

  const [imageList, setImageList] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const queryVideos = (params: { limit: number; page: number;}) => {
    const userData = getUserData();
    setVideosDataLoading(true);
    
    request
      .get(`${API_URL}videos`, {
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
        } else {
          setVideoTotalRow(response.total_rows);
          setVideos(response.rows);
        }

        setVideosDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryVideoCourse = (params: { course_id: string;}) => {
    const userData = getUserData();
    setVideoCourseLoading(true);

    request
      .get(`${API_URL}video/course`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setCourseVideoData(response.data);
        setVideoCourseLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const querySaveCourseVideo = (course: any) => {
    const userData = getUserData();
    setAddCourseVideoBtnLoading(true);
    
    const body = {
      "video_ids": (videoTableSelectedRows.length > 0) ? videoTableSelectedRows : [],
    }

    let params; let apiPath = "";
    if(course.type === "subsection") {
      params = {
        subsection_id: course.key
      }
      apiPath = `${API_URL}video/subsection/create`;
    } else {
      params = {
        exercise_id: course.key
      }
      apiPath = `${API_URL}video/exercise/create`;
    }

    if(params && apiPath) {
      request
        .post(apiPath, {
          headers: {
            token: userData.token,
            userid: userData.id
          },
          params,
          data: body
        })
        .then((response) => {
          if (response.status === "Failed") {
            message.error(response.alert);
            // history.replace("/user/login");
          } else {
            setVisEditCourseVideoModal(false);
            setAddCourseVideoBtnLoading(false);
          }
          queryVideoCourse({course_id: currentEditingCourseKey});
        })
        .catch((error) => {
          console.log(error);
        }); 
    }
  }

  const queryCourseReq = (params: { course_id: string; group_id: string; }) => {
    const userData = getUserData();
    setCourseReqLoading(true);

    request
      .get(`${API_URL}manager/course-requirements`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setCourseReqListData([response.data]);
        setCourseReqLoading(false);

        if(response.data) {
          setRepeatableSwitchAllStatus(response.data.is_repeatable);
          setGradeLockingSwitchAllStatus(response.data.grade_locking);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryAdminCourse = (params: { limit : number; page : number; }) => {
    const userData = getUserData();
    setCoursesLoading(true);

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
        setAdminCourseData(response.rows);
        setCoursesLoading(false);
        setTotalRowCourse(response.total_rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const saveLockUnlockGroup = () => {
    const userData = getUserData();
    if (courseReqLoading) return;
    setCourseReqLoading(true);
    const params = {
      "data": courseReqList[0]
    };
    
    request
      .put(`${API_URL}manager/course-requirements-update`, {
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
        queryAdminCourse({limit: pageSizeCourse, page: currentCourse});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const showLockUnlickGroupModal = (courseData:any) => {
    queryCourseReq({
      course_id: courseData.course_id,
      group_id: courseData.user_group_id
    });
    setVisCrsReqModalModal(true);
  }

  const saveExpanded = (expanded: boolean, record: any) => {
    const keys = [...expandedData];
    if(expanded){
        keys.push(record.subsection_id);
    } else {
      const index = keys.indexOf(record.subsection_id);
      if (index !== -1) {
        keys.splice(index, 1);
        setExpandedData(keys);
      }
    }

    setExpandedData(keys);
  }

  const handleSave = (row) => {
    const flag = row['flag'];
    const newData = [...courseReqList];

    if(flag !== 'gl') {
      setRepeatableSwitchAllStatus(false);
      newData[0].is_repeatable = false; // Main Repeatable All
    } else {
      setGradeLockingSwitchAllStatus(false);
      newData[0].grade_locking = false; // Main Grade Locking All
    }

    if(row.section_id) {
      for (let i = 0; i < newData[0].sections.length; i++) {
        const sec = newData[0].sections[i];
        if(row.section_id === sec.section_id){
          if(flag === 'gl'){
            sec.grade_locking = row.grade_locking;
          }else{
            sec.is_repeatable = row.is_repeatable;
          }

          // Change the Switch of Sub Section and Exercises (First Exercise always disabled)
          if(!isNil(sec.subsections)) {
            for (let j = 0; j < sec.subsections.length; j++) {
              const subsec = sec.subsections[j];
              if(flag === 'gl'){
                subsec.grade_locking = sec.grade_locking;
              } else {
                subsec.is_repeatable = sec.is_repeatable;
              }
              
              if(!isNil(subsec.exercises)) {
                for (let h = 0; h < subsec.exercises.length; h++) {
                  const exec = subsec.exercises[h];
                  if(flag === 'gl'){
                    exec.grade_locking = (h === 0) ? false: subsec.grade_locking;
                  } else {
                    exec.is_repeatable = subsec.is_repeatable;
                  }
                }
              }
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

            if(flag === 'gl'){
              subsec.grade_locking = row.grade_locking;
            } else {
              subsec.is_repeatable = row.is_repeatable;
            }
              
            // Change the Switch of Exercises (First Exercise always disabled)
            for (let h = 0; h < subsec.exercises.length; h++) {
              const exec = subsec.exercises[h];
              if(flag === 'gl'){
                exec.grade_locking = (h === 0) ? false: subsec.grade_locking;
                if(!subsec.grade_locking) {
                  sec.grade_locking = row.grade_locking;
                }
              } else {
                exec.is_repeatable = subsec.is_repeatable;
                if(!subsec.is_repeatable) {
                  sec.is_repeatable = row.is_repeatable;
                }
              }
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

            if(flag === 'gl'){
              // First Exercise always disabled 
              if(h !== 0 && row.exercise_id === exec.exercise_id){
                exec.grade_locking = row.grade_locking;
                if(!exec.grade_locking){
                  subsec.grade_locking = row.grade_locking;
                  sec.grade_locking = row.grade_locking;
                }
              }
            } else {
              if(row.exercise_id === exec.exercise_id){
                exec.is_repeatable = row.is_repeatable;
                if(!exec.is_repeatable){
                  subsec.is_repeatable = row.is_repeatable;
                  sec.is_repeatable = row.is_repeatable;
                }
              }
            }
          }
        }
      }
    }

    setCourseReqListData(newData);
  };

  const queryStudents = (params: { selected_ids: string[]; limit: number; page: number; sort_type: string; sort_column: string; filter_column: string; filter_value: string; }) => {
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
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryGroups = (params: { selected_ids: string; limit: number; page: number; search: string;}) => {
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

        setGroupListData(response.rows);
        setTotalRowGroup(response.total_rows);
        setGroupLoading(false);
        setTableSearchLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const updateCourseSequence = (params: { course_id: string; sequence_after: string; sequence_before: string;}) => {
    const userData = getUserData();
    
    setCoursesLoading(true);
      request
      .put(`${API_URL}course/sequence`, {
          headers: {
            token: userData.token,
            userid: userData.id
          },
          data: params
        })
      .then((response) => {
          setCoursesLoading(false);
          
          if(response.status === "ok"){
            message.success(`${response.message}`);
          } else {
            message.error(`${response.alert}`);
          }
      })
      .catch((error) => {
          console.log(error);
      });
  }

  const updateCourse = (values: any) => {
    const userData = getUserData();
    
    const params = {
      "course_id": values.course_id,
      "course_name": values.course_name,
      "course_title": values.course_title,
      "exercise_name": values.exercise_name,
      "description": values.description,
      "difficulty_level": values.difficulty_level,
      "requirements": values.requirements,
      "status": values.status,
      "student_ids": selectedStudent.map((item:any)=>item.value),
      "user_group_ids": selectedGroup.map((item:any)=>item.value),
      "course_image_id": values.course_image_id
    }

    setEditCourseLoading(true);
      request
      .put(`${API_URL}course/update`, {
          headers: {
            token: userData.token,
            userid: userData.id
          },
          data: params
        })
      .then((response) => {
          setEditCourseLoading(false);
          setVisibleEditCourseModal(false)
          
          if(response.status === "ok"){
            message.success(`${response.message}`);
          } else {
            message.error(`${response.alert}`);
          }
          
          queryAdminCourse({limit: pageSizeCourse, page: currentCourse});
      })
      .catch((error) => {
          console.log(error);
      });
  }

  const deleteSelectedCourses = (params: { course_ids: object; delete_questions: boolean }) => {
    if(selectedCourses.length > 0) {
      const userData = getUserData();
      setDeleteCourseLoading(true);

      request
      .delete(`${API_URL}course/delete`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        setDeleteQuestions(true);
        setDeleteCourseLoading(false);
        setVisibleDeleteCourseModal(false);
        
        if(response.status === "ok"){
          message.success(`${response.message}`);
        } else {
          message.error(`${response.alert}`);
        }

        setSelectedCourses([]);
        setCurrentCourse(1);
        queryAdminCourse({limit: pageSizeCourse, page: 1});
      })
      .catch((error) => {
        console.log(error);
      });
    }
}

  const includeDeleteQuestions = (e:any) => {
    setDeleteQuestions(e.target.checked);
  }

  const showDeleteConfirm = () => {
    if(selectedCourses.length > 0) {
      setVisibleDeleteCourseModal(true);
      /* confirm({
        title: intl.formatMessage({
          id: 'pages.manager.general.modal.confirm',
          defaultMessage: 'Are you sure?',
        }),
        content: <><Checkbox onChange={includeDeleteQuestions}>Delete questions</Checkbox></>,
        icon: <ExclamationCircleOutlined />,
        onOk() {
          deleteSelectedCourses({ course_ids: selectedCourses, delete_questions: deleteQuestions})
        },
        onCancel() {},
      }); */
    }
  }

  const queryTempUrl = (params: { type: string; }) => {
    const userData = getUserData();
    setDlBtnLoading(true);

    request
      .get(`${API_URL}download/course-template`, {
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
          return;
        }
        setDlBtnLoading(false);

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

  const showEditCourseModal = (courseData: any) => {
    setEditCourseStatus(courseData.status) // Set the Status Switch
    setSelectedStudent([]);
    setSelectedGroup([]);

    let students = [];
    let groups =[];
    let minNum = 10;
    if(courseData.students && courseData.students.length > 0) { 
      students = courseData.students.map((item:any)=> {
        return {value:item.id, label:`${item.first_name} ${item.last_name}`}
      });
      
      setSelectedStudent(students);
      if(students.length > 10){
        minNum = Math.ceil(students.length / 10) * 10;
        setPageSizeStudentOptns([minNum.toString(), "50", "100"]);
        setPageSizeStudent(minNum);
      }
    }

    if(courseData.groups && courseData.groups.length > 0) { 
      
      groups = courseData.groups.map((item:any)=> {
        return {value:item.user_group_id, label:`${item.user_group_name}`}
      });

      setSelectedGroup(groups);
      if(groups.length > 10){
        minNum = Math.ceil(groups.length / 10) * 10;
        setPageSizeGroupOptns([minNum.toString(), "50", "100"]);
        setPageSizeGroup(minNum);
      }

    }
    
    if(isNil(courseData.exercise_name)) {
      const defaultExerciseName = intl.formatMessage({
        id: 'pages.manager.courses.modal.form.default_exercise_name',
        defaultMessage: 'Exercise',
      }).toString();
      courseData.exercise_name = defaultExerciseName;
    }

    queryStudents({
      selected_ids: students.map((item:any)=>item.value).toString(),
      limit: minNum, 
      page: currentStudent, 
      sort_type: "", 
      sort_column: "", 
      filter_column: "role", 
      filter_value:"student" 
    });

    queryGroups({
      selected_ids: groups.map((item:any)=>item.value).toString(),
      limit: minNum, 
      page: currentGroup,
      search: tableSearch
    });

    if(courseData.course_image_id == null){
      courseData.course_image_id = 0;
    }
    queryCourseImages({course_image_id: courseData.course_image_id});

    updateForm.setFieldsValue(courseData);
    setVisibleEditCourseModal(true);
  }

  useEffect(() => {
    queryAdminCourse({limit: pageSizeCourse, page: currentCourse});
  }, []);

  const getHeaders = () => {
    const userData = getUserData();
    return {
      token: userData.token,
      userid: userData.id
    };
  }

  const uploadProps = {
    name: 'upfile',
    action: `${API_URL}upload/course-template`,
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
        queryAdminCourse({limit: pageSizeCourse, page: currentCourse});
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        queryAdminCourse({limit: pageSizeCourse, page: currentCourse});
      }
    },
  };

  const rowSelectionCourses = {
    onChange: selectedRowKeys => {
        setSelectedCourses(selectedRowKeys);
    },
  };

  const rowSelectionStuds = {
    onChange: (selectedRowKeys: any) => {
      setTableSelectedRows(selectedRowKeys);
    }
  };

  const rowSelectionGrps = {
    onChange: (selectedRowKeys: any) => {
      setTableSelectedGroupRows(selectedRowKeys);
    }
  };

  const handleChangeStudents = (val) => {
    setSelectedStudent(val);
  }

  const handleChangeGroups = (val) => {
    setSelectedGroup(val);
  }

  const rowTableSelectionVideos = {
    onChange: (selectedRowKeys: any) => {
      setVideoTableSelectedRows(selectedRowKeys);
    }
  };

  const onChangeVideosTable = (data:any) => {
    setVideoPageSize(data.pageSize);
    setVideoCurrent(data.current);
    queryVideos({limit: data.pageSize, page: data.current});
  }

  const onChangeCourseTable = (data) => {
    setPageSizeCourse(data.pageSize);
    setCurrentCourse(data.current);

    queryAdminCourse({
      limit: data.pageSize,
      page: data.current,
    });
  }

  const showTableStudentsModal = () => {
    setVisAssStudentModal(true);
    setTableSelectedRows(selectedStudent.map((item:any)=>item.value));
  }

  const showTableGroupsModal = () => {
    const tableSelected = selectedGroup.map((item:any)=>item.value);
    setVisAssGroupModal(true);
    setTableSelectedGroupRows(tableSelected);
    setCurrentGroup(1);
    queryGroups({
      selected_ids: tableSelected.toString(),
      limit: pageSizeGroup,
      page: 1,
      search: tableSearch
    })
  }

  const queryUserDetails = (params: { selected_ids: string[]}) => {
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
          const students = response.rows.map((item:any)=> {
            return {value:item.id, label:`${item.first_name} ${item.last_name}`}
          });
          setSelectedStudent(students);
          setVisAssStudentModal(false);
          setAddToLoading(false); 
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryUserGroupDetails = (params: { selected_ids: string[]}) => {
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
          setSelectedGroup(groups);
          setVisAssGroupModal(false);
          setAddToLoading(false); 
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const saveAssStudentModal = () => {
    setAddToLoading(true); // Set the Loading to the Button to prevent multiple click

    if(tableSelectedRows.length) {
      queryUserDetails({selected_ids: tableSelectedRows.toString()});
    } else {
      setSelectedStudent([]);
      setVisAssStudentModal(false);
      setAddToLoading(false); 
    }
  }

  const saveAssGroupModal = () => {
    setAddToLoading(true); // Set the Loading to the Button to prevent multiple click
    setTableSearch(""); // Reset the Search
    setCurrentGroup(1);

    if(tableSelectedGroupRows.length) {
      queryUserGroupDetails({selected_ids: tableSelectedGroupRows.toString()});
    } else {
      setSelectedGroup([]);
      setVisAssGroupModal(false);
      setAddToLoading(false); 
    }
  }

  const showEditVideoModal = (courseData: any) => {
    queryVideoCourse({course_id: courseData.course_id});
    setCurrentEditingCourseKey(courseData.course_id);
    setVisCrsVideoModal(true);
  }

  const onChangeStudentTable = (data) => {
    setPageSizeStudent(data.pageSize);
    setCurrentStudent(data.current);

    queryStudents({
      selected_ids: selectedStudent.map((item:any)=>item.value).toString(),
      limit: data.pageSize,
      page: data.current,
      sort_type: "", sort_column: "", filter_column: "role", filter_value:"student" 
    });
  }

  const onChangeGroupTable = (data) => {
    setPageSizeGroup(data.pageSize);
    setCurrentGroup(data.current);

    queryGroups({
      selected_ids: selectedGroup.map((item:any)=>item.value).toString(),
      limit: data.pageSize,
      page: data.current,
      search: tableSearch
    });
  }

  const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
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
    repeatable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
  }
  const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    repeatable,
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
        let new_values = {}
        new_values['flag'] = 'gl';
        if (values['grade_locking'] != undefined){
          new_values['grade_locking'] = values['grade_locking'];
        }
        if (values['is_repeatable'] != undefined){
          new_values['is_repeatable'] = values['is_repeatable'];
        }
        toggleEdit();
        handleSave({ ...record, ...new_values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    const repeatableSave = async () => {
      try {
        const values = await form.validateFields();
        let new_values = {}
        new_values['flag'] = 'rep';
        if (values['grade_locking'] != undefined){
          new_values['grade_locking'] = values['grade_locking'];
        }
        if (values['is_repeatable'] != undefined){
          new_values['is_repeatable'] = values['is_repeatable'];
        }
        toggleEdit();
        handleSave({ ...record, ...new_values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;
    if (repeatable) {
      childNode = (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: false,
              message: `Repeatable value is required.`,
            },
          ]}
        >
            <Switch defaultChecked={record.is_repeatable} onChange={repeatableSave} />
        </Form.Item>
      );
    };
    if (editable) {
      childNode = (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: false,
              message: `${title} is required.`,
            },
          ]}
        >
            <Switch defaultChecked={record.grade_locking} onChange={save} />
        </Form.Item>
      );
    };
    return <td {...restProps}>{childNode}</td>;
  };
  type EditableTableProps = Parameters<typeof Table>[0];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = colCourseReq2.map(col => {
    if (!col.editable && !col.repeatable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        repeatable: col.repeatable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });
  type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

  const courseColumnSort = {
    title: '',
    dataIndex: 'sort',
    width: 30,
    render: () => <DragHandle />,
  }
  const courseColumnAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: (courseData:any) => (
      <Space>
        <Tooltip placement="topLeft" title="Edit Course">
          <Button size="small" icon={<EditFilled />} onClick={()=>showEditCourseModal(courseData)} />
        </Tooltip>
        <Tooltip placement="topLeft" title="Settings">
          <Button size="small" icon={<SettingOutlined />} onClick={()=>showLockUnlickGroupModal(courseData)} />
        </Tooltip>
        <Tooltip placement="topLeft" title="Add videos">
          <Button size="small" icon={<VideoCameraAddOutlined />} onClick={()=>showEditVideoModal(courseData)} />
        </Tooltip>
      </Space>
    )
  };

  const courseColumn = [courseColumnSort, ...colAdminCourse, courseColumnAction];

  const editCourseVideo = (record: Partial<CourseVideoItem> & { key: React.Key }) => {
    if(record) {
      if(record.videos && record.videos.length > 0) {
        setVideoTableSelectedRows(record.videos.map((item:any)=>item.video_id));
      } else {
        setVideoTableSelectedRows([]);
      }
      const type = (record.exercise_id) ? "exercise" : "subsection";
      setEditingCourseVideo({
        type,
        key: record.key
      });
      queryVideos({limit: videoPageSize, page: videoCurrent});
    }
    setVisEditCourseVideoModal(true);
  };

  const saveCourseVideo = (courseVideo: any) => {
    querySaveCourseVideo(courseVideo);
  };

  const closeCourseVideoModal = () => {
    setCurrentEditingCourseKey('');
    setCourseVideoData([]);
    setExpandedData([]);
    setVisCrsVideoModal(false);
  }

  const closeCourseLockUnlockModal = () => {
    setExpandedData([]);
    setVisCrsVideoModal(false);
    setVisCrsReqModalModal(false);
  }

  const courseSubColumnAction = {
    title: '',
    dataIndex: 'operation',
    render: (_: any, record: CourseVideoItem) => {
      return (<Button size="small" icon={<EditFilled />} onClick={() => editCourseVideo(record)} />);
    },
  };

  const colCourseVideowithAction = [...colCourseSubVideo, courseSubColumnAction];

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(adminCouseData), oldIndex, newIndex).filter(el => !!el);

      const currentMoveCourseId = newData[newIndex].course_id;
      const sequenceAfterCourseId =  (isNil(newData[newIndex + 1])) ? null : newData[newIndex + 1].course_id;
      const sequenceBeforeCourseId =  (isNil(newData[newIndex - 1])) ? null : newData[newIndex - 1].course_id;

      updateCourseSequence({ course_id: currentMoveCourseId, sequence_after: sequenceAfterCourseId, sequence_before: sequenceBeforeCourseId})
      setAdminCourseData(newData);
    }
  };

  const DraggableContainer = props => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass={style.rowDragging}
      onSortEnd={onSortEnd}
      {...props}
    />
  );
  
  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = adminCouseData.findIndex(x => x.course_id === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  const dataSwitchAll = (checked: boolean, switchType: string) => {
    
    const currentData = [...courseReqList];
    const cloneCourseData = cloneDeep(currentData);

    if(switchType === 'grade_locking') {
      setGradeLockingSwitchAllStatus(checked);
    } else {
      setRepeatableSwitchAllStatus(checked);
    }
    
    if(cloneCourseData.length) {
      cloneCourseData[0][switchType] = checked; // Main Repeatable
      for (let a = 0; a < cloneCourseData.length; a++) {
        const course = cloneCourseData[a];
        for (let i = 0; i < course.sections.length; i++) {
          const sec = course.sections[i];
          sec[switchType] = checked;
          // Change the Switch of Sub Section and Exercises (First Exercise always disabled)
          if(!isNil(sec.subsections)) {
            for (let j = 0; j < sec.subsections.length; j++) {
              const subsec = sec.subsections[j];
              subsec[switchType] = sec[switchType];

              if(!isNil(subsec.exercises)) {
                for (let h = 0; h < subsec.exercises.length; h++) {
                  const exec = subsec.exercises[h];

                  // If SwitchType is grade locking first Exercise always disabled 
                  if(switchType === 'grade_locking') {
                    exec[switchType] = (h === 0) ? false: subsec[switchType];
                  } else {
                    exec[switchType] = subsec[switchType];
                  }
                }
              }
            }
          }
        }
      }
      
      setCourseReqListData(cloneCourseData);
    }
  };

  const onTableSearch = (value: string, event: any, table: string) => {
    setTableSearchLoading(true);
    setTableSearch(value);

    if(table === "groups") {
      setCurrentGroup(1);
      const tableSelected = (value) ? "" :  selectedGroup.map((item:any)=>item.value).toString();
      queryGroups({
        selected_ids: tableSelected,
        limit: pageSizeGroup,
        page: 1,
        search: value
      });
    }
  }

  const closeGroupModal = (modalKey:string) => {
    setTableSearch(""); // Reset the Search
    if(modalKey === "groups") {
      setVisAssGroupModal(false);
    }
  }

  const queryCourseImages = (params: { course_image_id: string;}) => {
    const userData = getUserData();
    setLoading(true);
    console.log
    request
      .get(API_URL+`course/image/list`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setLoading(false);
        console.log("response.data == ", response.course_images);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
        setImageList(response.course_images);
      })
      .catch((error) => {
        console.log(error);
      });
    }

    useEffect(() => {
      queryCourseImages({course_image_id: 0});

    }, []);


  const uploadFile = file => {
    const userData = getUserData();
    const formData = new FormData();
    formData.append('upfile', file[0]);
    console.log("file === ", file);
    request
      .post(`${API_URL}course/image/upload`, {
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
     
        queryCourseImages({course_image_id: response.data.course_image_id});
        
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

  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Button className={style.customBtn} onClick={()=>window.history.back()} icon={<LeftOutlined />} size={size}>
          &nbsp;
          <FormattedMessage
            id="pages.back"
            defaultMessage="BACK"
          />
        </Button>
        <br/><br/>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card>
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
                            id="pages.tutor.courses.title"
                            defaultMessage="Courses"
                          />
                        </Title>
                      </Typography>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <Paragraph>
                        Descriptions
                      </Paragraph>
                      <Paragraph>
                        one more line
                      </Paragraph>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={3} xs={24} style={{ textAlign: "left" }} >
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} type="primary" 
                          title={intl.formatMessage({
                            id: 'pages.tutor.courses.upload.tooltip',
                            defaultMessage: 'Upload course template',
                          })}
                        >
                          &nbsp;
                          <FormattedMessage
                            id="pages.tutor.courses.upload"
                            defaultMessage="Upload"
                          />
                        </Button>
                      </Upload>
                    </Col>
                    <Col sm={17} xs={24} style={{ textAlign: "left" }} >
                      <Button onClick={()=>queryTempUrl({type:"csv"})} loading={dlBtnLoading} 
                        title={intl.formatMessage({
                          id: 'pages.tutor.courses.download.tooltip',
                          defaultMessage: 'Download course template',
                        })} type="primary" icon={<DownloadOutlined />}
                      >
                        &nbsp;
                        <FormattedMessage
                          id="pages.tutor.courses.download"
                          defaultMessage="Download"
                        />
                      </Button>
                    </Col>
                    <Col sm={4} xs={24} style={{ textAlign: "left" }} >
                      <Button icon={<DeleteOutlined />} loading={courseDeleteBtnLoading} type="danger" onClick={showDeleteConfirm} style={{ marginBottom: 16 }}>
                        <FormattedMessage
                          id="pages.manager.courses.del-courses.button"
                          defaultMessage="Delete"
                        />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table 
                loading={coursesLoading}
                key="courseProgresstables" 
                dataSource={adminCouseData} 
                rowSelection={{
                  preserveSelectedRowKeys: true,
                  selectedRowKeys: selectedCourses,
                  ...rowSelectionCourses,
                }}
                columns={courseColumn} 
                rowKey="course_id"
                pagination={{
                  pageSize: pageSizeCourse, 
                  current: currentCourse, 
                  total: totalRowCourse,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeCourseTable}
                components={{
                  body: {
                    wrapper: DraggableContainer,
                    row: DraggableBodyRow,
                  },
                }}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
      
      <Modal
        closable={false}
        width={430}
        visible={visibleDeleteCourseModal}
        destroyOnClose
        confirmLoading={deleteCourseLoading}
        onCancel={()=> { setVisibleDeleteCourseModal(false)}}
        onOk={() => {
          deleteSelectedCourses({ course_ids: selectedCourses, delete_questions: deleteQuestions})
        }}
      >
        <>
          <Paragraph>
            <FormattedMessage
              id="pages.manager.courses.delete.courses.intro"
              defaultMessage="Are you sure you want to delete selected course(s)?"
            />
          </Paragraph>
          <Checkbox defaultChecked={deleteQuestions} onChange={includeDeleteQuestions}>
            <FormattedMessage
              id="pages.manager.courses.delete.questions"
              defaultMessage="Delete questions"
            />
          </Checkbox>
        </>
      </Modal>
        
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.courses.modal.title',
          defaultMessage: 'Edit Course',
        })} 
        visible={visibleEditCourseModal}
        destroyOnClose
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
            hidden
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
              id: 'pages.manager.courses.modal.form.course_title',
              defaultMessage: 'Course Title',
            })}
            name="course_title"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.courses.modal.form.course_title.rules',
                defaultMessage: 'Please input course title!',
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
              id: 'pages.manager.courses.modal.form.exercise_name',
              defaultMessage: 'Exercise Name',
            })}
            name="exercise_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.courses.modal.form.exercise_name.rules',
                defaultMessage: 'Please input exercise name!',
              })
            }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
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
              labelInValue
              onChange={handleChangeStudents}
              value={selectedStudent}
            >
              {studentList.map((stdnt, i) => (
                <Option value={stdnt.id} key={stdnt.id}>{stdnt.first_name + " " + stdnt.last_name}</Option>
              ))}
            </Select>
            <Link onClick={showTableStudentsModal} style={{marginTop: "5px", display: "inline-block"}}>
              <FormattedMessage
                id="pages.manager.courses.modal.form.students.link"
                defaultMessage="ASSIGN STUDENTS"
              />
            </Link>
          </Form.Item> */}

              <label>
                <FormattedMessage
                  id="pages.tutor.exercise.instruction.modal.image.upload"
                  defaultMessage="Upload image"
                />
              </label>
              <input type="file" accept="image/*" onChange={event => uploadFile(event.target.files)} />  
              <br/>
              <Form.Item
                name="course_image_id"
              >
                <Radio.Group value={imageList.course_image_id} buttonStyle="solid">
                  {
                    imageList.map(img => (
                      <Radio value={img.course_image_id}>
                        <Image width={200} src={img.image_url} />
                        {img.image_name}
                      </Radio>
                    ))
                  }
                </Radio.Group>
              </Form.Item>
  
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.courses.modal.form.groups',
              defaultMessage: 'Groups',
            })} 
            name="groups"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder={intl.formatMessage({
                id: 'pages.manager.courses.modal.form.groups.placeholder',
                defaultMessage: 'Please select group',
              })} 
              optionFilterProp="children"
              labelInValue
              onChange={handleChangeGroups}
              value={selectedGroup}
            >
              {groupList.map((grp, i) => (
                <Option value={grp.user_group_id} key={grp.user_group_id}>{grp.user_group_name}</Option>
              ))}
            </Select>
            <Link onClick={showTableGroupsModal} style={{marginTop: "5px", display: "inline-block"}}>
              <FormattedMessage
                id="pages.manager.courses.modal.form.groups.link"
                defaultMessage="ASSIGN GROUPS"
              />
            </Link>
          </Form.Item>
          {/* <Form.Item
              label={intl.formatMessage({
                id: 'pages.manager.courses.modal.form.status',
                defaultMessage: 'Status',
              })}
              name="status"
          >
              <Switch checked={editCourseStatus} onChange={(checked)=>setEditCourseStatus(checked)} />
          </Form.Item> */}
        </Form>
      </Modal>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.courses.modal2.courses.title',
          defaultMessage: 'Assign Students',
        })}
        visible={visAssStudentModal}
        destroyOnClose
        onCancel={()=> {setVisAssStudentModal(false)}}
        width={"75%"}
        footer={[
          <Button onClick={saveAssStudentModal} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.courses.modal2.groups.title"
                defaultMessage="Add to Course"
              />
          </Button>
          ]}
      >
        <Table 
          loading={studentLoading}
          dataSource={studentList} 
          columns={colStudent} 
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: tableSelectedRows,
            ...rowSelectionStuds,
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
          id: 'pages.manager.courses.modal2.groups.title',
          defaultMessage: 'Assign Groups',
        })}
        visible={visAssGroupModal}
        destroyOnClose
        onCancel={()=> closeGroupModal("groups")}
        width="75%"
        footer={[
          <Button onClick={saveAssGroupModal} loading={addToLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.courses.modal2.courses.add.button"
                defaultMessage="Add to Course"
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
              onSearch={(value, event) => { onTableSearch(value, event, "groups") }}
            />
          </Col>
        </Row>

        <Table 
          loading={groupLoading}
          dataSource={groupList} 
          columns={colUserGroup} 
          rowKey="user_group_id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: tableSelectedGroupRows,
            ...rowSelectionGrps,
          }}
          pagination={{
            pageSize: pageSizeGroup, 
            current: currentGroup, 
            total: totalRowGroup,
            pageSizeOptions: pageSizeGroupOptns,
            showSizeChanger: true
          }}
          onChange={onChangeGroupTable}
        />
      </Modal>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.groups.modal6.courses.title',
          defaultMessage: 'Settings',
        })}
        visible={visCrsReqModal}
        destroyOnClose
        onCancel={closeCourseLockUnlockModal}
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

        { courseReqList && courseReqList[0].course_name &&
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Title level={4}>{courseReqList[0].course_name}</Title>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} style={{textAlign: "right"}}>
            <Space wrap>
              <div>
                <FormattedMessage
                  id="pages.course.repeatable"
                  defaultMessage="Repeatable"
                /><Switch className={style.dataSwitchButton} loading={courseReqLoading} 
                    checked={repeatableSwitchAllStatus} 
                    onChange={(checked) => dataSwitchAll(checked, "is_repeatable")} />
              </div>
              <div>
                <FormattedMessage
                  id="pages.course.grade-locking"
                  defaultMessage="Grade Locking"
                /><Switch className={style.dataSwitchButton} loading={courseReqLoading} 
                    checked={gradeLockingSwitchAllStatus} 
                    onChange={(checked) => dataSwitchAll(checked, "grade_locking")} />
              </div>
            </Space>
          </Col>
        </Row>
        }

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
              components={components}
              rowKey="subsection_id"
              expandedRowKeys={expandedData}
              onExpand={saveExpanded}
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

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.courses.videos.modal.title',
          defaultMessage: 'Assign Videos',
        })}
        className={style.assignVideoContainer}
        visible={visCrsVideoModal}
        destroyOnClose
        onCancel={closeCourseVideoModal}
        width="75%"
        footer={[
          <Button onClick={closeCourseVideoModal} loading={addCourseVideoBtnLoading}>
            <FormattedMessage
                id="pages.manager.courses.videos.modal.close"
                defaultMessage="Close"
              />
          </Button>
        ]} 
      >
        <Table
          dataSource={courseVideoData.sections}
          columns={colCourseVideo}
          pagination={false}
          scroll={{ x: 700}}
          loading={videoCourseLoading}
          expandable={{
            expandedRowRender: subsections => 
            <Table 
              dataSource={subsections.subsections} 
              showHeader={false}
              columns={colCourseVideowithAction}
              pagination={false}
              expandedRowKeys={expandedData}
              onExpand={saveExpanded}
              expandable={{
                expandedRowRender: exercises => 
                <Table 
                  showHeader={false}
                  dataSource={exercises.exercises} 
                  columns={colCourseVideowithAction}
                  pagination={false}
                />,
                rowExpandable: exercises => exercises.exercises,
              }}
            />,
            rowExpandable: subsections => subsections.subsections,
            }}
        />
      </Modal>
        
      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.skills.videos.modal.title',
          defaultMessage: 'Videos',
        })}
        visible={visEditCourseVideoModal}
        destroyOnClose
        onCancel={()=> {setVisEditCourseVideoModal(false)}}
        width="75%"
        footer={[
          <Button onClick={() => saveCourseVideo(editingCourseVideo)} loading={addCourseVideoBtnLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.courses.videos.modal.update"
                defaultMessage="Update"
              />
          </Button>
        ]} 
      >
        <Table 
          loading={videosDataLoading}
          dataSource={videos} 
          columns={colVideo}
          rowKey="video_id"
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: videoTableSelectedRows,
            ...rowTableSelectionVideos,
          }}
          pagination={{
            pageSize: videoPageSize, 
            current: videoCurrent, 
            total: videoTotalRow,
            pageSizeOptions: ["10", "20", "50", "100"],
            showSizeChanger: true
          }}
          onChange={onChangeVideosTable}
        />
      </Modal>

    </GridContent>
  );
};

export default AdminCoursesPage;
