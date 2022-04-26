import { PlusOutlined, SettingOutlined, EditOutlined, EllipsisOutlined, LockOutlined, CaretUpOutlined, HeartOutlined, FireOutlined, SmileOutlined } from '@ant-design/icons';
import { Col, Row, Card, Progress, Typography, Radio, Button, Table, Tooltip } from 'antd';

import React from 'react';

import { Course, Skills } from '../data.d';
import styles from './index.less';
import { ChartCard } from './Charts';
import courseImg from '@/assets/course.png';
import Meta from 'antd/lib/card/Meta';
import { epochToJsDate, textAbstract } from '@/utils/utils';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { colSkills } from '@/utils/tableColumns';

const createCard = (course) => {
  const cards = [];
  
  course && course.length > 0 && course.map(c => {
    {console.log("c ==== ", c)}
    return cards.push(
      <a key={course.course_id} href={`/course?course_id=${c.course_id}`}>
        <Card
          style={{ minHeight: 270 }}
        >
          <Typography>
            <Title level={5}>
              {c.course_name}
              <SmileOutlined style={{ float: "right"}} />
            </Title>
            <Tooltip placement="topLeft" title={c.description}>
              <Paragraph>
                {textAbstract(c.description, 30)}
              </Paragraph>
            </Tooltip>
          </Typography>
          <Row gutter={24} type="flex" style={{ marginTop: "20px" }}>
            <Col sm={24} xs={24} style={{ textAlign: "center" }} >
              <Progress percent={c.progress || 90} />
            </Col>
            <Col sm={24} xs={24} >
              Requirements: <br/>
              {c.requirements} <br/><br/>
              Expiry Date: {epochToJsDate(c.expiry_date)}
            </Col>
          </Row>
        </Card>
      </a>
    )
  })
  console.log("cards === ", cards);

  return cards;
}

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

const { Title, Paragraph } = Typography;
const IntroduceRow = ({ loading, course, skills }: 
  { loading: boolean; course: Course[]; skills: Skills[] }) => (

  <Row gutter={24} type="flex">
    <Col sm={16} xs={24} style={{ marginBottom: 24 }}>
      <Card
        style={{ minHeight: 430, marginBottom: 20 }}
      >
        <Row gutter={24} type="flex">
          <Col sm={19} xs={24}>
            <Title level={4}>My Courses</Title>
          </Col>
          <Col sm={5} xs={24}>
            <Radio.Group
              options={[
                { label: 'Table', value: 'Table' },
                { label: 'Tiles', value: 'Tiles' }]}
              value={'Tiles'}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </Col>
        </Row>
        <Row gutter={24} type="flex">
          <Carousel
            swipeable={false}
            draggable={false}
            showDots={true}
            responsive={responsive}
            ssr={false} // means to render carousel on server-side.
            infinite={true}
            keyBoardControl={true}
            customTransition="all .5"
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
          >
            <div key="1">Item 1</div>
            <div key="2">Item 2</div>
            <div key="3">Item 3</div>
            <div key="4">Item 4</div>
          </Carousel>
          {/* {createCard(course)} */}
        </Row>
      </Card>

      <Card
        style={{ minHeight: 430 }}
      >
        <Row gutter={24} type="flex">
          <Col sm={19} xs={24}>
            <Title level={4}>My Skills</Title>
          </Col>
          <Col sm={5} xs={24}>
            <Radio.Group
              options={[
                { label: 'Table', value: 'Table' },
                { label: 'Grid', value: 'Grid' }]}
              value={'Table'}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </Col>
        </Row>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24}>
            {
              skills &&  
              <Table key="skillsTable" dataSource={skills} columns={colSkills}/>
            }
          </Col>
        </Row>
      </Card>
    </Col>
    <Col sm={8} xs={24} style={{ marginBottom: 24 }}>
      <Card
        style={{ minHeight: 430 }}
      >
        <Row gutter={24} type="flex">
          <Col sm={10} xs={24}>
            <Title level={4}>My Progress</Title>
          </Col>
          <Col sm={14} xs={24}>
            <Radio.Group
              options={[
                { label: 'Days', value: 'Days' },
                { label: 'Weeks', value: 'Weeks' },
                { label: 'Months', value: 'Months' }]}
              value={'Months'}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
          <Col sm={24} xs={24}>
            <Typography>
              <Title level={5}>
                Experience
              </Title>
            </Typography>
            <canvas id="canvas_5" width="672.5" height="312.5" style={{"width": "538px", height: "250px", cursor: "default"}}></canvas>
          </Col>
        </Row>

        <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
          <Col sm={24} xs={24}>
            <Title level={4}>My Medals</Title>

            <Row gutter={24} type="flex" style={{marginTop: "20px", textAlign: "center"}}>
              <Col sm={8} xs={24}>
                <FireOutlined style={{fontSize: "50px"}}/>
                <br/>
                <Typography>
                  <Title level={10}>11</Title>
                </Typography>
              </Col>
              <Col sm={8} xs={24}>
                <CaretUpOutlined style={{fontSize: "50px"}} />
                <br/>
                <Typography>
                  <Title level={10}>3</Title>
                </Typography>
              </Col>
              <Col sm={8} xs={24}>
                <HeartOutlined style={{fontSize: "50px"}} />
                <br/>
                <Typography>
                  <Title level={10}>1</Title>
                </Typography>
              </Col>
            </Row>

            <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
              <Col sm={2} xs={24}>
                <FireOutlined />
              </Col>
              <Col sm={22} xs={24}>
                <Progress percent={75} format={percent => `${percent}`} />
              </Col>
            </Row>
            <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
              <Col sm={2} xs={24}>
                <CaretUpOutlined />
              </Col>
              <Col sm={22} xs={24}>
                <Progress percent={50} format={percent => `${percent}`} />
              </Col>
            </Row>
            <Row gutter={24} type="flex" style={{marginTop: "20px"}}>
              <Col sm={2} xs={24}>
                <HeartOutlined />
              </Col>
              <Col sm={22} xs={24}>
                <Progress percent={25} format={percent => `${percent}`} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
    
  </Row>
);

export default IntroduceRow;
