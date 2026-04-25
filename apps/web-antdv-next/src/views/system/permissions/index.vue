/**
 * 权限管理页面
 */

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { Button, Form, FormItem, Input, Select, Space, Tag, message, Card, Row, Col, Statistic, Tree } from 'antdv-next'
import type { PermissionView } from '#/api/system/permission-api'
import { listPermissions } from '#/api/system/permission-api'
import { usePermissions } from '#/composables/system/use-permissions'

defineOptions({ name: 'PermissionManagement' })

// 使用 composable
const {
  permissions,
  stats,
  loading,
  loadPermissions,
  loadStats,
  filterByModule,
  filterByAction,
  loadModules,
  loadActions,
} = usePermissions()

// 搜索参数
const queryParams = reactive({
  keyword: '',
  module: null as string | null,
  action: null as string | null,
})

// 模块和操作类型选项
const moduleOptions = ref<string[]>([])
const actionOptions = ref<string[]>([])

// 树形数据
const permissionTree = computed(() => {
  const map = new Map<number, any>()
  const roots: any[] = []

  permissions.value.forEach((perm) => {
    map.set(perm.id, { ...perm, key: perm.id, title: perm.perm_name, children: [] })
  })

  permissions.value.forEach((perm) => {
    const node = map.get(perm.id)
    if (perm.parent_id && map.has(perm.parent_id)) {
      map.get(perm.parent_id).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
})

// 筛选后的数据
const filteredPermissions = computed(() => {
  let result = permissions.value

  // 关键词筛选
  if (queryParams.keyword) {
    const keyword = queryParams.keyword.toLowerCase()
    result = result.filter(
      (perm) =>
        (perm.perm_name && perm.perm_name.toLowerCase().includes(keyword)) ||
        (perm.perm_code && perm.perm_code.toLowerCase().includes(keyword))
    )
  }

  // 模块筛选
  if (queryParams.module) {
    result = result.filter((perm) => perm.module_code === queryParams.module)
  }

  // 操作类型筛选
  if (queryParams.action) {
    result = result.filter((perm) => perm.action_code === queryParams.action)
  }

  console.log('Filtered permissions:', result.length, 'from', permissions.value.length)
  return result
})

// 分页数据
const paginatedPermissions = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredPermissions.value.slice(start, end)
})

const columns = [
  { title: '权限名称', dataIndex: 'perm_name', key: 'perm_name', width: 250 },
  { title: '权限代码', dataIndex: 'perm_code', key: 'perm_code', width: 300 },
  { title: '模块', dataIndex: 'module_code', key: 'module_code', width: 120 },
  { title: '操作类型', dataIndex: 'action_code', key: 'action_code', width: 120 },
  { title: '路由路径', dataIndex: 'path', key: 'path', width: 200 },
  { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80, align: 'right' },
]

// 方法
async function loadList() {
  try {
    await loadPermissions()
    console.log('Loaded permissions:', permissions.value)
    pagination.total = filteredPermissions.value.length
    console.log('Total filtered:', pagination.total)
  } catch (error: any) {
    console.error('Load permissions error:', error)
    message.error(error.message || '加载失败')
  }
}

async function loadOptions() {
  try {
    moduleOptions.value = await loadModules()
    actionOptions.value = await loadActions()
  } catch (error: any) {
    console.error('Load options error:', error)
  }
}

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredPermissions.value.length
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    module: null,
    action: null,
  })
  pagination.current = 1
}

function handleTableChange(pag: any, filters: any, sorter: any) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 生命周期
onMounted(async () => {
  console.log('PermissionManagement mounted')
  await loadList()
  await loadStats()
  await loadOptions()
  console.log('Stats loaded:', stats.value)
  console.log('Module options:', moduleOptions.value)
  console.log('Action options:', actionOptions.value)
})
</script>

<template>
  <div class="permission-management">
    <!-- 统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :span="6">
        <Card>
          <Statistic title="总权限数" :value="stats?.total || 0" prefix="🔐" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="模块数" :value="stats?.moduleCount || 0" prefix="📦" :value-style="{ color: '#1890ff' }" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="操作类型数" :value="stats?.actionCount || 0" prefix="⚡" :value-style="{ color: '#722ed1' }" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="当前页面" :value="paginatedPermissions.length" :suffix="`/ ${filteredPermissions.length}`" prefix="📄" />
        </Card>
      </Col>
    </Row>

    <!-- 搜索区域 -->
    <Card class="search-card">
      <Form layout="inline">
        <FormItem label="关键词">
          <Input
            v-model:value="queryParams.keyword"
            placeholder="权限名称/权限代码"
            style="width: 250px"
            allow-clear
            @press-enter="handleSearch"
          />
        </FormItem>

        <FormItem label="模块">
          <Select
            v-model:value="queryParams.module"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <Select.Option v-for="module in moduleOptions" :key="module" :value="module">
              {{ module }}
            </Select.Option>
          </Select>
        </FormItem>

        <FormItem label="操作类型">
          <Select
            v-model:value="queryParams.action"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <Select.Option v-for="action in actionOptions" :key="action" :value="action">
              {{ action }}
            </Select.Option>
          </Select>
        </FormItem>

        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">搜索</Button>
            <Button @click="handleReset">重置</Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 数据表格 -->
    <Card>
      <div class="table-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="paginatedPermissions.length === 0" class="empty">
          {{ permissions.length === 0 ? '暂无权限数据' : '筛选结果为空' }}
        </div>
        <div v-else>
          <Table
            :columns="columns"
            :data-source="paginatedPermissions"
            :loading="loading"
            :pagination="pagination"
            :scroll="{ x: 1200 }"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'module_code'">
                <Tag color="blue">{{ record.module_code || '-' }}</Tag>
              </template>
              <template v-else-if="column.key === 'action_code'">
                <Tag color="purple">{{ record.action_code || '-' }}</Tag>
              </template>
              <template v-else-if="column.key === 'perm_code'">
                <code>{{ record.perm_code }}</code>
              </template>
              <template v-else-if="column.key === 'path'">
                <span>{{ record.path || '-' }}</span>
              </template>
            </template>
          </Table>
        </div>
      </div>
    </Card>

    <!-- 树形视图（可选） -->
    <Card style="margin-top: 16px" title="树形视图">
      <Tree
        :tree-data="permissionTree"
        show-line
        default-expand-all
        :field-names="{ title: 'perm_name', key: 'id', children: 'children' }"
      >
        <template #title="{ perm_name, perm_code, module_code, action_code }">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ perm_name }}</span>
            <Tag v-if="module_code" size="small" color="blue">{{ module_code }}</Tag>
            <Tag v-if="action_code" size="small" color="purple">{{ action_code }}</Tag>
            <code style="font-size: 11px; opacity: 0.7;">{{ perm_code }}</code>
          </div>
        </template>
      </Tree>
    </Card>
  </div>
</template>

<style scoped>
.permission-management {
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
