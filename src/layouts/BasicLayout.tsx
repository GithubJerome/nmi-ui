/**
 * NMI Oefenpagina v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  DefaultFooter,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Link, useIntl, connect, Dispatch, FormattedMessage, Redirect } from 'umi';
import { Result, Button, Popover, List, Modal, Alert, Skeleton, Typography } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { getAuthorityFromRouter, getLocale } from '@/utils/utils';
import styles from './BasicLayout.less';
import logo from '../assets/logo1.png';
import { QuestionOutlined, VideoCameraOutlined, WechatOutlined } from '@ant-design/icons';
import request from 'umi-request';
import { getPageQuery, getUserData, API_URL } from '@/utils/utils';
import TextArea from 'antd/lib/input/TextArea';
import { history } from 'umi';
import { ConfigProvider } from 'antd';
import nl_NL from 'antd/lib/locale/nl_NL';
import en_US from 'antd/lib/locale/en_US';
import { isNil } from 'lodash';

const { Paragraph } = Typography;

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};
/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const defaultFooterDom = (
  <DefaultFooter
    className={styles.footer}
    copyright={`${new Date().getFullYear()} NMI Oefenpagina`}
    links={[
      {
        key: 'NMI Oefenpagina',
        title: '',
        href: 'https://www.nmi.com/',
        blankTarget: true,
      }
    ]}
  />
);

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  
  /**
   * constructor
   */
  const [visible, setVisible] = useState<boolean>(false);
  const [vidTutsVisible, setVidTutsVisible] = useState<boolean>(false);
  const [vidTutsLoading, setVidTutsLoading] = useState<boolean>(true);
  const [vidTutsData, setVidTutsData] = useState<object>([]);
  const [vidTutsNotAvailable, setVidTutsNotAvailable] = useState<boolean>(true);
  const [issueModsVisible, setIssueModsVisible] = useState<boolean>(false);
  const [alrt, setAlrt] = useState<object>({
    message: "",
    type: ""
  });
  const [detailsProblem, setDetailsProblem] = useState<string>("");
  const [dknowModsVisible, setDknowModsVisible] = useState<boolean>(false);
  const [dknowText, setDknowText] = useState<string>("");

  const queryVidTUts = (req: { type:string; key: string;}) => {
    const userData = getUserData();
    if(userData === null){ return; }

    let params;
    if(req.type === "subsection") {
      params = {
        subsection_id: req.key,
        limit : 20, page : 1
      }
    } else {
      params = {
        exercise_id: req.key,
        limit : 20, page : 1
      }
    }

    request
    .get(`${API_URL}help`, {
      headers: {
        token: userData.token,
        userid: userData.id
      },
      params
    })
    .then((response) => {
      if (response.status === "Failed") {
        setVidTutsVisible(false);
      } else {
        setVidTutsNotAvailable(false);
        setVidTutsData(response.data.rows);
      }
      setVidTutsLoading(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };

  const checkLogoLink = () => {
    const userData = getUserData();
    if(userData === null){
      return "/";
    }
    // if(userData.roles[0].role_name === "tutor"){
    if(userData.current_role_name === "tutor"){
      return "/tutor-dashboard";
    } 
    
    if(userData.current_role_name === "manager"){
      // if(userData.roles[0].role_name === "manager"){
      return "/admin/users";
    } 

    if(userData.current_role_name === "parent"){
      // if(userData.roles[0].role_name === "parent"){
      return "/account/settings";
    }
    return "/dashboard";
  }


  useEffect(() => {
    const userData = getUserData();
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
    if(userData && userData.force_change_password === true){
      const redirect = "/user/force-change-password";
      history.replace(redirect);
    }
  }, []);

  useEffect(() => {
    setVidTutsNotAvailable(true);
    
    const params = getPageQuery();
    const { subsection_id, exercise_id } = params as { subsection_id: string; exercise_id: string};
    
    if((location.pathname === "/subsection" ||
        location.pathname === "/exercise-overview" ||
        location.pathname === "/exercise" ||
        location.pathname === "/exercise-instructions"
        ) && (subsection_id || exercise_id)
      ) {
      if(subsection_id) {
        queryVidTUts({ type: 'subsection', key: subsection_id});
      } else {
        queryVidTUts({ type: 'exercise', key: exercise_id});
      }
    }
    
    if(!isNil(authorized.authority)) {
      const userData = getUserData();
      // const currentRole = userData.roles[0].role_name;
      const currentRole = userData.current_role_name;
      if(!authorized.authority.includes(currentRole)) {
        window.location.href = checkLogoLink();
      }
    }

  }, [location.pathname]);
  /**
   * init variables
   */

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const hide = () => {
    setVisible(false);
  };

  const handleVisibleChange = (visible: boolean): void => {
    setVisible(visible);
  };

  const closeVidTutsModal = () => {
    setVidTutsVisible(false);
  }

  const loadVidTutsModal = () => {
    setVidTutsVisible(true);
  }

  const getWhatToDo = (params: { page: string; }) => {
    const userData = getUserData();
    if(userData === null){
      return;
    }
    request
      .get(API_URL+`what-to-do`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        params
      })
      .then((response) => {
        setDknowText(response.data);
        setDknowModsVisible(true);
        if (response.status === "Failed") {
          message.error(response.alert);
          let redirect = "/user/login";
          history.replace(redirect);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const sendIssue = () => {
    const userData = getUserData();
    if(userData === null){
      return;
    }
    request
      .post(API_URL+`issue/create`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: {
          "course_id": "",
          "course_question_id": "",
          "description": detailsProblem,
          "exercise_id": "",
          "section_id": "",
          "subsection_id": "",
          "url": window.location.href
        }
      })
      .then((response) => {
        setIssueModsVisible(false);
        setAlrt(({
          message: response.message,
          type: response.status === "ok" ? "success" : "error"
        }));
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

  const { formatMessage } = useIntl();

  const getLang = () => {
    const localData = getLocale();
    if(localData === "en-US"){
      return en_US;
    } 
    if(localData === "nl-NL"){
      return nl_NL;
    }
    return en_US;
  }

  const isLogin = () => {
    const userData = getUserData();

    if (isNil(userData)) {
      return false;
    }
    return true;
  }

  return (
    <ConfigProvider locale={getLang()}>
      <ProLayout
        className="custom-layout"
        logo={logo}
        // formatMessage={formatMessage}
        menuHeaderRender={(logoDom) => (
          <Link to={checkLogoLink} className={styles.logo}>
            {logoDom}
          </Link>
        )}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>
              <span className="ant-pro-menu-item">
                <span className="ant-pro-menu-item-title">
                  <FormattedMessage
                    id={`menu.config.${defaultDom.props.children[1].props.children}`}
                    defaultMessage={defaultDom.props.children[1].props.children}
                  />
                </span>
              </span>
            </Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: "",
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        {...props}
        {...settings}
      >
        {
          alrt.message !== "" && alrt.type !== "" &&
          <Alert message={alrt.message} type={alrt.type} style={{ width: "250px", "text-align": "center", "margin-left": "40%" }} />
        }
        <Authorized authority={authorized!.authority} noMatch={(isLogin()) ? noMatch : ""}>
          {children}
          <Popover
            title={<div style={{ fontSize: "15px", textAlign: "center", fontWeight: "bold"}}>{formatMessage({
              id: 'help.config.help',
              defaultMessage: "We're here to help",
            })}</div>}
            trigger="click"
            visible={visible}
            placement="topRight" 
            onVisibleChange={handleVisibleChange}
            content={(
              <>
                <Button ghost disabled={vidTutsNotAvailable} className={styles.helpWatchVid} icon={<VideoCameraOutlined />} onClick={()=> {
                      hide();
                      loadVidTutsModal()
                    }}>
                  {formatMessage({
                    id: 'help.config.watch-vid',
                    defaultMessage: 'Watch a video tutorial',
                  })}
                </Button>
                { /* <div>
                  <WechatOutlined className={styles.helpChatTut}/> &nbsp;
                  {formatMessage({
                    id: 'help.config.chat-tutor',
                    defaultMessage: 'Chat with a tutor',
                  })}
                </div>
                <List
                  size="small"
                  dataSource={[
                    formatMessage({
                      id: 'help.config.i-dont-know',
                      defaultMessage: "I don’t know what to do.",
                    }),
                    formatMessage({
                      id: 'help.config.sth-wrong',
                      defaultMessage: "Something is wrong with the page"
                    }),
                  ]}
                  renderItem={(item,i) => <List.Item style={{ cursor: "pointer", color: "blue", textDecoration: "underline"}}>
                    {i === 0 && <div onClick={()=> {
                      hide();
                      getWhatToDo({page: "default"});
                    }}>{item}</div>}
                    {i === 1 && <div onClick={()=> {
                      hide();
                      setIssueModsVisible(true);
                    }}>{item}</div>}
                  </List.Item>}
                /> */ }
              </>
            )}
          >
            <Button
              className={styles.helpBubbleButton}
              icon={<QuestionOutlined />} shape="circle" size="large" style={{
              position: "fixed",
              right: "15px",
              bottom: "15px",
              zIndex: 9 }}
              title={formatMessage({
                id: 'help.config.help',
                defaultMessage: 'HELP',
              })}
            />
          </Popover>
        </Authorized>
      </ProLayout>
      
      <Modal
        className={styles.vidTutsContainer}
        title={formatMessage({
          id: 'help.config.watch-vid',
          defaultMessage: "Video tutorial",
        })}
        visible={vidTutsVisible}
        onOk={closeVidTutsModal}
        onCancel={closeVidTutsModal}
        footer={[
          <Button onClick={closeVidTutsModal}>
            <FormattedMessage
                id="pages.modal.close"
                defaultMessage="Close"
              />
          </Button>
        ]}
        destroyOnClose
      >
        <Skeleton loading={vidTutsLoading} active>
          <List
            itemLayout="horizontal"
            dataSource={vidTutsData}
            pagination={{
              pageSize: 1,
              hideOnSinglePage: true
            }}
            renderItem={(item:any) => (
              <List.Item key={item.video_id}>
                <div style={{height: "300px", width: "100%"}}>
                  <ReactPlayer url={item.url} width="100%" height="100%" controls />
                </div>
              </List.Item>
            )}
          />
        </Skeleton>
      </Modal>

      <Modal
          title={formatMessage({
            id: 'help.config.send-details',
            defaultMessage: "Send us details of the problem",
          })}
          visible={issueModsVisible}
          onOk={()=> sendIssue()}
          onCancel={()=> setIssueModsVisible(false)}
        >
        <TextArea rows={4} value={detailsProblem} onChange={()=>setDetailsProblem(event?.target.value)} />
      </Modal>
      <Modal
          title={formatMessage({
            id: 'help.config.dont-know',
            defaultMessage: "Don't know what to do?"
          })}
          visible={dknowModsVisible}
          onOk={()=> setDknowModsVisible(false)}
          onCancel={()=> setDknowModsVisible(false)}
        >
        <span>{dknowText}</span>
      </Modal>
    </ConfigProvider>
  );
};

export default connect(({ global, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
