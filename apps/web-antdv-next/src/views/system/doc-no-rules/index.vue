<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import type { DocNoRuleView } from '#/api/system/doc-no-rule-api';
import { useDocNoRules } from '#/composables/system/use-doc-no-rules';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
} from 'antdv-next';

import type { TableProps } from 'antdv-next';

defineOptions({ name: '单据编号规则' });

// 使用 useDocNoRules composable
const {
  rules,
  docTypes,
  stats,
  loading,
  saving,
  statsLoading,
  loadRules,
  loadDocTypes,
  loadStats,
  updateRule,
  preview,
  clearCache,
} = useDocNoRules();

// 单据类型字典映射
const docTypeDict: Record<string, string> = {
  INBOUND: '入库单',
  OUTBOUND: '出库单',
  TRANSFER: '调拨单',
  INVENTORY_CHECK: '盘点单',
  CUSTOMER_RETURN: '客户退货单',
  SUPPLIER_RETURN: '供应商退货单',
  PURCHASE: '采购单',
  SALES: '销售单',
  PRODUCTION: '生产单',
  QUALITY_CHECK: '质检单',
};

// 获取单据类型名称
function getDocTypeName(docType: string): string {
  return docTypeDict[docType] || docType;
}

// 日期格式选项
const datePatternOptions = [
  { label: 'YYYYMMDD (20260423)', value: 'YYYYMMDD' },
  { label: 'YYMMDD (260423)', value: 'YYMMDD' },
  { label: 'YYYYMM (202604)', value: 'YYYYMM' },
  { label: 'YYMM (2604)', value: 'YYMM' },
];

// 模态框
const modalVisible = ref(false);
const modalTitle = ref('编辑编号规则');
const editingId = ref<number | null>(null);
const formData = ref({
  doc_prefix: '',
  date_pattern: 'YYYYMMDD',
  seq_length: 4,
});

// 预览模态框
const previewModalVisible = ref(false);
const previewDocType = ref('');
const previewResult = ref('');

// 表格列定义
const columns: TableProps['columns'] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '单据类型',
    dataIndex: 'doc_type',
    key: 'doc_type',
    width: 150,
  },
  {
    title: '前缀',
    dataIndex: 'doc_prefix',
    key: 'doc_prefix',
    width: 120,
  },
  {
    title: '日期格式',
    dataIndex: 'date_pattern',
    key: 'date_pattern',
    width: 150,
  },
  {
    title: '序列号长度',
    dataIndex: 'seq_length',
    key: 'seq_length',
    width: 120,
  },
  {
    title: '当前序号',
    dataIndex: 'current_seq',
    key: 'current_seq',
    width: 120,
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 250,
    fixed: 'right' as const,
  },
];

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
});

// 分页总条数
const total = computed(() => rules.value.length);

// 分页后的规则列表
const paginatedRules = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return rules.value.slice(start, end);
});

// 处理表格变化
function handleTableChange(pag: { current?: number; pageSize?: number }) {
  if (pag.current) {
    pagination.value.current = pag.current;
  }
  if (pag.pageSize) {
    pagination.value.pageSize = pag.pageSize;
  }
}

// 加载数据
async function loadList() {
  await loadRules();
  pagination.value.current = 1;
}

// 加载选项
async function loadOptions() {
  await loadDocTypes();
}

// 打开编辑模态框
function openEditModal(record: DocNoRuleView) {
  modalTitle.value = '编辑编号规则';
  editingId.value = record.id;
  formData.value = {
    doc_prefix: record.doc_prefix,
    date_pattern: record.date_pattern,
    seq_length: record.seq_length,
  };
  modalVisible.value = true;
}

// 确认保存
async function handleOk() {
  try {
    if (editingId.value) {
      await updateRule(editingId.value, formData.value);
      message.success('更新成功');
    }
    modalVisible.value = false;
    await loadList();
    await loadStats();
    clearCache();
  } catch (error) {
    console.error('保存失败:', error);
  }
}

// 打开预览模态框
async function openPreviewModal(record: DocNoRuleView) {
  previewDocType.value = record.doc_type;

  console.log('预览记录:', record);
  console.log('单据类型:', record.doc_type);
  console.log('前缀:', record.doc_prefix);
  console.log('日期格式:', record.date_pattern);
  console.log('序列号长度:', record.seq_length);
  console.log('当前序号:', record.current_seq);

  try {
    const result = await preview(record.doc_type);

    console.log('预览结果:', result);

    if (result) {
      previewResult.value = result;
      previewModalVisible.value = true;
    } else {
      message.error('无法生成预览，请检查编号规则配置');
    }
  } catch (error) {
    console.error('预览失败:', error);
    message.error('预览失败，请稍后重试');
  }
}

