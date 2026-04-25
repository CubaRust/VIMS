# 用户管理功能实现清单

> 最后更新时间: 2026-04-25
> 项目路径: `/Users/x/VIMS/apps/web-antdv-next`

---

## ✅ 已实现功能

### 1. API 模块 (src/api/system/user-api.ts)

#### 1.1 基础查询功能
- ✅ `listUsers()` - 获取用户列表（支持关键词和状态筛选）
- ✅ `listAllUsers()` - 获取全部用户
- ✅ `getUserDetail(userId)` - 获取用户详情

#### 1.2 业务逻辑封装
- ✅ `getActiveUsers()` - 获取启用的用户列表（带5分钟缓存）
- ✅ `searchUsers(keyword)` - 搜索启用用户（带2分钟缓存）
- ✅ `findUserByCode(userCode)` - 按用户代码查找用户
- ✅ `findUserByLoginName(loginName)` - 按登录名查找用户
- ✅ `getUserStats()` - 获取用户统计信息（带10分钟缓存和重试机制）
- ✅ `getUsersByRole(roleCode)` - 按角色筛选用户
- ✅ `preloadCommonUsers()` - 预加载常用用户

#### 1.3 缓存管理
- ✅ `clearUserCache()` - 清除用户相关缓存
- ✅ `clearUserSearchCache()` - 清除用户搜索缓存
- ✅ `clearActiveUserCache()` - 清除启用用户缓存
- ✅ `clearUserStatsCache()` - 清除用户统计缓存

#### 1.4 CRUD 操作（API 已定义，待后端实现）
- ⏸️ `createUser(params)` - 创建用户
- ⏸️ `updateUser(params)` - 更新用户
- ⏸️ `deleteUser(userId)` - 删除用户
- ⏸️ `resetPassword(userId, newPassword)` - 重置用户密码

**注意**: 以上 CRUD 操作的 API 代码已写好，但由于后端 Swagger 中未定义对应的端点，暂时无法使用。

### 2. Vue Composable (src/composables/system/use-users.ts)

- ✅ 用户列表数据管理
- ✅ 统计信息数据管理
- ✅ 加载状态管理
- ✅ `loadUsers()` - 加载用户列表
- ✅ `loadStats()` - 加载统计信息
- ✅ `clearCache()` - 清除缓存

### 3. 用户管理页面 (src/views/system/users/index.vue)

#### 3.1 统计卡片
- ✅ 总用户数统计
- ✅ 启用用户数统计（绿色显示）
- ✅ 停用用户数统计（红色显示）
- ✅ 当前页面数据统计

#### 3.2 搜索和筛选
- ✅ 关键词搜索（支持登录名、用户名、编码、手机号）
- ✅ 状态筛选（启用/停用）
- ✅ 高级搜索展开/收起
- ✅ 角色筛选
- ✅ 手机号筛选
- ✅ 用户编码筛选
- ✅ 搜索/重置按钮

#### 3.3 数据表格
- ✅ 自定义分页（10/20/50/100 条/页）
- ✅ 快速跳转页码
- ✅ 显示总数和当前范围
- ✅ 列排序（支持多字段排序）
- ✅ 行选择（单选/多选）
- ✅ 固定列（登录名、操作列）
- ✅ 响应式表格布局

#### 3.4 批量操作（UI 已完成，后端待实现）
- ⏸️ 批量启用
- ⏸️ 批量停用
- ⏸️ 批量删除

#### 3.5 单个用户操作（UI 已完成，后端待实现）
- ⏸️ 编辑用户
- ⏸️ 重置密码
- ⏸️ 删除用户

#### 3.6 数据导出
- ✅ 导出为 CSV 格式
- ✅ 包含所有可见列的数据
- ✅ 自动生成文件名（带日期）

#### 3.7 表单弹窗
- ✅ 新建用户弹窗（UI 已完成）
- ✅ 编辑用户弹窗（UI 已完成）
- ✅ 表单验证
- ✅ 登录名（必填，编辑时禁用）
- ✅ 用户名（必填）
- ✅ 用户编码（可选）
- ✅ 手机号（可选）
- ✅ 角色选择（多选）
- ✅ 是否启用开关

#### 3.8 用户体验
- ✅ 加载状态显示
- ✅ 空数据提示
- ✅ 操作确认对话框
- ✅ 成功/失败提示消息
- ✅ 错误日志记录
- ✅ 行高亮选中
- ✅ 点击行选择

---

