import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, API_URL } from '@/utils/utils';
import { Col, Row, Button, Select, Card, Form, message, Progress, Typography, Collapse, List, Input, Alert, Statistic, Table, Modal, Checkbox, Popconfirm } from 'antd';
import { EditFilled } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import { colVideo, colSkillVideo } from '@/utils/tableColumns';
import style from './style.less';

const { Title } = Typography;

const SkillsPage: React.FC<{}> = () => {
  const [videos, setVideos] = useState<object[]>([]);
  const [skills, setSkills] = useState<object[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [totalRow, setTotalRow] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [videoCurrent, setVideoCurrent] = useState<number>(1);
  const [videoTotalRow, setVideoTotalRow] = useState<number>(1);
  const [videoPageSize, setVideoPageSize] = useState<number>(10);
  const [videoTableSelectedRows, setVideoTableSelectedRows] = useState<any>([]);

  const [editingKey, setEditingKey] = useState('');
  const [skillsDataLoading, setSkillsDataLoading] = useState<boolean>(false);
  const [videosDataLoading, setVideosDataLoading] = useState<boolean>(false);
  const [visibleEditSkillModal, setVisibleEditSkillModal] = useState<boolean>(false);
  
  const [addSkillVideoBtnLoading, setAddSkillVideoBtnLoading] = useState<boolean>(false);
  
  const intl = useIntl();

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
        }
        setVideoTotalRow(response.total_rows);
        setVideos(response.rows);
        setVideosDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const showEditSkillModal = (skillData: any) => {
    if(skillData) {
      if(skillData.videos && skillData.videos.length > 0) {
        setVideoTableSelectedRows(skillData.videos.map((item:any)=>item.video_id));
      } else {
        setVideoTableSelectedRows([]);
      }

      setEditingKey(skillData.skill_id);
      queryVideos({limit: videoPageSize, page: videoCurrent});
    }
    setVisibleEditSkillModal(true);
  }

  const querySkills = (params: { limit: number; page: number;}) => {
    const userData = getUserData();
    setSkillsDataLoading(true);
    
    request
      .get(`${API_URL}skills`, {
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
        setTotalRow(response.total_rows);
        setSkills(response.rows);
        setSkillsDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const queryAddSkillVideo = (params: { skill_id: string}) => {
    const userData = getUserData();
    setAddSkillVideoBtnLoading(true);
    
    const body = {
      "video_ids": (videoTableSelectedRows.length > 0) ? videoTableSelectedRows : [],
    }

    request
      .post(`${API_URL}video/skill/create`, {
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
        }
        setVisibleEditSkillModal(false);
        setAddSkillVideoBtnLoading(false);
        querySkills({limit: pageSize, page: current});
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  useEffect(() => {
    querySkills({limit: pageSize, page: current});
  }, []);

  const onChangeSkillsTable = (data:any) => {
    setPageSize(data.pageSize);
    setCurrent(data.current);
    querySkills({limit: data.pageSize, page: data.current});
  }

  const onChangeVideosTable = (data:any) => {
    setVideoPageSize(data.pageSize);
    setVideoCurrent(data.current);
    queryVideos({limit: data.pageSize, page: data.current});
  }

  const rowTableSelectionVideos = {
    onChange: (selectedRowKeys: any) => {
      setVideoTableSelectedRows(selectedRowKeys);
    }
  };

  const closeEditSkillModal = () => {
    setVisibleEditSkillModal(false);
  }

  const saveSkillVideo = (skill_id:any) => {
    queryAddSkillVideo({skill_id});
  }

  const skillColumnAction = {
    title: intl.formatMessage({
      id: 'pages.action',
      defaultMessage: 'Action',
    }),
    render: (skillData:any) => (
      <Button type="primary" size="small" icon={<EditFilled />} onClick={()=>showEditSkillModal(skillData)} />
    )
  };

  const skillColumn = [...colSkillVideo, skillColumnAction];


  return (
    <GridContent className={style.fontColor}>
      <React.Fragment>
        <Row gutter={24} type="flex">
          <Col sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card
              style={{ minHeight: 430 }}
            >
              <Row gutter={24} type="flex">
                <Col sm={24}>
                  <Title level={4}>
                    <FormattedMessage
                      id="pages.manager.skills.title"
                      defaultMessage="Skills"
                    />
                  </Title>
                </Col>
              </Row>
              <Table 
                className={style.skillTable}
                loading={skillsDataLoading} 
                rowKey="skill_id" 
                dataSource={skills} 
                columns={skillColumn} 
                pagination={{
                  pageSize, 
                  current, 
                  total: totalRow,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeSkillsTable}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>

      <Modal
        title={intl.formatMessage({
          id: 'pages.manager.skills.videos.modal.title',
          defaultMessage: 'Videos',
        })}
        visible={visibleEditSkillModal}
        destroyOnClose
        onCancel={closeEditSkillModal}
        width="75%"
        footer={[
          <Button onClick={() => saveSkillVideo(editingKey)} loading={addSkillVideoBtnLoading} type="primary" >
            <FormattedMessage
                id="pages.manager.skills.videos.modal.update"
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

export default SkillsPage;
