/**
 * 单据编号规则 API
 *
 * 提供单据编号规则的查询和更新功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type DocNoRuleView = Schema<'DocNoRuleView'>;
export type DocNoRuleUpdateBody = Schema<'UpdateDocNoRuleCommand'>;

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取单据编号规则列表
 *
 * @example
 * const rules = await listDocNoRules()
 */
export async function listDocNoRules() {
  return api.get('/api/v1/doc-no-rules') as Promise<DocNoRuleView[]>;
}

/**
 * 更新单据编号规则
 *
 * @example
 * const updated = await updateDocNoRule(1, {
 *   doc_prefix: 'RCV',
 *   date_pattern: 'YYYYMMDD',
 *   seq_length: 4
 * })
 */
export async function updateDocNoRule(id: number, data: DocNoRuleUpdateBody) {
  return api.put('/api/v1/doc-no-rules/{id}', data, {
    pathParams: { id },
  }) as Promise<DocNoRuleView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取单据编号规则列表（带缓存）
 *
 * @example
 * const rules = await getDocNoRulesCached()
 */
export async function getDocNoRulesCached() {
  return enhancedApi.get('/api/v1/doc-no-rules', {
    cache: { ttl: 10 * 60 * 1000 }, // 缓存 10 分钟（规则变化较少）
    label: '获取单据编号规则',
  }) as Promise<DocNoRuleView[]>;
}

/**
 * 按单据类型获取编号规则
 *
 * @example
 * const rule = await getDocNoRuleByType('INBOUND')
 */
export async function getDocNoRuleByType(docType: string): Promise<DocNoRuleView | null> {
  try {
    const rules = await getDocNoRulesCached();
    return rules.find(r => r.doc_type === docType) || null;
  } catch {
    return null;
  }
}

/**
 * 获取单据类型的前缀
 *
 * @example
 * const prefix = await getDocPrefix('INBOUND')
 */
export async function getDocPrefix(docType: string): Promise<string | null> {
  const rule = await getDocNoRuleByType(docType);
  return rule?.doc_prefix || null;
}

/**
 * 获取单据类型的日期格式
 *
 * @example
 * const pattern = await getDocDatePattern('INBOUND')
 */
export async function getDocDatePattern(docType: string): Promise<string | null> {
  const rule = await getDocNoRuleByType(docType);
  return rule?.date_pattern || null;
}

/**
 * 获取单据类型的序列号长度
 *
 * @example
 * const length = await getDocSeqLength('INBOUND')
 */
export async function getDocSeqLength(docType: string): Promise<number | null> {
  const rule = await getDocNoRuleByType(docType);
  return rule?.seq_length || null;
}

/**
 * 预览单据编号格式
 *
 * @example
 * const preview = await previewDocNo('INBOUND')
 * // 返回: 'RCV20260423-0001'
 */
export async function previewDocNo(docType: string): Promise<string | null> {
  const rule = await getDocNoRuleByType(docType);
  if (!rule) return null;

  const now = new Date();
  let dateStr = '';

  // 简单的日期格式化
  switch (rule.date_pattern) {
    case 'YYYYMMDD':
      dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      break;
    case 'YYMMDD':
      dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
      break;
    case 'YYYYMM':
      dateStr = now.toISOString().slice(0, 7).replace(/-/g, '');
      break;
    case 'YYMM':
      dateStr = now.toISOString().slice(2, 7).replace(/-/g, '');
      break;
    default:
      dateStr = '';
  }

  const seq = String(rule.current_seq + 1).padStart(rule.seq_length, '0');
  return `${rule.doc_prefix}${dateStr}${dateStr ? '-' : ''}${seq}`;
}

/**
 * 获取所有单据类型列表
 *
 * @example
 * const types = await getAllDocTypes()
 */
export async function getAllDocTypes(): Promise<string[]> {
  const rules = await getDocNoRulesCached();
  return rules.map(r => r.doc_type).sort();
}

/**
 * 批量获取多个单据类型的规则
 *
 * @example
 * const rules = await batchGetDocNoRules(['INBOUND', 'OUTBOUND'])
 */
export async function batchGetDocNoRules(docTypes: string[]) {
  return enhancedApi.batch(
    docTypes.map((type) => () => getDocNoRuleByType(type))
  );
}

/**
 * 获取单据编号规则统计信息（带重试）
 *
 * @example
 * const stats = await getDocNoRuleStats()
 */
export async function getDocNoRuleStats() {
  const result = await enhancedApi.get('/api/v1/doc-no-rules', {
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取单据编号规则统计',
  }) as DocNoRuleView[];

  return {
    total: result.length,
    docTypes: result.map(r => r.doc_type),
  };
}

/**
 * 预加载单据编号规则（后台加载）
 *
 * @example
 * preloadDocNoRules()
 */
export function preloadDocNoRules() {
  getDocNoRulesCached().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除单据编号规则缓存
 */
export function clearDocNoRuleCache() {
  enhancedApi.clearCache('doc-no-rules');
}
