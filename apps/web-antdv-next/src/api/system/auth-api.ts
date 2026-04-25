// // ==========================
// // auth-api.ts 完整安全版本
// // ==========================
//
// import type { Schema } from '#/api';
// import { api } from '#/api';
// import { enhancedApi } from '#/api';
//
// // ==========================
// // 类型定义
// // ==========================
//
// export type LoginCommand = Schema<'LoginBody'>;
// export type LoginResult = Schema<'LoginData'>;
// export type UserView = Schema<'UserView'>;
// export type ChangePasswordCommand = Schema<'ChangePasswordBody'>;
//
// // 扩展 UserView 增加可选 permissions
// export interface ExtendedUserView extends UserView {
//   permissions?: string[];
// }
//
// // 登录 API 返回类型可能是 LoginResult 或错误对象
// type LoginResponse = LoginResult | { code: number; message: string; trace_id?: string };
//
// export interface AuthCheckResult {
//   loggedIn: boolean;
//   user: ExtendedUserView | null;
// }
//
// // ==========================
// // 缓存 Key
// // ==========================
// const CURRENT_USER_CACHE_KEY = 'auth:me';
//
// // ==========================
// // 工具函数
// // ==========================
// function normalizeText(value: string) {
//   return value.trim();
// }
//
// // ==========================
// // 基础认证操作
// // ==========================
// export async function login(data: LoginCommand): Promise<LoginResult | null> {
//   try {
//     const result = (await api.post('/api/v1/auth/login', data)) as LoginResponse;
//
//     if ('code' in result) {
//       console.error('登录失败', result.message);
//       return null;
//     }
//
//     clearCurrentUserCache();
//     return result as LoginResult;
//   } catch (err) {
//     console.error('登录异常', err);
//     return null;
//   }
// }
//
// export async function logout(): Promise<void> {
//   await api.post('/api/v1/auth/logout');
//   clearAuthCache();
// }
//
// export async function refreshToken(): Promise<LoginResult | null> {
//   try {
//     const result = (await api.post('/api/v1/auth/refresh')) as LoginResult;
//     clearCurrentUserCache();
//     return result;
//   } catch (err) {
//     console.error('刷新 token 失败', err);
//     return null;
//   }
// }
//
// export async function getCurrentUser(): Promise<ExtendedUserView | null> {
//   try {
//     const user = await api.get('/api/v1/auth/me');
//     return { ...(user as UserView), permissions: (user as any).permissions ?? [] };
//   } catch (err) {
//     console.error('获取当前用户失败', err);
//     return null;
//   }
// }
//
// export async function changePassword(data: ChangePasswordCommand): Promise<void> {
//   await api.put('/api/v1/auth/password', data);
//   clearAuthCache();
// }
//
// // ==========================
// // 缓存 / 权限封装
// // ==========================
// export async function getCurrentUserCached(): Promise<ExtendedUserView | null> {
//   try {
//     const user = await enhancedApi.get('/api/v1/auth/me', {
//       cache: { ttl: 5 * 60 * 1000, key: CURRENT_USER_CACHE_KEY },
//       label: '获取当前用户',
//     });
//     return { ...(user as UserView), permissions: (user as any).permissions ?? [] };
//   } catch (err) {
//     console.error('获取缓存用户失败', err);
//     return null;
//   }
// }
//
// // 权限检查
// export async function checkPermission(permCode: string): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   return user?.permissions?.includes(normalizeText(permCode)) ?? false;
// }
//
// export async function checkAnyPermission(permCodes: string[]): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   if (!user) return false;
//   return permCodes
//     .map((p) => normalizeText(p))
//     .filter(Boolean)
//     .some((p) => user.permissions?.includes(p) ?? false);
// }
//
// export async function checkAllPermissions(permCodes: string[]): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   if (!user) return false;
//   return permCodes
//     .map((p) => normalizeText(p))
//     .filter(Boolean)
//     .every((p) => user.permissions?.includes(p) ?? false);
// }
//
// // 角色检查
// export async function checkRole(roleCode: string): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   return user?.roles?.includes(normalizeText(roleCode)) ?? false;
// }
//
// export async function checkAnyRole(roleCodes: string[]): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   if (!user) return false;
//   return roleCodes
//     .map((r) => normalizeText(r))
//     .filter(Boolean)
//     .some((r) => user.roles?.includes(r) ?? false);
// }
//
// export async function checkAllRoles(roleCodes: string[]): Promise<boolean> {
//   const user = await getCurrentUserCached();
//   if (!user) return false;
//   return roleCodes
//     .map((r) => normalizeText(r))
//     .filter(Boolean)
//     .every((r) => user.roles?.includes(r) ?? false);
// }
//
// export async function getUserPermissions(): Promise<string[]> {
//   const user = await getCurrentUserCached();
//   return user?.permissions ?? [];
// }
//
// export async function getUserRoles(): Promise<string[]> {
//   const user = await getCurrentUserCached();
//   return user?.roles ?? [];
// }
//
// // ==========================
// // 缓存管理
// // ==========================
// export function clearCurrentUserCache() {
//   enhancedApi.clearCache(CURRENT_USER_CACHE_KEY);
// }
//
// export function clearAuthCache() {
//   enhancedApi.clearCache('auth:');
// }
//
// export async function logoutAndClearCache(): Promise<void> {
//   try {
//     await logout();
//   } finally {
//     clearAuthCache();
//     enhancedApi.clearCache();
//   }
// }
