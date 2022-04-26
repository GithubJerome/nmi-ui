import { Effect, history, Reducer } from 'umi';

import { AnalysisData } from './data.d';
import { getCourseData, getSkillsData } from './service';
import { message } from 'antd';

export interface ModelType {
  namespace: string;
  state: AnalysisData;
  effects: {
    fetch: Effect;
    fetchSystemInfo: Effect;
    fetchStagnationFlush: Effect;
    fetchWaterUsage: Effect;
    fetchLiquidUsage: Effect;
    fetchHygieneCompliance: Effect;
    fetchGroups: Effect;
  };
  reducers: {
    save: Reducer<AnalysisData>;
    clear: Reducer<AnalysisData>;
  };
}

const initState = {
  Course: [],
  Skills: []
};

const Model: ModelType = {
  namespace: 'dashboardAndanalysis',

  state: initState,

  effects: {
    *fetchCourse(_, { call, put }) {
      const response = yield call(getCourseData);
      console.log("saveCourseData === ", response);
      yield put({
        type: 'saveCourseData',
        payload: response.rows,
      });
      if (response.status === "Failed") {
        message.error(response.alert);
        let redirect = "/user/login";
        history.replace(redirect);
      }
    },
    *fetchSkills(_, { call, put }) {
      const response = yield call(getSkillsData);
      console.log("saveSkillsData === ", response);
      yield put({
        type: 'saveSkillsData',
        payload: response.rows,
      });
      if (response.status === "Failed") {
        message.error(response.alert);
        let redirect = "/user/login";
        history.replace(redirect);
      }
    },
  },

  reducers: {
    saveCourseData(state, { payload }) {
      return {
        ...state,
        Course: payload,
      };
    },
    saveSkillsData(state, { payload }) {
      return {
        ...state,
        Skills: payload,
      };
    },
    clear() {
      return initState;
    },
  },
};

export default Model;
