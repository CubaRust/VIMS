// import { computed, ref } from 'vue';
//
// import type {
//   AuthCheckResult,
//   ChangePasswordCommand,
//   CurrentUserView,
//   LoginCommand,
//   LoginResult,
// } from '#/api/system';
//
// import {
//   changePassword,
//   checkAllPermissions,
//   checkAllRoles,
//   checkAnyPermission,
//   checkAnyRole,
//   checkAuth,
//   checkLoginStatus,
//   checkPermission,
//   checkRole,
//   clearAuthCache,
//   clearCurrentUserCache,
//   getCurrentUser,
//   getCurrentUserCached,
//   getUserPermissions,
//   getUserRoles,
//   login,
//   loginWithRetry,
//   logout,
//   logoutAndClearCache,
//   preloadCurrentUser,
//   refreshToken,
// } from '#/api/modules/auth';
//
// export function useAuthApi() {
//   const currentUser = ref<CurrentUserView | null>(null);
//   const loginResult = ref<LoginResult | null>(null);
//   const authCheck = ref<AuthCheckResult | null>(null);
//
//   const loading = ref(false);
//   const loggingIn = ref(false);
//   const loggingOut = ref(false);
//   const error = ref<unknown>(null);
//
//   const isLoggedIn = computed(() => Boolean(currentUser.value));
//
//   const roles = computed(() => currentUser.value?.roles ?? []);
//   const permissions = computed(() => currentUser.value?.permissions ?? []);
//
//   async function doLogin(data: LoginCommand, retry = false) {
//     loggingIn.value = true;
//     error.value = null;
//
//     try {
//       loginResult.value = retry
//         ? await loginWithRetry(data)
//         : await login(data);
//
//       return loginResult.value;
//     } catch (err) {
//       error.value = err;
//       return null;
//     } finally {
//       loggingIn.value = false;
//     }
//   }
//
//   async function doLogout(clearAllCache = true) {
//     loggingOut.value = true;
//     error.value = null;
//
//     try {
//       if (clearAllCache) {
//         await logoutAndClearCache();
//       } else {
//         await logout();
//       }
//
//       currentUser.value = null;
//       loginResult.value = null;
//
//       return true;
//     } catch (err) {
//       error.value = err;
//       return false;
//     } finally {
//       loggingOut.value = false;
//     }
//   }
//
//   async function doRefreshToken() {
//     loading.value = true;
//     error.value = null;
//
//     try {
//       loginResult.value = await refreshToken();
//       return loginResult.value;
//     } catch (err) {
//       error.value = err;
//       return null;
//     } finally {
//       loading.value = false;
//     }
//   }
//
//   async function loadCurrentUser(useCache = true) {
//     loading.value = true;
//     error.value = null;
//
//     try {
//       currentUser.value = useCache
//         ? await getCurrentUserCached()
//         : await getCurrentUser();
//
//       return currentUser.value;
//     } catch (err) {
//       error.value = err;
//       currentUser.value = null;
//       return null;
//     } finally {
//       loading.value = false;
//     }
//   }
//
//   async function updatePassword(data: ChangePasswordCommand) {
//     loading.value = true;
//     error.value = null;
//
//     try {
//       await changePassword(data);
//       return true;
//     } catch (err) {
//       error.value = err;
//       return false;
//     } finally {
//       loading.value = false;
//     }
//   }
//
//   async function checkStatus() {
//     return checkLoginStatus();
//   }
//
//   async function checkCurrentAuth() {
//     authCheck.value = await checkAuth();
//
//     if (authCheck.value.user) {
//       currentUser.value = authCheck.value.user;
//     }
//
//     return authCheck.value;
//   }
//
//   async function hasPermission(permCode: string) {
//     return checkPermission(permCode);
//   }
//
//   async function hasAnyPermission(permCodes: string[]) {
//     return checkAnyPermission(permCodes);
//   }
//
//   async function hasAllPermissions(permCodes: string[]) {
//     return checkAllPermissions(permCodes);
//   }
//
//   async function hasRole(roleCode: string) {
//     return checkRole(roleCode);
//   }
//
//   async function hasAnyRole(roleCodes: string[]) {
//     return checkAnyRole(roleCodes);
//   }
//
//   async function hasAllRoles(roleCodes: string[]) {
//     return checkAllRoles(roleCodes);
//   }
//
//   async function loadPermissions() {
//     return getUserPermissions();
//   }
//
//   async function loadRoles() {
//     return getUserRoles();
//   }
//
//   function clearCurrentCache() {
//     clearCurrentUserCache();
//   }
//
//   function clearCache() {
//     clearAuthCache();
//   }
//
//   function preload() {
//     preloadCurrentUser();
//   }
//
//   return {
//     currentUser,
//     loginResult,
//     authCheck,
//
//     loading,
//     loggingIn,
//     loggingOut,
//     error,
//
//     isLoggedIn,
//     roles,
//     permissions,
//
//     doLogin,
//     doLogout,
//     doRefreshToken,
//     loadCurrentUser,
//     updatePassword,
//     checkStatus,
//     checkCurrentAuth,
//
//     hasPermission,
//     hasAnyPermission,
//     hasAllPermissions,
//     hasRole,
//     hasAnyRole,
//     hasAllRoles,
//
//     loadPermissions,
//     loadRoles,
//
//     clearCurrentCache,
//     clearCache,
//     preload,
//   };
// }
