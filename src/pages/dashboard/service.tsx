import request from 'umi-request';
import { getUserData, API_URL } from '@/utils/utils';

export interface DashboardParamsType {
  hours: number;
}

export async function getCourseData() {
  const userData = getUserData();

  return request(API_URL+`student/course`, {
    headers: {
      token: userData.token,
      userid: userData.id,
    },
    method: 'GET',
    params: {
      limit: 100,
      page: 1
    },
  });
}

export async function getSkillsData() {
  const userData = getUserData();

  return request(API_URL+`progress/student/skills`, {
    headers: {
      token: userData.token,
      userid: userData.id,
    },
    method: 'GET',
    params: {
      limit: 100,
      page: 1
    },
  });
}
