import request from 'umi-request';
import { getUserData } from '@/utils/utils';

export interface userParamsType {
  account_id: string;
  companies: string[];
  roles: string[];
  groups: string[];
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  url: string;
  password: string;
  status: boolean;
}

export async function saveCurrentUser(params: userParamsType) {
  const { REACT_APP_API_URL } = process.env;
  const userData = getUserData();
  console.log("saveCurrentUser params == ", params);
  return request(`${REACT_APP_API_URL }/user/update`, {
    headers: {
      token: userData.token,
      userid: userData.id,
    },
    method: 'PUT',
    data: params,
  });
}


export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function queryProvince() {
  return request('/api/geographic/province');
}

export async function queryCity(province: string) {
  return request(`/api/geographic/city/${province}`);
}

export async function query() {
  return request('/api/users');
}
