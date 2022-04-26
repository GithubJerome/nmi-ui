import { FormattedMessage, history, getLocale } from 'umi';
import { Card, Typography, Layout, Progress, message, Row, Col, Grid } from 'antd';
import { TrophyFilled  } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import request from 'umi-request';
import { convertCommaToDot, updateSidebarUserData, getUserData, epochToJsDate, getPageQuery, API_URL } from '@/utils/utils';
import courseImg from '@/assets/course.png';
import style from './index.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph, Link } = Typography;
const { Sider } = Layout;

interface CourseSiderProps {
  courseData?: any;
  onCollapse: any;
  type?: string;
}

const CourseSider: React.FC<CourseSiderProps> = (props) => {
  const { onCollapse, courseData, type } = props;
  const selectedLang = getLocale();
  const screens = useBreakpoint();
  const userInfo = getUserData();
  const [sidebarStatus, setSidebarStatus] = useState<boolean>(!userInfo.sidebar);
  
  const querySaveCollapse = (params: { sidebar: boolean; }) => {
    const userData = getUserData();
    request
      .put(`${API_URL}sidebar/update`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: params
      })
      .then((response) => {
        if (response.status === "ok") {
          updateSidebarUserData(params.sidebar);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  const onCollapseComponentSider = (collapsed: boolean) => {
    onCollapse(collapsed); // Parent Page Collapse
    querySaveCollapse({sidebar: !collapsed});
  }

  useEffect(() => {
    if(sidebarStatus) {
      onCollapseComponentSider(true);
    }
  }, []);

  return (
    <>
    {/* Desktop Sider */}
    <Sider
      className={style.siderBox}
      // breakpoint="sm"
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
      defaultCollapsed={sidebarStatus}
      collapsible
      onCollapse={onCollapseComponentSider}
      width={300}
      collapsedWidth={5}
    >
      <Card
        loading={!((courseData && (courseData.section_id || courseData.course_id)))}
        bordered={false}
        style={{marginTop: "0px", width: 300, minHeight: 430, paddingBottom: 120}}
        /* cover={
          <img
            alt="example"
            src={courseImg}
          />
        } */
      >
        { courseData && 
        <>
        <Typography>
          {/** Side Title for Course */}
          { (type === 'course') &&
          <Title level={2}>
            {courseData.course_title}
          </Title>
          }

          {/** Side Title for Section */}
          { (type === 'section') &&
            <>
            {(courseData && courseData.course_title) &&
              <Title level={5} style={{ marginBottom: "0px"}}>
                <Link className={style.textLink} 
                  href={`/course?course_id=${courseData.course_id}`}>{courseData.course_title}</Link>
              </Title>
            }
            {courseData && courseData.section_name &&
              <Title level={4} style={{ marginTop: "0px"}}>
                {courseData.section_name}
              </Title>
            }
            </>
          }

          {/** Side Title for Sub Section */}
          { (type === 'sub-section') &&
            <>
            {(courseData && (courseData.course_title || courseData.section_name)) &&
              <Title level={5} style={{ marginBottom: "0px"}}>
                {courseData.course_title &&
                  <Link className={style.textLink} 
                  href={`/course?course_id=${courseData.course_id}`}>{courseData.course_title}<br/></Link>
                }
                {courseData.section_name &&
                  <Link className={style.textLink} 
                  href={`/section?section_id=${courseData.section_id}&course_id=${courseData.course_id}`}>{courseData.section_name} <br/></Link>
                }
              </Title>
            }
            {courseData && courseData.subsection_name &&
              <Title level={4} style={{ marginTop: "0px"}}>
                {courseData.subsection_name}
              </Title>
            }
            </>
          }
          <Paragraph>
            {courseData.description}
          </Paragraph>
        </Typography>
        
        <div style={{textAlign: "center", margin: "30px 0"}}>
          { (selectedLang === "nl-NL") &&
            <Progress type="circle" percent={convertCommaToDot(courseData.progress) || 0} format={percent => `${percent.toString().replace(".",",")}%`} strokeColor="#25ddcc" />
          }
          { (selectedLang !== "nl-NL") &&
            <Progress type="circle" percent={courseData.progress || 0} format={percent => `${percent}%`} strokeColor="#25ddcc" />
          }
        </div>
        
        { /* (type === "course") && 
        <Paragraph>
          <FormattedMessage
            id= 'pages.student.course.side.exp'
            defaultMessage= 'Expiry Date'
          />: {epochToJsDate(courseData.expiry_date)}
        </Paragraph>
        */ }

        </>
        }
      </Card>
    </Sider>
    </>
  );
};

export default CourseSider;
