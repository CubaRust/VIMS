<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import type { DictListQuery, DictView } from '#/api/system/dict-api';
import { useDicts } from '#/composables/system/use-dicts';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  TextArea,
  message,
  Modal,
  Row,
  Select,
  Statistic,
  Switch,
  Table,
  Tag,
} from 'antdv-next';

import type { TableProps } from 'antdv-next';

defineOptions({ name: '字典管理' });

// 使用 useDicts composable
const {
  dicts,
  dictTypes,
  stats,
  loading,
  statsLoading,
  loadDicts,
  loadTypes,
  loadStats,
  saveDict,
  modifyDict,
  clearCache,
} = useDicts();

// 筛选条件
const searchForm = ref<DictListQuery>({
  dict_type: undefined,
});

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
});

// 模态框
const modalVisible = ref(false);
const modalTitle = ref('新建字典');
const editingId = ref<number | null>(null);
const formData = ref({
  dict_type: '',
  dict_key: '',
  dict_value: '',
  dict_order: 0,
  is_active: true,
  description: '',
});

// 表格列定义
const columns: TableProps['columns'] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '字典类型',
    dataIndex: 'dict_type',
    key: 'dict_type',
    width: 150,
  },
  {
    title: '字典键',
    dataIndex: 'dict_key',
    key: 'dict_key',
    width: 120,
  },
  {
    title: '字典值',
    dataIndex: 'dict_value',
    key: 'dict_value',
    width: 150,
  },
  {
    title: '排序',
    dataIndex: 'dict_order',
    key: 'dict_order',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right' as const,
  },
];

// 筛选后的字典列表
const filteredDicts = computed(() => {
  return dicts.value;
});

// 分页后的字典列表
const paginatedDicts = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filteredDicts.value.slice(start, end);
});

// 更新分页总条数
const total = computed(() => filteredDicts.value.length);

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
  await loadDicts(searchForm.value);
  pagination.value.current = 1;
}

// 加载选项
async function loadOptions() {
  await loadTypes();
}

// 搜索
function handleSearch() {
  loadList();
}

// 重置
function handleReset() {
  searchForm.value = {
    dict_type: undefined,
  };
  loadList();
}

// 打开新建模态框
function openCreateModal() {
  modalTitle.value = '新建字典';
  editingId.value = null;
  formData.value = {
    dict_type: '',
    dict_key: '',
    dict_value: '',
    dict_order: 0,
    is_active: true,
    description: '',
  };
  modalVisible.value = true;
}

// 打开编辑模态框
function openEditModal(record: DictView) {
  modalTitle.value = '编辑字典';
  editingId.value = record.id;
  formData.value = {
    dict_type: record.dict_type,
    dict_key: record.dict_key,
    dict_value: record.dict_value,
    dict_order: record.dict_order,
    is_active: record.is_active,
    description: (record as any).description || '',
  };
  modalVisible.value = true;
}

// 确认保存
async function handleOk() {
  try {
    if (editingId.value) {
      // 编辑
      await modifyDict(editingId.value, formData.value);
      message.success('更新成功');
    } else {
      // 新建
      await saveDict(formData.value);
      message.success('创建成功');
    }
    modalVisible.value = false;
    await loadList();
    await loadStats();
    clearCache();
  } catch (error) {
    console.error('保存失败:', error);
  }
}

// 删除
function handleDelete(record: DictView) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典项 "${record.dict_value}" 吗？`,
    onOk() {
      message.warning('删除功能待实现');
    },
  });
}

// 初始化
onMounted(async () => {
  await loadList();
  await loadStats();
  await loadOptions();
});
</script>

<template>
  <div class="dict-management">
    <!-- 统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :span="6">
        <Card>
          <Statistic
            title="字典总数"
            :value="stats?.total || 0"
            :loading="statsLoading"
          />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="字典类型"
            :value="stats?.typeCount || 0"
            :loading="statsLoading"
          />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="启用状态"
            :value="stats?.active || 0"
            :value-style="{ color: '#3f8600' }"
            :loading="statsLoading"
          />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic
            title="禁用状态"
            :value="stats?.inactive || 0"
            :value-style="{ color: '#cf1322' }"
            :loading="statsLoading"
          />
        </Card>
      </Col>
    </Row>

    <!-- 搜索和筛选 -->
    <Card class="search-card">
      <Form layout="inline">
        <FormItem label="字典类型">
          <Select
            v-model:value="searchForm.dict_type"
            placeholder="请选择字典类型"
            style="width: 200px"
            allow-clear
            :options="dictTypes.map((t: string) => ({ label: t, value: t }))"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSearch">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="handleReset">重置</Button>
        </FormItem>
        <FormItem style="margin-left: auto">
          <Button type="primary" @click="openCreateModal">新建字典</Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 字典列表 -->
    <Card title="字典列表">
      <div class="table-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="paginatedDicts.length === 0" class="empty">
          {{ dicts.length === 0 ? '暂无字典数据' : '筛选结果为空' }}
        </div>
        <div v-else>
          <Table
            :columns="columns"
            :data-source="paginatedDicts"
            :loading="loading"
            :pagination="{ ...pagination, total }"
            :scroll="{ x: 1200 }"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'dict_type'">
                <Tag color="blue">{{ record.dict_type }}</Tag>
              </template>
              <template v-else-if="column.key === 'dict_key'">
                <code>{{ record.dict_key }}</code>
              </template>
              <template v-else-if="column.key === 'dict_value'">
                <span>{{ record.dict_value }}</span>
              </template>
              <template v-else-if="column.key === 'is_active'">
                <Tag :color="record.is_active ? 'green' : 'red'">
                  {{ record.is_active ? '启用' : '禁用' }}
                </Tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <Button
                  size="small"
                  type="link"
                  @click="openEditModal(record as DictView)"
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  type="link"
                  danger
                  @click="handleDelete(record as DictView)"
                >
                  删除
                </Button>
              </template>
            </template>
          </Table>
        </div>
      </div>
    </Card>

    <!-- 新建/编辑模态框 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleOk"
    >
      <Form layout="vertical">
        <FormItem label="字典类型" required>
          <Select
            v-model:value="formData.dict_type"
            placeholder="请选择或输入字典类型"
            :options="dictTypes.map((t: string) => ({ label: t, value: t }))"
            show-search
            :filter-option="(input, option) => (option?.label ?? '').includes(input)"
          />
        </FormItem>
        <FormItem label="字典键" required>
          <Input
            v-model:value="formData.dict_key"
            placeholder="请输入字典键"
          />
        </FormItem>
        <FormItem label="字典值" required>
          <Input
            v-model:value="formData.dict_value"
            placeholder="请输入字典值"
          />
        </FormItem>
        <FormItem label="排序">
          <InputNumber v-model:value="formData.dict_order" :min="0" />
        </FormItem>
        <FormItem label="状态">
          <Switch
            v-model:checked="formData.is_active"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </FormItem>
        <FormItem label="描述">
          <TextArea
            v-model:value="formData.description"
            placeholder="请输入描述"
            :rows="3"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.dict-management {
  padding: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.search-card {
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
</style>