## ❌ 待实现功能（需要后端配合）

### 1. 后端 API 端点

#### 必须实现的端点
以下端点需要在后端实现并更新 Swagger 文档：

```
POST   /api/v1/users              - 创建用户
PUT    /api/v1/users/{id}         - 更新用户
DELETE /api/v1/users/{id}         - 删除用户
POST   /api/v1/users/{id}/reset-password - 重置用户密码
```

#### 期望的请求/响应格式

**1. 创建用户**
```typescript
// 请求
POST /api/v1/users
{
  "login_name": "testuser",
  "user_name": "测试用户",
  "user_code": "U001",
  "mobile": "13800138000",
  "roles": ["user"],
  "is_active": true
}

// 响应
{
  "code": 0,
  "data": {
    "id": 1,
    "user_code": "U001",
    "login_name": "testuser",
    "user_name": "测试用户",
    "mobile": "13800138000",
    "roles": ["user"],
    "is_active": true,
    "created_at": "2026-04-25T12:00:00Z",
    "updated_at": "2026-04-25T12:00:00Z"
  }
}
```

**2. 更新用户**
```typescript
// 请求
PUT /api/v1/users/1
{
  "user_name": "新用户名",
  "mobile": "13800138001",
  "roles": ["admin", "user"],
  "is_active": false
}

// 响应
{
  "code": 0,
  "data": {
    "id": 1,
    "user_code": "U001",
    "login_name": "testuser",
    "user_name": "新用户名",
    "mobile": "13800138001",
    "roles": ["admin", "user"],
    "is_active": false,
    "created_at": "2026-04-25T12:00:00Z",
    "updated_at": "2026-04-25T12:00:00Z"
  }
}
```

**3. 删除用户**
```typescript
// 请求
DELETE /api/v1/users/1

// 响应
{
  "code": 0,
  "data": null
}
```

**4. 重置密码**
```typescript
// 请求
POST /api/v1/users/1/reset-password
{
  "password": "123456"
}

// 响应
{
  "code": 0,
  "data": null
}
```

### 2. 前端代码调整

当后端实现上述 API 后，需要进行以下前端调整：

#### 2.1 移除 disabled 属性
在 `src/views/system/users/index.vue` 中：

1. 移除"新建用户"按钮的 `disabled` 属性
2. 移除"编辑"按钮的 `disabled` 属性
3. 移除"重置密码"按钮的 `disabled` 属性
4. 移除"删除"按钮的 `disabled` 属性
5. 移除批量操作按钮的 `disabled` 属性
6. 移除按钮文本中的"（后端未实现）"

#### 2.2 移除调试日志（可选）
在 `src/api/system/user-api.ts` 的 `createUser` 函数中，移除调试日志：
```typescript
// 删除这些行
console.log('Creating user with params:', params);
console.log('Create user response:', result);
```

### 3. 可选的增强功能

以下功能可以在后续迭代中实现：

#### 3.1 用户头像
- 添加头像上传功能
- 显示用户头像

#### 3.2 批量导入
- Excel 导入用户
- 数据验证
- 导入进度显示
- 导入结果报告

#### 3.3 用户详情页
- 点击用户名查看详情
- 显示用户操作日志
- 显示用户角色权限详情

#### 3.4 高级筛选
- 日期范围筛选（创建时间）
- 多角色组合筛选
- 保存筛选条件

#### 3.5 实时数据更新
- WebSocket 推送用户状态变更
- 定时自动刷新数据
- 刷新间隔可配置

#### 3.6 权限控制
- 基于角色显示/隐藏操作按钮
- 只能编辑有权限的用户
- 删除前验证权限

#### 3.7 表单增强
- 手机号格式验证
- 登录名唯一性验证
- 用户编码唯一性验证
- 密码强度要求

#### 3.8 操作日志
- 记录所有用户变更操作
- 显示操作历史
- 支持撤销操作

---

## 📋 文件修改清单

### 已修改文件

1. **src/api/system/user-api.ts**
   - 类型定义：`UserView`, `UserListQuery`, `UserStats`, `UserCreateParams`, `UserUpdateParams`
   - 工具函数：`normalizeUserListQuery()`
   - 基础操作：`listUsers`, `listAllUsers`
   - 业务逻辑：`getActiveUsers`, `searchUsers`, `findUserByCode`, `findUserByLoginName`, `getUserStats`, `getUsersByRole`, `preloadCommonUsers`
   - 缓存管理：`clearUserCache`, `clearUserSearchCache`, `clearActiveUserCache`, `clearUserStatsCache`
   - CRUD 操作：`getUserDetail`, `createUser`, `updateUser`, `deleteUser`, `resetPassword`

