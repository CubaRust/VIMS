import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace UserApi {
  /** 后端 /auth/me 原始返回 */
  export interface MeResponse {
    id: number;
    user_code: string;
    user_name: string;
    login_name: string;
    mobile?: string;
    is_active: boolean;
    roles: string[];
    permissions: string[];
    tenant_id: number;
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const me = await requestClient.get<UserApi.MeResponse>('/auth/me');

  return {
    userId: String(me.id),
    username: me.login_name,
    realName: me.user_name,
    avatar: '',
    desc: me.mobile || '',
    homePath: '/analytics',
    roles: me.roles || [],
  } as UserInfo;
}
