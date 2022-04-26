import { Effect, history, Reducer } from 'umi';
import { message } from 'antd';
import { accountLogin } from './service';
import { getPageQuery, setAuthority, setUserData, setLocale } from './utils/utils';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'userAndlogin',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      try {
        const response = yield call(accountLogin, payload);
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        // Login successfully
        if (response.status === true) {
          if(response.language === "nl-NL"){
            message.success('Succesvol ingelogd');
          } else {
            message.success('Login successful');
          }
          let redirect = "/dashboard";
          if(response.current_role_name === "manager"){
            // if(response.roles[0].role_name === "manager"){
            redirect = "/admin/users";
          } else if(response.current_role_name === "tutor"){
          // } else if(response.roles[0].role_name === "tutor"){
            redirect = "/tutor-dashboard";
          } else if(response.current_role_name === "parent"){
          // } else if(response.roles[0].role_name === "parent"){
            redirect = "/account/settings";
          }
          // history.replace(redirect);
          window.location.href = redirect
        } else {
          message.error(response.alert);
        }
      } catch(err) {
        console.log("err === ", err);
        message.error("Server Error: Please contact your administrator!");
      }
      
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority(payload.roles[0].role_name);
      setAuthority(payload.current_role_name);
      setUserData(payload);
      console.log("login response language === ", payload.language);
      if(payload.language){
        setLocale(payload.language);
      }
      return {
        ...state,
        status: payload.status,
        type: payload.type || "account",
      };
    },
  },
};

export default Model;