2. **src/api/system/role-api.ts**
   - 移除了 mock 数据
   - 改为使用真实 API 调用

3. **src/api/system/permission-api.ts**
   - 移除了 mock 数据
   - 改为使用真实 API 调用

4. **src/views/system/users/index.vue**
   - 完整的用户管理页面
   - 统计卡片、搜索、筛选、表格、分页
   - 新建/编辑弹窗（UI 已完成）
   - 批量操作（UI 已完成）
   - 数据导出功能

### 新建文件

1. **USER_MANAGEMENT_TODO.md** - 本文档

---

## 🎯 Commit 信息

### 推荐的 Commit Message 格式

#### Feature: 实现用户管理页面基础功能

```
feat: 实现用户管理页面基础功能

- 实现 API 模块 (src/api/system/user-api.ts)
  - 用户列表查询、搜索、筛选、统计
  - 业务逻辑封装（缓存、搜索、查找）
  - CRUD 操作接口（待后端实现）

- 实现 Vue Composable (src/composables/system/use-users.ts)
  - 用户数据和状态管理
  - 加载和缓存管理

- 实现用户管理页面 (src/views/system/users/index.vue)
  - 统计卡片（总用户数、启用/停用用户）
  - 高级搜索和筛选（关键词、角色、状态等）
  - 数据表格（分页、排序、多选）
  - 数据导出为 CSV

- 移除所有 API 模块的 mock 数据，使用真实接口

注意：用户创建、编辑、删除功能 UI 已完成，
但需等待后端实现对应的 API 端点。

Closes #[issue编号]
```

#### Bugfix: 修复用户管理页面 prop 警告

```
fix: 修复 Statistic 组件 valueStyle prop 类型错误

- 将 value-style 改为 :value-style 以正确绑定对象
- 修复 "Expected Object, got String" 的 Vue 警告
```

#### Docs: 添加用户管理功能实现清单

```
docs: 添加用户管理功能实现清单

- 记录已实现的功能
- 列出待实现的后端 API
- 说明功能启用步骤
- 提供 commit 信息模板
```

---

## 🚀 启用完整功能的步骤

当后端实现完所需 API 后，按以下步骤启用功能：

### 步骤 1: 验证 API 可用性
```bash
# 测试创建用户
curl -X POST http://your-api/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"login_name":"test","user_name":"测试"}'

# 测试更新用户
curl -X PUT http://your-api/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"user_name":"新名称"}'

# 测试删除用户
curl -X DELETE http://your-api/api/v1/users/1
```

### 步骤 2: 移除 disabled 属性
编辑 `src/views/system/users/index.vue`：

```vue
<!-- 修改前 -->
<Button type="primary" @click="openCreateModal" disabled>新建用户（后端未实现）</Button>
<Button size="small" type="link" @click.stop="openEditModal(user)" disabled>编辑（后端未实现）</Button>

<!-- 修改后 -->
<Button type="primary" @click="openCreateModal">新建用户</Button>
<Button size="small" type="link" @click.stop="openEditModal(user)">编辑</Button>
```

对所有相关按钮进行同样的修改。

### 步骤 3: 移除调试日志（可选）
在 `src/api/system/user-api.ts` 中注释掉或删除 `console.log` 语句。

### 步骤 4: 测试完整流程
1. 测试创建用户
2. 测试编辑用户
3. 测试重置密码
4. 测试删除用户
5. 测试批量操作

### 步骤 5: 提交代码
```bash
git add .
git commit -m "feat: 启用用户 CRUD 功能

- 后端已实现所需 API 端点
- 移除 disabled 属性启用按钮
- 完整测试 CRUD 操作"
```

---

## 📞 联系后端开发

请将此文档分享给后端开发团队，说明需要实现的 API 端点和期望的接口格式。

**关键信息**：
- 当前 Swagger 中 `/api/v1/users` 只有 GET 方法
- 需要添加 POST、PUT、DELETE 方法
- 请求/响应格式参考本文档"待实现功能"章节

---

## 📚 相关文档

- [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md) - 用户管理功能使用指南
- [OPENAPI_GUIDE.md](./OPENAPI_GUIDE.md) - OpenAPI 使用指南
- Swagger 文档地址: http://your-api/swagger
