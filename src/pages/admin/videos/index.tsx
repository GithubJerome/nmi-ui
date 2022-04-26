import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import request from 'umi-request';
import { getUserData, epochToJsDate, API_URL } from '@/utils/utils';
import { Col, Row, Button, Card, Form, message, Progress, Typography, Collapse, List, Input, Alert, Statistic, Table, Modal, Checkbox, Popconfirm } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { size } from 'lodash';
import { FormInstance } from 'antd/lib/form';
import { colVideo } from '@/utils/tableColumns';
import style from './style.less';

const { Title } = Typography;
const { confirm } = Modal;

const VideosPage: React.FC<{}> = () => {
  const [selectedVideos , setSelectedVideos] = useState<object[]>([]);
  const [videos, setVideos] = useState<object[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [totalRow, setTotalRow] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [videoAddBtnLoading, setVideoAddBtnLoading] = useState<boolean>(false);
  const [videosDataLoading, setVideosDataLoading] = useState<boolean>(false);
  const [videoDeleteBtnLoading, setVideoDeleteBtnLoading] = useState<boolean>(false);
  const [visibleAddVideoModal, setVisibleAddVideoModal] = useState<boolean>(false);
  
  const formRef = React.createRef<FormInstance>();
  const intl = useIntl();

  const videoColumn = [...colVideo];

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
        setTotalRow(response.total_rows);
        setVideos(response.rows);
        setVideosDataLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const addVideo = (values: any) => {
    const userData = getUserData();
    setVideoAddBtnLoading(true);
    
    const params = {
      "video_name": values.video_name,
      "url": values.url,
      "description": values.description
    }

    request
      .post(`${API_URL}videos/add`, {
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
        
        setVisibleAddVideoModal(false)
        setVideoAddBtnLoading(false);
        queryVideos({limit: pageSize, page: current});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const deleteSelectedVideos = (params: { video_ids: object }) => {
    if(selectedVideos.length > 0) {
      const userData = getUserData();
      setVideoDeleteBtnLoading(true);
      setVideosDataLoading(true);
      
      request
      .delete(`${API_URL}videos/delete`, {
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

        queryVideos({limit: pageSize, page: current});
        setVideoDeleteBtnLoading(false);
        setSelectedVideos([]);
      })
      .catch((error) => {
        console.log(error);
      });

    }
  }

  const showDeleteConfirm = () => {
    if(selectedVideos.length > 0) {
      confirm({
        title: intl.formatMessage({
          id: 'pages.manager.general.modal.confirm',
          defaultMessage: 'Are you sure?',
        }),
        icon: <ExclamationCircleOutlined />,
        onOk() {
          deleteSelectedVideos({ video_ids: selectedVideos})
        },
        onCancel() {},
      });
    }
  }
  
  useEffect(() => {
    queryVideos({limit: pageSize, page: current});
  }, []);

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };

  const tailLayout = {
    wrapperCol: { offset: 5, span: 19 },
  };

  const rowSelection = {
    onChange: (selectedRowKeys:any) => {
      setSelectedVideos(selectedRowKeys);
    },
  };

  const onChangeVideosTable = (data:any) => {
    setPageSize(data.pageSize);
    setCurrent(data.current);
    queryVideos({limit: data.pageSize, page: data.current});
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
                <Col sm={24}>
                  <Title level={4}>
                    <FormattedMessage
                      id="pages.manager.videos.title"
                      defaultMessage="Videos"
                    />
                  </Title>
                </Col>
              </Row>
              <br/>
              <Row gutter={24}>
                <Col sm={12} xs={12} lg={12}>
                  <Button icon={<PlusOutlined />} type="primary" onClick={()=>setVisibleAddVideoModal(true)} style={{ marginBottom: 16, marginRight: 10 }}>
                    <FormattedMessage
                      id="pages.manager.videos.add.button"
                      defaultMessage="ADD VIDEO"
                    />
                  </Button>
                </Col>    
                <Col sm={12} xs={12} lg={12} style={{textAlign: "right"}}>
                  <Button icon={<DeleteOutlined />} type="danger" loading={videoDeleteBtnLoading} onClick={showDeleteConfirm} style={{ marginBottom: 16 }}>
                    <FormattedMessage
                      id="pages.manager.videos.delete.button"
                      defaultMessage="DELETE VIDEO"
                    />
                  </Button>
                </Col>
              </Row>
              <Table 
                loading={videosDataLoading} 
                rowKey="video_id" 
                rowSelection={rowSelection} 
                dataSource={videos} 
                columns={videoColumn} 
                pagination={{
                  pageSize, 
                  current, 
                  total: totalRow,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showSizeChanger: true
                }}
                onChange={onChangeVideosTable}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>

      <Modal
        width="50%"
        title={intl.formatMessage({
          id: 'pages.manager.videos.modal.title',
          defaultMessage: 'Add Video',
        }) }
        visible={visibleAddVideoModal}
        destroyOnClose
        onCancel={()=> {formRef.current.resetFields();setVisibleAddVideoModal(false)}}
        footer={[
          <Button form="addVideo" key="submit" htmlType="submit" loading={videoAddBtnLoading} type="primary" >
            <FormattedMessage
              id="pages.manager.users.modal2.ok.button"
              defaultMessage="Create"
            />
          </Button>
        ]}
      >
        <Form
          {...layout}
          id="addVideo"
          name="addVideo"
          ref={formRef}
          onFinish={addVideo}
          labelAlign="left"
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.videos.modal.form.video_name',
              defaultMessage: 'Video Name',
            })} 
            name="video_name"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.videos.modal.form.video_name.rules',
                defaultMessage: 'Please input your first name!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.videos.modal.form.url',
              defaultMessage: 'URL',
            })} 
            name="url"
            rules={[{ 
              required: true, 
              message: intl.formatMessage({
                id: 'pages.manager.videos.modal.form.url.rules',
                defaultMessage: 'Please enter URL!',
              }) 
            }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'pages.manager.videos.modal.form.description',
              defaultMessage: 'Description',
            })} 
            name="description"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </GridContent>
  );
};

export default VideosPage;
