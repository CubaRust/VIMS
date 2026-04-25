import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    login_name?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    user_id: number;
    login_name: string;
    expires_at: number;
    roles: string[];
    permissions: string[];
  }

  /** 刷新 token 响应数据 */
  export interface RefreshTokenData {
    token: string;
    user_id: number;
    login_name: string;
    expires_at: number;
    roles: string[];
    permissions: string[];
  }

  /** 刷新 token 完整响应（包含信封） */
  export interface RefreshTokenResult {
    code: number;
    data: RefreshTokenData;
    message: string;
    trace_id?: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/api/v1/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(token?: null | string) {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/api/v1/auth/refresh', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/api/v1/auth/logout');
}

/**
 * 获取用户权限码
 * 注意: 权限码已在登录时返回，此接口保留用于需要刷新权限的场景
 */
export async function getAccessCodesApi() {
  const me = await requestClient.get<{ permissions: string[] }>('/api/v1/auth/me');
  return me.permissions || [];
}