// 复制预览结果
function copyPreview() {
  navigator.clipboard.writeText(previewResult.value);
  message.success('已复制到剪贴板');
}

// 初始化
onMounted(async () => {
  await loadList();
  await loadStats();
  await loadOptions();
});
</script>

<template>
  <div class="doc-no-rule-management">
    <!-- 统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :span="12">
        <Card>
          <Statistic
            title="编号规则总数"
            :value="stats?.total || 0"
            :loading="statsLoading"
          />
        </Card>
      </Col>
      <Col :span="12">
        <Card>
          <Statistic
            title="单据类型数量"
            :value="stats?.docTypes?.length || 0"
            :loading="statsLoading"
          />
        </Card>
      </Col>
    </Row>

    <!-- 规则列表 -->
    <Card title="单据编号规则列表">
      <div class="table-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="paginatedRules.length === 0" class="empty">
          {{ rules.length === 0 ? '暂无编号规则' : '暂无数据' }}
        </div>
        <div v-else>
          <Table
            :columns="columns"
            :data-source="paginatedRules"
            :loading="loading"
            :pagination="{ ...pagination, total }"
            :scroll="{ x: 1400 }"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'doc_type'">
                <Tag color="blue">
                  {{ getDocTypeName(record.doc_type) }}
                  <span style="opacity: 0.6; font-size: 12px; margin-left: 4px;">({{ record.doc_type }})</span>
                </Tag>
              </template>
              <template v-else-if="column.key === 'doc_prefix'">
                <code>{{ record.doc_prefix }}</code>
              </template>
              <template v-else-if="column.key === 'date_pattern'">
                <Tag color="purple">{{ record.date_pattern }}</Tag>
              </template>
              <template v-else-if="column.key === 'seq_length'">
                <span>{{ record.seq_length }} 位</span>
              </template>
              <template v-else-if="column.key === 'current_seq'">
                <span>{{ record.current_seq || 0 }}</span>
              </template>
              <template v-else-if="column.key === 'action'">
                <Button
                  size="small"
                  type="link"
                  @click="openEditModal(record as DocNoRuleView)"
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  type="link"
                  @click="openPreviewModal(record as DocNoRuleView)"
                >
                  预览
                </Button>
              </template>
            </template>
          </Table>
        </div>
      </div>
    </Card>

    <!-- 编辑模态框 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      :confirm-loading="saving"
      @ok="handleOk"
    >
      <Form layout="vertical">
        <FormItem label="单据类型前缀" required>
          <Input
            v-model:value="formData.doc_prefix"
            placeholder="请输入前缀，如：RCV、OUT 等"
            :maxlength="10"
          />
          <div class="form-tip">
            建议使用 2-3 位大写字母作为前缀，方便识别单据类型
          </div>
        </FormItem>
        <FormItem label="日期格式" required>
          <Select
            v-model:value="formData.date_pattern"
            placeholder="请选择日期格式"
            :options="datePatternOptions"
          />
          <div class="form-tip">
            日期格式将自动根据当前时间生成，如：20260423
          </div>
        </FormItem>
        <FormItem label="序列号长度" required>
          <InputNumber
            v-model:value="formData.seq_length"
            :min="1"
            :max="10"
            style="width: 100%"
          />
          <div class="form-tip">
            序列号长度决定编号的位数，如：4 位则显示为 0001
          </div>
        </FormItem>
      </Form>
    </Modal>

    <!-- 预览模态框 -->
    <Modal
      v-model:open="previewModalVisible"
      title="编号预览"
      width="500px"
      :footer="null"
    >
      <div class="preview-content">
        <div class="preview-item">
          <label>单据类型：</label>
          <Tag color="blue">
            {{ getDocTypeName(previewDocType) }}
            <span style="opacity: 0.6; font-size: 12px; margin-left: 4px;">({{ previewDocType }})</span>
          </Tag>
        </div>
        <div class="preview-item">
          <label>生成结果：</label>
          <code class="preview-code">{{ previewResult }}</code>
        </div>
      </div>
      <div class="preview-actions">
        <Button type="primary" @click="copyPreview">复制到剪贴板</Button>
        <Button @click="previewModalVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.doc-no-rule-management {
  padding: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.table-container {
  min-height: 400px;
}

.loading,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
}

code {
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #666;
}

.preview-code {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.preview-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.preview-content {
  padding: 16px 0;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item label {
  width: 100px;
  font-weight: 500;
  color: #333;
}
</style>
