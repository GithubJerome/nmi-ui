import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'umi';
import { List, Card, PageHeader, Typography, Progress, Button, Grid } from 'antd';
import { SmileFilled, TrophyFilled } from '@ant-design/icons';
import { convertCommaToDot, epochToJsDate } from '@/utils/utils';
import classNames from 'classnames';
import style from './style.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph } = Typography;

interface DataCardTitleBox {
  title: string;
  subtitle?: string;
}

const DataCardTitleBox: React.FC<DataCardTitleBox> = (props) => {
  return (
    <>
      <PageHeader
        title={
          <div className={style.cardTitleBox}>
            <div>
              { !props.subtitle && <Title level={5} style={{fontSize: "16px"}}>{props.title}<br/></Title> }
              { props.subtitle && 
                <Title level={5}>{props.subtitle}<br/>
                  <span className="course-card-subtitle">{props.title}</span>
                </Title>
              }
            </div>

          </div>
        }
        className="site-page-header"
        /* extra={[
          <SmileFilled key={props.title} style={{color: "#f3a821", fontSize: "30px"}} />
        ]} */
      />
    </>
  )
}


interface DataCardProgressBar {
  progress: 0
}

const DataCardProgressBar: React.FC<DataCardProgressBar> = (props) => {
  const currentProgressLocation = (prog) => {
    let textLocation = 0;
    if(prog > 10) {
      textLocation = prog - 5;
    } 
    if (prog > 89){
      textLocation = prog - 15;
    }
    return `${textLocation}%`;
  }

  return (
    <>  
      <div className={style.cardProgressBox} >
        <span className="ant-progress-text" style={{marginLeft: currentProgressLocation(props.progress)}}>{props.progress}%</span>
        <Progress strokeColor="#00AE83" percent={convertCommaToDot(props.progress) || 0} showInfo={false} />
      </div>
    </>
  )
}


interface DataCardProps {
  cardDataSource: object[];
  type: string;
  loading?:boolean;
  siderCollapse?:boolean;
  cardPagination?:any;
}

const DataCard: React.FC<DataCardProps> = (props) => {
    const { cardDataSource, type, loading, cardPagination } = props;
    const screens = useBreakpoint();
    const [cardLimit, setCardLimit] = useState<number>(3);
    const [showAll, setShowAll] = useState<boolean>(false);
    
    const loadAllCard = (total:number) => {
      setShowAll(true);
      setCardLimit(total);
    }

    useEffect(() => {
      if(screens.xxl) {
        setCardLimit(3);
      } else if(screens.xl) {
        setCardLimit(3);
      } else if(screens.lg) {
        setCardLimit(2);
      } else if(screens.md) {
        setCardLimit(2);
      } else {
        setCardLimit(1);
      }
    }, [screens]);

    const listClassesCondition = classNames({
      [style.dataListCard] : true,
      [style.isMobileSize]: !screens.md
    });

    return (
      <>
        <List
          loading={loading}
          pagination={cardPagination}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          /* footer={
            <> 
            { !showAll &&
              (cardDataSource.length > 3) &&
              <Button type="text" onClick={() => loadAllCard(cardDataSource.length)}>
                <FormattedMessage
                  id="pages.student.dashboard.see-all"
                  defaultMessage="SEE ALL"
                />
              </Button>
            }
            </>
          } */
          rowKey="course_id"
          className={listClassesCondition}
          dataSource={cardDataSource}

          renderItem={item => (
            <List.Item>
              { 
              type === "course" &&
              <a href={`/course?course_id=${item.course_id}`}> 
                <Card
                  title={
                    <DataCardTitleBox title={item.course_title} />
                  }
                  style={{ background: `url(${item.image_url}) center / cover`}}
                  // className={style.cardBox}
                  // actions={[
                  //   /* <a>
                  //     <FormattedMessage
                  //       id="pages.student.dashboard.more"
                  //       defaultMessage="More"
                  //     />
                  //   </a>, */
                  //   <a key={item.course_id} href={`/course?course_id=${item.course_id}`}>
                  //     <FormattedMessage
                  //       id="pages.student.dashboard.course-page"
                  //       defaultMessage="Course Page"
                  //     />
                  //   </a>,
                  // ]}
                >
                  {/* <div className={style.courseDescription}>
                    <Paragraph ellipsis={{ rows: 2, expandable: false, symbol: '...' }}>
                      {item.description}
                    </Paragraph>
                  </div> */}
                  <div className="extra-info">
                    { /* <Paragraph>
                      <FormattedMessage
                        id="pages.student.dashboard.my-courses.table.difficulty_level"
                        defaultMessage="Difficulty level"
                      />: {item.difficulty_level}
                    </Paragraph> */ }
                    {/* <Paragraph ellipsis={{ rows: 1, expandable: false, symbol: '...' }}>
                      <FormattedMessage
                        id="pages.student.dashboard.my-courses.table.requirements"
                        defaultMessage="Requirements"
                      />: {item.requirements}</Paragraph> */}
                    { /* <Paragraph>
                      <FormattedMessage
                        id="pages.student.dashboard.my-courses.table.expiry_date"
                        defaultMessage="Expiry"
                      />: {epochToJsDate(item.expiry_date)}
                    </Paragraph> */ }
                  </div>
                  <DataCardProgressBar progress={item.progress} />
                </Card>
                </a>
               }

               {
                 type === "skill" &&
                 <Card
                    title={
                      <DataCardTitleBox title={item.section_name} subtitle={item.subsection_name} />
                    }
                    /*
                    actions={[
                      <a>
                        <FormattedMessage
                          id="pages.student.dashboard.more"
                          defaultMessage="More"
                        />
                      </a>,
                      <a>
                        <FormattedMessage
                          id="pages.student.dashboard.course-page"
                          defaultMessage="Course Page"
                        />
                      </a>,
                    ]} */
                >
                  <Paragraph>
                    <FormattedMessage
                      id="pages.student.dashboard.my-skills.table.answered_questions"
                      defaultMessage="Questions answered"
                    />: {item.answered_questions}<br/>
                    <FormattedMessage
                      id="pages.student.dashboard.my-skills.table.correct"
                      defaultMessage="% Correct"
                    />: {item.correct}%<br/>
                    <FormattedMessage
                      id="pages.student.dashboard.my-skills.table.progress"
                      defaultMessage="Progress"
                    />: {item.progress}%<br/>
                    <FormattedMessage
                      id="pages.student.dashboard.my-skills.table.time_studied"
                      defaultMessage="Time studied"
                    />: {item.time_studied}
                  </Paragraph>
                  <DataCardProgressBar progress={item.progress} />
                </Card>
               }
            </List.Item>
          )}
        />
      </>
    );
}

export default DataCard;