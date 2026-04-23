# OpenAPI 类型系统使用指南

## 📦 已完成的设置

✅ 生成了 `src/api/types.ts`（8825 行，包含所有后端接口类型）
✅ 添加了 `src/api/helpers.ts`（类型工具函数）
✅ 创建了 `src/api/example-typed-api.ts`（使用示例）

## 🚀 快速开始

### 1. 更新类型定义（当后端接口变更时）

```bash
pnpm gen:api
```

### 2. 使用类型安全的 API 调用

```typescript
import type { RequestBody, ResponseData } from '#/api';
import { requestClient, buildUrl } from '#/api';

// 登录接口
export async function loginApi(
  body: RequestBody<'/api/v1/auth/login', 'post'>
) {
  type Response = ResponseData<'/api/v1/auth/login', 'post'>;
  return requestClient.post<Response>('/auth/login', body);
}

// 带路径参数的接口
export async function getMaterialById(id: number) {
  type Response = ResponseData<'/api/v1/materials/{id}', 'get'>;
  const url = buildUrl('/materials/{id}', { id });
  return requestClient.get<Response>(url);
}
```

### 3. 使用后端数据模型

```typescript
import type { Schema } from '#/api';

export type Material = Schema<'MaterialData'>;
export type Warehouse = Schema<'WarehouseData'>;
export type BOM = Schema<'BomData'>;
```

## 🔄 迁移现有代码

### 旧方式（手动维护类型）

```typescript
// src/api/core/auth.ts
export namespace AuthApi {
  export interface LoginParams {
    login_name?: string;
    password?: string;
  }
  export interface LoginResult {
    token: string;
    user_id: number;
    // ...
  }
}

export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}
```

### 新方式（使用生成的类型）

```typescript
// src/api/core/auth.ts
import type { RequestBody, ResponseData } from '../helpers';

export async function loginApi(
  data: RequestBody<'/api/v1/auth/login', 'post'>
) {
  type Response = ResponseData<'/api/v1/auth/login', 'post'>;
  return requestClient.post<Response>('/auth/login', data);
}
```

## 💡 优势

1. **类型安全**：路径、参数、响应类型完全匹配后端
2. **自动补全**：IDE 自动提示所有可用的接口路径
3. **即时反馈**：后端接口变更时，前端立即报类型错误
4. **减少维护**：不需要手动同步类型定义
5. **文档即代码**：类型定义就是最新的接口文档

## 📝 建议的迁移策略

### 阶段 1：新接口使用新方式
- 所有新增的 API 调用使用 OpenAPI 类型
- 保持现有代码不变

### 阶段 2：逐步迁移核心模块
- 优先迁移频繁变更的模块（如 materials、warehouses）
- 保留 auth、user 等稳定模块

### 阶段 3：完全迁移
- 移除所有手动定义的 namespace
- 统一使用 OpenAPI 类型系统

## 🔧 可用的工具类型

- `Schema<K>`：提取数据模型类型
- `RequestBody<Path, Method>`：提取请求体类型
- `ResponseData<Path, Method>`：提取响应数据类型
- `QueryParams<Path, Method>`：提取查询参数类型
- `PathParams<Path>`：提取路径参数类型
- `buildUrl(path, params)`：构建带路径参数的 URL

## 📚 参考示例

查看 `src/api/example-typed-api.ts` 了解更多使用示例。