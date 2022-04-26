import React, { useState, useEffect, Component } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, API_URL } from '@/utils/utils';
import { Col, Row, Button, Card, message, Typography, Collapse, Grid, Radio, Tooltip, Table, Spin, Layout } from 'antd';
import { SmileOutlined, CaretRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import 'react-multi-carousel/lib/styles.css';

import { colSubSkills, colCourse2 } from '@/utils/tableColumns';
import DashboardSider from '@/components/student/DashboardSider';
import { isNil } from 'lodash';
import DataCard from './components/DataCard';
import style from './style.less';

const { useBreakpoint } = Grid;
const { Title } = Typography;
const { Content } = Layout;

const DashboardPage2: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const userSettings = getUserData();
  const { formatMessage } = useIntl();
  const [studentCourseData, setStudentCourseData] = useState<object[]>([]);
  const [skillsData, setSkillsData] = useState<object[]>([]);
  const [quickStart, setQuickStart] = useState<object>({});
  const [skillsLayout, setSkillsLayout] = useState<string>("tiles");
  const [coursesLayout, setCoursesLayout] = useState<string>("tiles");

  const [quickStartLoading, setQuickStartLoading] = useState<boolean>(true);
  const [skillsDataLoading, setSkillsDataLoading] = useState<boolean>(true);
  const [studentDataLoading, setStudentDataLoading] = useState<boolean>(true);
  const [isVisibleQuickStart, setIsVisibleQuickStart] = useState<boolean>(true);

  const [courseTablePagination, setCourseTablePagination] = useState<object>({
    current: 1,
    totalRow: 1,
    pageSize: 10
  });

  const [skillsTablePagination, setSkillsTablePagination] = useState<object>({
    current: 1,
    totalRow: 1,
    pageSize: 10,
  });

  const [skillsTableSorter, setSkillsTableSorter] = useState<any>({
    sortType: '',
    sortColumn: '',
  })

  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);

  const queryQuickStart = () => {
    const userData = getUserData();
    request
      .get(`${API_URL}quick-start`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
      })
      .then((response) => {
        if (response.status === "Failed") {
          message.error(response.alert);
          history.replace("/user/login");
        }
        setQuickStart(response.data);

        if(response.data.course_id === undefined) {
          setIsVisibleQuickStart(false);
        }
        
        setQuickStartLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryStudentCourse = (params: { limit: number; page: number; }) => {
    const userData = getUserData();
    setStudentDataLoading(true);

    request
      .get(`${API_URL}student/course`, {
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
        setStudentCourseData(response.rows);
        setStudentDataLoading(false);
        
        setCourseTablePagination({
          current: params.page,
          pageSize: params.limit,
          totalRow: response.total_rows
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryStudentSkills = (params: { limit: number; page: number; sort_type: string; sort_column: string}) => {
    const userData = getUserData();
    setSkillsDataLoading(true);

    if(!isNil(params.sort_column) && params.sort_column) {
      params.sort_type = (params.sort_type === 'ascend') ? 'asc' : 'desc';
    }

    request
      .get(`${API_URL}progress/student/skills`, {
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
        setSkillsData(response.rows);
        setSkillsDataLoading(false);

        setSkillsTablePagination({
          current: params.page,
          pageSize: params.limit,
          totalRow: response.total_rows
        });

      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    queryStudentCourse({
      limit: courseTablePagination.pageSize,
      page: courseTablePagination.current
    });
    queryStudentSkills({
      limit:skillsTablePagination.pageSize,
      page: skillsTablePagination.current
    });
    queryQuickStart();
  }, []);

  const onChangeCourseTable = (data:any) => {
    queryStudentCourse({
      limit: data.pageSize,
      page: data.current
    });
  }

  const onChangeSkillsTable = (pagination:any, filters, sorter, extra) => {
    const sortType = (!isNil(sorter.order)) ? sorter.order : '';
    const sortColumn = (!isNil(sorter.field) && !isNil(sorter.order)) ? sorter.field : '';

    setSkillsTableSorter({
      sortType,
      sortColumn,
    });

    queryStudentSkills({
      limit: pagination.pageSize,
      page: pagination.current,
      sort_type: sortType,
      sort_column: sortColumn,
    });
  }

  const onChangeCourseCard = (page: number, size: number) => {
    queryStudentCourse({
      limit: size,
      page
    });
  }

  const onChangeSkillsCard = (page: number, size: number) => {
    queryStudentSkills({
      limit: size,
      page,
      sort_type: skillsTableSorter.sortType,
      sort_column: skillsTableSorter.sortColumn,
    });
  }

  const sendToExerciseOverview = (exerciseData) => {
    if (exerciseData.is_unlocked) {
      return `/exercise-overview?exercise_id=${exerciseData.exercise_id}&course_id=${exerciseData.course_id}`;
    }
    
    return `/course?course_id=${exerciseData.course_id}`;
  }

  const handleSkillsModeChange = (e: any) => {
    const mode = e.target.value;
    setSkillsLayout(mode);
  }

  const handleCoursesModeChange = (e: any) => {
    const mode = e.target.value;
    setCoursesLayout(mode);
  }

  const onCollapseSider = (collapsed: boolean) => {
    setSiderCollapse(collapsed);
  }

  const layoutClassesCondition = classNames({
    [style.layoutWithSider] : true,
    [style.isMobileSize]: !screens.md
  });

  const colTableSkills = [
    {
      title: () => (
        <FormattedMessage
          id="pages.student.dashboard.my-skills.table.skill"
          defaultMessage="Skill"
        />
      ),
      width: 325,
      dataIndex: 'skill',
      key: 'skill',
      sorter: true,
      sortOrder: skillsTableSorter.sortColumn === 'skill' && skillsTableSorter.sortType,
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.student.dashboard.my-skills.table.answered_questions"
          defaultMessage="Questions answered"
        />
      ),
      width: 200,
      dataIndex: 'answered_questions',
      key: 'answered_questions',
      sorter: true,
      sortOrder: skillsTableSorter.sortColumn === 'answered_questions' && skillsTableSorter.sortType,
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.student.dashboard.my-skills.table.correct"
          defaultMessage="% Correct"
        />
      ),
      width: 140,
      dataIndex: 'correct',
      key: 'correct',
      sorter: true,
      sortOrder: skillsTableSorter.sortColumn === 'correct' && skillsTableSorter.sortType,
      render: (correct: any) =>  {
        if(correct){
          return `${correct}%`
        } 
        return "-"
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.student.dashboard.my-skills.table.progress"
          defaultMessage="Progress"
        />
      ),
      width: 140,
      dataIndex: 'progress',
      key: 'progress',
      sorter: true,
      sortOrder: skillsTableSorter.sortColumn === 'progress' && skillsTableSorter.sortType,
      render: (progress: any) =>  {
        if(progress){
          return `${progress}%`
        } 
        return "-"
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.student.dashboard.my-skills.table.time_studied"
          defaultMessage="Time studied"
        />
      ),
      width: 160,
      dataIndex: 'time_studied',
      key: 'time_studied',
      sorter: true,
      sortOrder: skillsTableSorter.sortColumn === 'time_studied' && skillsTableSorter.sortType,
    },
  ];

  return (
    <Layout hasSider className={layoutClassesCondition}>
        <DashboardSider 
          onCollapse={onCollapseSider} 
        />

        <Content className={(screens.md === false || userSettings.sidebar === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
          <div className={style.contentCardBox}>
            <Row gutter={24} type="flex">
              <Col xl={12} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
                { isVisibleQuickStart && 
                  <Card style={{ minHeight: 50 }} loading={quickStartLoading} className={style.quickStartContainer}>
                    <div style={{ marginRight: "auto", width: "100%"}}>
                      <Title level={4} style={{marginBottom: 0}}>
                        <FormattedMessage
                          id="pages.student.dashboard.next-up"
                          defaultMessage="NEXT UP"
                        />
                      </Title>
                      <Title level={5} style={{margin: 0}}>{quickStart.exercise}</Title>                   
                    </div>
                    <div className={style.btnQuickCont} style={{textAlign: 'right', paddingLeft: 15}}>
                      <a href={sendToExerciseOverview(quickStart)}>
                        <Button type="primary" size="large" icon={<CaretRightOutlined />} className={style.btnQuick} shape="round">
                          <FormattedMessage
                            id="pages.student.dashboard.quick-start"
                            defaultMessage="QUICK START"
                          />
                        </Button>
                      </a>
                    </div>
                  </Card>
                }
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xxl={24} xl={(siderCollapse) ? 24 : 24} style={{ marginBottom: 5, width: "100%" }}>
                <Card
                  style={{ minHeight: 430, marginBottom: 20 }}
                  className={style.cardContainer}
                >
                  <Row gutter={24} type="flex">
                    <Col sm={15} xs={15}>
                      <Title level={4}>
                        <FormattedMessage
                          id="pages.student.dashboard.my-courses"
                          defaultMessage="My Courses"
                        />
                      </Title>
                    </Col>
                    <Col sm={9} xs={9} style={{textAlign:"right"}}>
                      <Radio.Group
                        onChange={handleCoursesModeChange}
                        options={[
                          { 
                            label: <FormattedMessage
                              id= 'pages.student.dashboard.my-courses.radio.table'
                              defaultMessage= 'Table'
                            />, 
                            value: 'table' 
                          },
                          { 
                            label: <FormattedMessage
                              id= 'pages.student.dashboard.my-courses.radio.tiles'
                              defaultMessage= 'Tiles'
                            />, 
                            value: 'tiles' 
                          }
                        ]}
                        value={coursesLayout}
                        optionType="button"
                        buttonStyle="solid"
                        size="small"
                      />
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    
                    <Col sm={24} xs={24}>
                      { 
                        (coursesLayout === "table" && studentCourseData) &&  
                        <Table 
                          dataSource={studentCourseData} 
                          loading={studentDataLoading} 
                          columns={colCourse2}
                          pagination={{
                            pageSize: courseTablePagination.pageSize, 
                            current: courseTablePagination.current, 
                            total: courseTablePagination.totalRow,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            showSizeChanger: true
                          }}
                          onChange={onChangeCourseTable}
                        />
                      }

                      {
                        
                        (coursesLayout === "tiles" && studentCourseData) &&  
                        <>
                        <DataCard 
                          cardDataSource={studentCourseData} 
                          type="course" 
                          siderCollapse={siderCollapse}
                          loading={studentDataLoading} 
                          cardPagination={{
                            pageSize: courseTablePagination.pageSize, 
                            current: courseTablePagination.current, 
                            total: courseTablePagination.totalRow,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            showSizeChanger: true,
                            onChange: onChangeCourseCard
                          }}
                        />
                        </>
                      }
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
  );
}

export default DashboardPage2;