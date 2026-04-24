/**
 * 主数据模块 API 统一导出
 *
 * 包含所有主数据实体的 API 接口
 */

// 物料 API
export * from './material-api';

// 供应商 API
export * from './supplier-api';

// 客户 API
export * from './customer-api';

// BOM（物料清单）API
export * from './bom-api';

// 工艺路线 API
export * from './route-api';

// 状态流转规则 API
export * from './status-flow-api';

// 回收拆解模板 API
export * from './recovery-template-api';
