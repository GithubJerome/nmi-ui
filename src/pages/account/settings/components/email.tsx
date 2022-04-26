import { getUserData, API_URL } from '@/utils/utils';
import { GridContent } from '@ant-design/pro-layout';
import { Checkbox, Col, Divider, Input, message, Spin, Radio, Row, Switch } from 'antd';
import React, { useEffect, useState, Fragment } from 'react';
import request from 'umi-request';
import { FormattedMessage, history } from 'umi';

const EmailView: React.FC<{}> = () => {
  const [userProfile, setUserProfile] = useState<object>({});
  const [userProfileLoading, setUserProfileLoading] = useState<boolean>(true);
  const [checkedList, setCheckedList] = useState<object>(['messages', 'assignments', 'updates']);
  const [indeterminate, setIndeterminate] = useState<boolean>(true);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [plainOptions, setPlainOptions] = useState<object>(['messages', 'assignments', 'progress', 'updates']);
  
  const queryUserProfile = () => {
    setUserProfileLoading(true);

    const currentUser = getUserData();
    request
    .get(`${API_URL}user/profile`, {
      headers: {
        token: currentUser.token,
        userid: currentUser.id
      },
    })
    .then((response) => {
      if (response.status === "Failed") {
        message.error(response.alert);
        history.replace("/user/login");
      }

      setUserProfile(response.data);
      setUserProfileLoading(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  
  const onChange = (list:any) => {
      setCheckedList(list)
      setIndeterminate(!!list.length && list.length < plainOptions.length)
      setCheckAll(list.length ===  plainOptions.length)
  };

  const onCheckAllChange = (e:any) => {
    setCheckedList(e.target.checked ? plainOptions : [])
    setIndeterminate(false)
    setCheckAll(e.target.checked)
  };

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  useEffect(() => {
    queryUserProfile();
  }, []);

  return (
    <Fragment>
      <GridContent>
        <Spin spinning={userProfileLoading}>
        { userProfile && userProfile.id &&
        <>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            <FormattedMessage
              id="pages.account.settings.email.redirect"
              defaultMessage="Redirect notifications"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Switch defaultChecked />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            <Input type="email" value={userProfile.email}/>
          </Col>
        </Row>
        <Divider />
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            <FormattedMessage
              id="pages.account.settings.email.notify"
              defaultMessage="Notify me about"
            />
            {/* <CheckboxGroup options={this.state.plainOptions} value={this.state.checkedList} onChange={this.onChange} /> */}
          </Col>
          <Col sm={12} xs={24}>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            &nbsp;&nbsp; <FormattedMessage
              id="pages.account.settings.email.messages"
              defaultMessage="messages"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Checkbox />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            &nbsp;&nbsp; <FormattedMessage
              id="pages.account.settings.email.assignment"
              defaultMessage="assignment"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Checkbox />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            &nbsp;&nbsp; <FormattedMessage
              id="pages.account.settings.email.progess"
              defaultMessage="progess"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Checkbox />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            &nbsp;&nbsp; <FormattedMessage
              id="pages.account.settings.email.updates"
              defaultMessage="updates"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Checkbox />
          </Col>
        </Row>
        <Row gutter={24} type="flex" style={{marginBottom: "10px"}}>
          <Col sm={12} xs={24}>
            <FormattedMessage
              id="pages.account.settings.email.freq"
              defaultMessage="Email frequency"
            />
          </Col>
          <Col sm={12} xs={24}>
            <Row gutter={24} type="flex">
              <Col sm={24} xs={24}>
                <Radio.Group>
                  <Radio style={radioStyle} value={1}>
                    <FormattedMessage
                      id="pages.account.settings.email.freq.rightaway"
                      defaultMessage="right away"
                    />
                  </Radio>
                  <Radio style={radioStyle} value={2}>
                    <FormattedMessage
                      id="pages.account.settings.email.freq.everyday"
                      defaultMessage="every day"
                    />
                  </Radio>
                  <Radio style={radioStyle} value={3}>
                    <FormattedMessage
                      id="pages.account.settings.email.freq.everyweek"
                      defaultMessage="every week"
                    />
                  </Radio>
                  <Radio style={radioStyle} value={4}>
                    <FormattedMessage
                      id="pages.account.settings.email.freq.everymonth"
                      defaultMessage="every month"
                    />
                  </Radio>
                </Radio.Group>
              </Col>
              {/* <Col sm={24} xs={24}>
                <Radio>every day</Radio>
              </Col>
              <Col sm={24} xs={24}>
                <Radio>every week</Radio>
              </Col>
              <Col sm={24} xs={24}>
                <Radio>every month</Radio>
              </Col> */}
            </Row>
          </Col>
        </Row>
        </>
        }
        </Spin>
      </GridContent>
    </Fragment>
    );
}

export default EmailView;
