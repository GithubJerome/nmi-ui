import { Effect, history, Reducer } from 'umi';
import { message } from 'antd';
import { authenticateKey } from './service';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    authKey: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'userAndForgotPass',

  state: {
    status: undefined,
  },

  effects: {
    *authKey({ payload }, { call, put }) {
      try {
        const response = yield call(authenticateKey, payload);
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        // Login successfully
        if (response.status === "ok") {
          message.success(response.message);
          history.replace("/user/change-password");
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
