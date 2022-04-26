import request from 'umi-request';
import { API_URL } from '@/utils/utils';

export interface AuthKeyParamsType {
  email: string;
}

export async function authenticateKey(params: AuthKeyParamsType) {
  return request(`${API_URL }user/authentication-key`, {
    method: 'PUT',
    data: params,
  });
}
