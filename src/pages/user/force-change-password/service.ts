import request from 'umi-request';
import { API_URL } from '@/utils/utils';

export interface AuthKeyParamsType {
  new_password: string;
  old_password: string;
}

export async function forceChangePassword(params: AuthKeyParamsType, headers) {
  return request(`${API_URL }user/force/change-password`, {
    method: 'PUT',
    data: params,
    headers: headers
  });
}
