import React, { useState, useEffect } from 'react';
import { FormattedMessage, history } from 'umi';
import request from 'umi-request';
import { getUserData, API_URL } from '@/utils/utils';
import { Col, Row, Card, message, Typography, Table, Avatar, Layout, Grid } from 'antd';
import { AntDesignOutlined } from '@ant-design/icons';
import { colCourseProgress } from '@/utils/tableColumns';
import ProgressSider from '@/components/student/ProgressSider';
import style from './style.less';

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const CoursePage: React.FC<{}> = () => {
  const screens = useBreakpoint();
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRow, setTotalRow] = useState<number>(1);
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const [courseProgressData, setCourseProgressData] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [] = useState<object>({
    message: "",
    type: ""
  });
  // const [exerciseSummary, setExerciseSummary] = useState<Object>({});

  const queryCourseProgress = (params: { limit : number; page : number; }) => {
    const userData = getUserData();
    setLoading(true);

    request
      .get(`${API_URL}course/progress`, {
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
        setTotalRow(response.total_rows);
        setCourseProgressData(response.rows);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onCollapseSider = (collapsed: boolean) => {
    setSiderCollapse(collapsed);
  }

  useEffect(() => {
    queryCourseProgress({limit: pageSize, page: current})
  }, []);

  const onChangeTable = (data: any) => {
    setPageSize(data.pageSize);
    setCurrent(data.current);
    queryCourseProgress({limit: data.pageSize, page: data.current});
  }


  return (
    <Layout hasSider className={style.layoutWithSider}>
      <ProgressSider 
        onCollapse={onCollapseSider} 
      />
      <Content className={(screens.md === false) ? 'no-transition': ''} style={{background: "#fff", marginLeft: (screens.md === false || siderCollapse) ? '0px' : '300px'}}>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            <Card>
              <Row wrap={false}>
                {(screens.sm) &&
                <Col flex="100px">
                  <Avatar
                    size={80}
                    icon={<AntDesignOutlined />}
                  />
                </Col>
                }
                <Col flex="auto">
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <Typography>
                        <Title level={2}>
                          <FormattedMessage
                            id= 'pages.student.progress.courses.title'
                            defaultMessage= 'My Courses'
                          />
                        </Title>
                      </Typography>
                    </Col>
                  </Row>
                  <Row gutter={24} type="flex">
                    <Col sm={24} xs={24} style={{ textAlign: "left" }} >
                      <Paragraph>
                        <FormattedMessage
                          id= 'pages.student.progress.courses.desc'
                          defaultMessage= 'Click on a course to see your progress'
                        />
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card bordered={false}>
              <Table 
                key={"courseProgresstables"} 
                dataSource={courseProgressData} 
                columns={colCourseProgress}
                loading={loading}
                pagination={{
                  pageSize, 
                  current, 
                  total: totalRow,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeTable}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default CoursePage;
