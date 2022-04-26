import request from 'umi-request';
import { API_URL } from '@/utils/utils';

export interface AuthKeyParamsType {
  email: string;
  new_password: string;
  reset_token: string;
}

export async function resetPassword(params: AuthKeyParamsType) {
  return request(`${API_URL }user/reset/password`, {
    method: 'PUT',
    data: params,
  });
}
