/**
 * 单据编号规则 API
 *
 * 提供单据编号规则的查询、更新、预览、统计等功能
 */

import type { Schema } from '#/api';

import { api } from '#/api';
import { enhancedApi } from '#/api';

// ============================================================================
// 类型定义
// ============================================================================

export type DocNoRuleView = Schema<'DocNoRuleView'>;
export type DocNoRuleUpdateBody = Schema<'DocNoRuleUpdateBody'>;

export interface DocNoRuleStats {
  total: number;
  docTypes: string[];
}

export type DocDatePattern = 'YYYYMMDD' | 'YYMMDD' | 'YYYYMM' | 'YYMM' | string;

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取单据编号规则列表
 *
 * @example
 * const rules = await listDocNoRules()
 */
export async function listDocNoRules(): Promise<DocNoRuleView[]> {
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
export async function updateDocNoRule(
  id: number,
  data: DocNoRuleUpdateBody,
): Promise<DocNoRuleView> {
  const result = await api.put('/api/v1/doc-no-rules/{id}', data, {
    pathParams: { id },
  });

  clearDocNoRuleCache();

  return result as DocNoRuleView;
}

// ============================================================================
// 业务逻辑封装：缓存 / 查询 / 预览 / 统计
// ============================================================================

/**
 * 获取单据编号规则列表，带缓存
 *
 * @example
 * const rules = await getDocNoRulesCached()
 */
export async function getDocNoRulesCached(): Promise<DocNoRuleView[]> {
  return enhancedApi.get('/api/v1/doc-no-rules', {
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'doc-no-rules:list',
    },
    label: '获取单据编号规则',
  }) as Promise<DocNoRuleView[]>;
}

/**
 * 按单据类型获取编号规则
 *
 * @example
 * const rule = await getDocNoRuleByType('INBOUND')
 */
export async function getDocNoRuleByType(
  docType: string,
): Promise<DocNoRuleView | null> {
  const normalizedDocType = docType.trim();

  if (!normalizedDocType) {
    return null;
  }

  try {
    const rules = await getDocNoRulesCached();

    return (
      rules.find((rule) => rule.doc_type === normalizedDocType) ?? null
    );
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

  return rule?.doc_prefix ?? null;
}

/**
 * 获取单据类型的日期格式
 *
 * @example
 * const pattern = await getDocDatePattern('INBOUND')
 */
export async function getDocDatePattern(
  docType: string,
): Promise<string | null> {
  const rule = await getDocNoRuleByType(docType);

  return rule?.date_pattern ?? null;
}

/**
 * 获取单据类型的序列号长度
 *
 * @example
 * const length = await getDocSeqLength('INBOUND')
 */
export async function getDocSeqLength(
  docType: string,
): Promise<number | null> {
  const rule = await getDocNoRuleByType(docType);

  return rule?.seq_length ?? null;
}

/**
 * 根据规则格式化日期
 */
function formatDateByPattern(date: Date, pattern: DocDatePattern): string {
  const year = String(date.getFullYear());
  const shortYear = year.slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (pattern) {
    case 'YYYYMMDD':
      return `${year}${month}${day}`;
    case 'YYMMDD':
      return `${shortYear}${month}${day}`;
    case 'YYYYMM':
      return `${year}${month}`;
    case 'YYMM':
      return `${shortYear}${month}`;
    default:
      return '';
  }
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

  if (!rule) {
    return null;
  }

  const dateStr = formatDateByPattern(new Date(), rule.date_pattern);
  const nextSeq = Number(rule.current_seq ?? 0) + 1;
  const seq = String(nextSeq).padStart(rule.seq_length, '0');

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

  return Array.from(
    new Set(
      rules
        .map((rule) => rule.doc_type)
        .filter(Boolean),
    ),
  ).sort();
}

/**
 * 批量获取多个单据类型的规则
 *
 * @example
 * const rules = await batchGetDocNoRules(['INBOUND', 'OUTBOUND'])
 */
export async function batchGetDocNoRules(
  docTypes: string[],
): Promise<Array<DocNoRuleView | null>> {
  const normalizedDocTypes = Array.from(
    new Set(
      docTypes
        .map((docType) => docType.trim())
        .filter(Boolean),
    ),
  );

  if (normalizedDocTypes.length === 0) {
    return [];
  }

  return enhancedApi.batch(
    normalizedDocTypes.map(
      (docType) => () => getDocNoRuleByType(docType),
    ),
  );
}

/**
 * 获取单据编号规则统计信息，带重试和缓存
 *
 * @example
 * const stats = await getDocNoRuleStats()
 */
export async function getDocNoRuleStats(): Promise<DocNoRuleStats> {
  const rules = (await enhancedApi.get('/api/v1/doc-no-rules', {
    retry: {
      times: 3,
      delay: 1000,
    },
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'doc-no-rules:stats',
    },
    label: '获取单据编号规则统计',
  })) as DocNoRuleView[];

  const docTypes = Array.from(
    new Set(
      rules
        .map((rule) => rule.doc_type)
        .filter(Boolean),
    ),
  ).sort();

  return {
    total: rules.length,
    docTypes,
  };
}

/**
 * 预加载单据编号规则
 *
 * @example
 * preloadDocNoRules()
 */
export function preloadDocNoRules() {
  void getDocNoRulesCached().catch(() => {
    // 忽略预加载失败
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除单据编号规则相关缓存
 */
export function clearDocNoRuleCache() {
  enhancedApi.clearCache('doc-no-rules:');
}

/**
 * 清除单据编号规则列表缓存
 */
export function clearDocNoRuleListCache() {
  enhancedApi.clearCache('doc-no-rules:list');
}

/**
 * 清除单据编号规则统计缓存
 */
export function clearDocNoRuleStatsCache() {
  enhancedApi.clearCache('doc-no-rules:stats');
}
