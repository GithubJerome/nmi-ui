import { Effect, history, Reducer } from 'umi';
import { message } from 'antd';
import { forceChangePassword } from './service';
import { getUserData } from '@/utils/utils';
export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    forceChangePassword: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'userAndForceChangePass',

  state: {
    status: undefined,
  },

  effects: {
    *forceChangePassword({ payload }, { call, put }) {
      console.log("payload == ", payload);
      try {
        const userData = getUserData();

        const headers = {
          userid: userData.id,
          token: userData.token
        }
        const response = yield call(forceChangePassword, payload, headers);
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        // Login successfully
        if (response.status === "ok") {
          message.success(response.message);
          userData.force_change_password = false;
          localStorage.setItem('nmi-user', JSON.stringify(userData));
          if(userData.current_role_name === "student"){
            // if(userData.roles[0].role_name === "student"){
            history.replace("/dashboard");
          } else if(userData.current_role_name === "tutor"){
          // } else if(userData.roles[0].role_name === "tutor"){
            history.replace("/tutor-dashboard");
          } else if(userData.current_role_name === "parent"){
          // } else if(userData.roles[0].role_name === "parent"){
            history.replace("/account/settings");
          } else {
            history.replace("/admin/users");
          }
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
      return {
        ...state,
        status: payload.status
      };
    },
  },
};

export default Model;
