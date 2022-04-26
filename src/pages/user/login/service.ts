import request from 'umi-request';
import { API_URL } from '@/utils/utils';

export interface LoginParamsType {
  username: string;
  password: string;
  url?: string;
}

export async function accountLogin(params: LoginParamsType) {
  console.log("process.env === ", process.env);
  return request(API_URL+`user/login`, {
    method: 'POST',
    data: params,
  });
}
