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
 * 增强请求选项
 */
export interface EnhancedRequestOptions<
  P extends keyof paths,
  M extends HttpMethod,
> {
  params?: QueryParams<P, M>;
  pathParams?: PathParamsOption<P & string>;
  body?: RequestBody<P, M>;

  debug?: boolean;
  label?: string;

  /**
   * 建议只在 GET 请求使用缓存
   */
  cache?: boolean | { ttl?: number; key?: string };

  retry?: boolean | { times?: number; delay?: number };

  /**
   * 传入 mock 后不会发送真实请求
   */
  mock?: ResponseData<P, M>;

  timeout?: number;
}

/**
 * 请求统计
 */
interface RequestStats {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
}

/**
 * 简单内存缓存
 */
class ApiCache {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();

  clear(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set(key: string, data: unknown, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  size() {
    return this.cache.size;
  }
}

const apiCache = new ApiCache();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 执行请求，支持重试
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  retry?: boolean | { times?: number; delay?: number },
): Promise<T> {
  if (!retry) return fn();

  const times = typeof retry === 'object' ? retry.times ?? 3 : 3;
  const delay = typeof retry === 'object' ? retry.delay ?? 1000 : 1000;

  let lastError: unknown;

  for (let i = 0; i < times; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < times - 1) {
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function getCacheKey(
  url: string,
  params?: unknown,
  cache?: boolean | { key?: string },
) {
  if (typeof cache === 'object' && cache.key) {
    return cache.key;
  }

  return `${url}?${JSON.stringify(params ?? {})}`;
}

function logRequest(
  method: string,
  url: string,
  label?: string,
  data?: unknown,
) {
  const prefix = label ? `[${label}] ` : '';
  console.group(`🔵 ${prefix}${method} ${url}`);
  if (data) console.log(data);
  console.groupEnd();
}

function logSuccess(
  method: string,
  url: string,
  label: string | undefined,
  response: unknown,
  duration: number,
) {
  const prefix = label ? `[${label}] ` : '';
  console.group(`🟢 ${prefix}${method} ${url} (${duration}ms)`);
  console.log(response);
  console.groupEnd();
}

function logError(
  method: string,
  url: string,
  label: string | undefined,
  error: unknown,
  duration: number,
) {
  const prefix = label ? `[${label}] ` : '';
  console.group(`🔴 ${prefix}${method} ${url} (${duration}ms)`);
  console.error(error);

  const maybeError = error as { response?: { data?: unknown } };
  if (maybeError.response?.data) {
    console.error('Error Data:', maybeError.response.data);
  }

  console.groupEnd();
}

/**
 * 创建增强 API 客户端
 */
export function createEnhancedApiClient() {
  const stats: Record<string, RequestStats> = {};
  let globalDebug = false;

  function recordStats(path: string, duration: number, success: boolean) {
    if (!stats[path]) {
      stats[path] = {
        total: 0,
        success: 0,
        failed: 0,
        avgDuration: 0,
      };
    }

    const stat = stats[path];

    stat.total += 1;

    if (success) {
      stat.success += 1;
    } else {
      stat.failed += 1;
    }

    stat.avgDuration =
      (stat.avgDuration * (stat.total - 1) + duration) / stat.total;
  }

  async function requestEnhanced<
    P extends keyof paths,
    M extends HttpMethod,
  >(
    method: M,
    path: P,
    options?: EnhancedRequestOptions<P, M>,
  ): Promise<ResponseData<P, M>> {
    const {
      pathParams,
      params,
      body,
      debug,
      label,
      cache,
      retry,
      mock,
      timeout,
    } = options || {};

    const methodName = String(method).toUpperCase();
    const shouldDebug = Boolean(debug || globalDebug);

    /**
     * mock 模式：直接返回模拟数据
     */
    if (mock !== undefined) {
      if (shouldDebug) {
        console.log(
          `🎭 [${label || 'Mock'}] ${methodName} ${path as string}`,
          mock,
        );
      }

      return mock;
    }

    const url = pathParams
      ? buildUrl(path as string, pathParams)
      : (path as string);

    /**
     * 只允许 GET 使用缓存
     */
    const canUseCache = method === 'get' && Boolean(cache);

    if (canUseCache) {
      const cacheKey = getCacheKey(url, params, cache);
      const cached = apiCache.get<ResponseData<P, M>>(cacheKey);

      if (cached !== null) {
        if (shouldDebug) {
          console.log(`💾 [Cache Hit] ${methodName} ${url}`);
        }

        return cached;
      }
    }

    const startTime = Date.now();

    return executeWithRetry(async () => {
      try {
        if (shouldDebug) {
          logRequest(methodName, url, label, { params, body });
        }

        const response = await requestClient.request<ResponseData<P, M>>(url, {
          method: methodName,
          params,
          data: body,
          timeout,
        } as any);

        const duration = Date.now() - startTime;

        if (canUseCache) {
          const cacheKey = getCacheKey(url, params, cache);
          const ttl = typeof cache === 'object' ? cache.ttl : undefined;
          apiCache.set(cacheKey, response, ttl);
        }

        recordStats(path as string, duration, true);

        if (shouldDebug) {
          logSuccess(methodName, url, label, response, duration);
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        recordStats(path as string, duration, false);

        if (shouldDebug) {
          logError(methodName, url, label, error, duration);
        }

        throw error;
      }
    }, retry);
  }

  return {
    /**
     * 原始增强 request 方法
     */
    request: requestEnhanced,

    /**
     * GET 请求
     */
    get<P extends PathsWithMethod<'get'>>(
      path: P,
      options?: Omit<EnhancedRequestOptions<P, 'get'>, 'body'>,
    ) {
      return requestEnhanced('get', path, options);
    },

    /**
     * POST 请求
     */
    post<P extends PathsWithMethod<'post'>>(
      path: P,
      body?: RequestBody<P, 'post'>,
      options?: Omit<EnhancedRequestOptions<P, 'post'>, 'body'>,
    ) {
      return requestEnhanced('post', path, {
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
      options?: Omit<EnhancedRequestOptions<P, 'put'>, 'body'>,
    ) {
      return requestEnhanced('put', path, {
        ...options,
        body,
      });
    },

    /**
     * DELETE 请求
     */
    delete<P extends PathsWithMethod<'delete'>>(
      path: P,
      options?: Omit<EnhancedRequestOptions<P, 'delete'>, 'body'>,
    ) {
      return requestEnhanced('delete', path, options);
    },

    /**
     * PATCH 请求
     */
    patch<P extends PathsWithMethod<'patch'>>(
      path: P,
      body?: RequestBody<P, 'patch'>,
      options?: Omit<EnhancedRequestOptions<P, 'patch'>, 'body'>,
    ) {
      return requestEnhanced('patch', path, {
        ...options,
        body,
      });
    },

    /**
     * 批量请求
     */
    batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
      return Promise.all(requests.map((fn) => fn()));
    },

    /**
     * 清除缓存
     */
    clearCache(pattern?: string) {
      apiCache.clear(pattern);
    },

    /**
     * 获取缓存统计
     */
    getCacheStats() {
      return {
        size: apiCache.size(),
      };
    },

    /**
     * 获取请求统计
     */
    getStats(path?: string) {
      if (path) return stats[path];
      return stats;
    },

    /**
     * 重置统计
     */
    resetStats() {
      Object.keys(stats).forEach((key) => {
        delete stats[key];
      });
    },

    /**
     * 启用/禁用全局调试
     */
    setDebug(enabled: boolean) {
      globalDebug = enabled;
    },
  };
}

/**
 * 增强 API 客户端实例
 */
export const enhancedApi = createEnhancedApiClient();
