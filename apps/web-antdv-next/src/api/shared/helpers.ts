import type { components, paths } from '../types';

/**
 * OpenAPI 支持的 HTTP 方法
 */
export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'trace';

/**
 * 提取 OpenAPI schema 类型
 */
export type Schema<K extends keyof components['schemas']> =
  components['schemas'][K];

/**
 * 获取支持指定 method 的 path
 */
export type PathsWithMethod<M extends HttpMethod> = {
  [P in keyof paths]: M extends keyof paths[P]
    ? NonNullable<paths[P][M]> extends never
      ? never
      : P
    : never;
}[keyof paths];

/**
 * 获取某个 path + method 对应的 operation
 */
export type Operation<
  P extends keyof paths,
  M extends HttpMethod,
> = M extends keyof paths[P] ? NonNullable<paths[P][M]> : never;

/**
 * 提取路径参数类型
 */
export type PathParams<
  P extends keyof paths,
  M extends HttpMethod,
> = Operation<P, M> extends {
    parameters: {
      path?: infer Params;
    };
  }
  ? Params extends never
    ? never
    : Params
  : never;

/**
 * 提取查询参数类型
 */
export type QueryParams<
  P extends keyof paths,
  M extends HttpMethod,
> = Operation<P, M> extends {
    parameters: {
      query?: infer Q;
    };
  }
  ? Q extends never
    ? never
    : Q
  : never;

/**
 * 提取请求体类型
 */
export type RequestBody<
  P extends keyof paths,
  M extends HttpMethod,
> = Operation<P, M> extends {
    requestBody?: {
      content: {
        'application/json': infer B;
      };
    };
  }
  ? B
  : never;

/**
 * 提取原始响应类型
 */
export type ResponseRaw<
  P extends keyof paths,
  M extends HttpMethod,
  Status extends number = 200,
> = Operation<P, M> extends {
    responses: {
      [S in Status]: {
        content: {
          'application/json': infer R;
        };
      };
    };
  }
  ? R
  : never;

/**
 * 提取响应 data 类型
 */
export type ResponseData<
  P extends keyof paths,
  M extends HttpMethod,
  Status extends number = 200,
> = ResponseRaw<P, M, Status> extends {
    data?: infer D;
  }
  ? D
  : ResponseRaw<P, M, Status>;

/**
 * 后端统一响应信封
 */
export interface ApiEnvelope<T> {
  code: number;
  data?: T;
  message: string;
  trace_id?: string | null;
}

/**
 * 分页响应类型
 */
export interface PageResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

/**
 * 提取分页响应的 items 类型
 */
export type PageItems<T> = T extends PageResponse<infer U> ? U : T;

/**
 * 从字符串 path 中提取路径参数
 *
 * 例：
 * '/api/v1/materials/{id}' => { id: string | number }
 */
export type ExtractPathParams<P extends string> =
  P extends `${infer _Start}{${infer Param}}${infer Rest}`
    ? { [K in Param]: string | number } & ExtractPathParams<Rest>
    : {};

/**
 * 如果路径没有参数，则 pathParams 不允许传
 */
export type PathParamsOption<P extends string> =
  keyof ExtractPathParams<P> extends never ? never : ExtractPathParams<P>;

/**
 * 构建完整 URL，替换路径参数
 */
export function buildUrl<P extends string>(
  path: P,
  params?: ExtractPathParams<P>,
): string {
  if (!params) return path;

  let url = path as string;

  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
  }

  return url;
}
