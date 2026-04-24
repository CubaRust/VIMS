import type {
  HttpMethod,
  PathsWithMethod,
  PathParamsOption,
  QueryParams,
  RequestBody,
  ResponseData,
} from '#/api';
import type { paths } from '../types';

import { requestClient } from '#/api/request';

import { buildUrl } from '#/api';

/**
 * API 请求选项
 */
export interface ApiRequestOptions<
  P extends keyof paths,
  M extends HttpMethod,
> {
  params?: QueryParams<P, M>;
  pathParams?: PathParamsOption<P & string>;
  body?: RequestBody<P, M>;
  debug?: boolean;
  timeout?: number;
}

/**
 * 调试日志
 */
function logRequest(
  method: string,
  url: string,
  data?: unknown,
  params?: unknown,
) {
  console.group(`🔵 API ${method} ${url}`);
  if (params) console.log('Query:', params);
  if (data) console.log('Body:', data);
  console.groupEnd();
}

function logResponse(
  method: string,
  url: string,
  response: unknown,
  duration: number,
) {
  console.group(`🟢 API ${method} ${url} (${duration}ms)`);
  console.log('Response:', response);
  console.groupEnd();
}

function logError(
  method: string,
  url: string,
  error: unknown,
  duration: number,
) {
  console.group(`🔴 API ${method} ${url} (${duration}ms)`);
  console.error('Error:', error);

  const maybeError = error as { response?: { data?: unknown } };
  if (maybeError.response?.data) {
    console.error('Error Data:', maybeError.response.data);
  }

  console.groupEnd();
}

/**
 * 核心请求函数
 */
async function requestApi<
  P extends keyof paths,
  M extends HttpMethod,
>(
  method: M,
  path: P,
  options?: ApiRequestOptions<P, M>,
): Promise<ResponseData<P, M>> {
  const { pathParams, params, body, debug, timeout } = options || {};

  const url = pathParams
    ? buildUrl(path as string, pathParams)
    : (path as string);

  const methodName = String(method).toUpperCase();
  const startTime = Date.now();

  try {
    if (debug) {
      logRequest(methodName, url, body, params);
    }

    const response = await requestClient.request<ResponseData<P, M>>(url, {
      method: methodName,
      params,
      data: body,
      timeout,
    } as any);

    if (debug) {
      logResponse(methodName, url, response, Date.now() - startTime);
    }

    return response;
  } catch (error) {
    if (debug) {
      logError(methodName, url, error, Date.now() - startTime);
    }

    throw error;
  }
}

/**
 * 类型安全 API 客户端
 */
export const api = {
  /**
   * 原始 request 方法
   */
  request: requestApi,

  /**
   * GET 请求
   */
  get<P extends PathsWithMethod<'get'>>(
    path: P,
    options?: Omit<ApiRequestOptions<P, 'get'>, 'body'>,
  ) {
    return requestApi('get', path, options);
  },

  /**
   * POST 请求
   */
  post<P extends PathsWithMethod<'post'>>(
    path: P,
    body?: RequestBody<P, 'post'>,
    options?: Omit<ApiRequestOptions<P, 'post'>, 'body'>,
  ) {
    return requestApi('post', path, {
      ...options,
      body,
    });
  },

  /**
   * PUT 请求
   */
  put<P extends PathsWithMethod<'put'>>(
    path: P,
    body?: RequestBody<P, 'put'>,
    options?: Omit<ApiRequestOptions<P, 'put'>, 'body'>,
  ) {
    return requestApi('put', path, {
      ...options,
      body,
    });
  },

  /**
   * DELETE 请求
   */
  delete<P extends PathsWithMethod<'delete'>>(
    path: P,
    options?: Omit<ApiRequestOptions<P, 'delete'>, 'body'>,
  ) {
    return requestApi('delete', path, options);
  },

  /**
   * PATCH 请求
   */
  patch<P extends PathsWithMethod<'patch'>>(
    path: P,
    body?: RequestBody<P, 'patch'>,
    options?: Omit<ApiRequestOptions<P, 'patch'>, 'body'>,
  ) {
    return requestApi('patch', path, {
      ...options,
      body,
    });
  },
};
