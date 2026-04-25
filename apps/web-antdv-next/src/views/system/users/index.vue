/**
 * 用户管理页面 - 完整版本
 * 功能: 列表查询、搜索、筛选、统计、分页、排序、批量操作、导出
 */

<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { Button, Form, FormItem, Input, Select, Space, Switch, Tag, message, Modal, Card, Row, Col, Statistic, Checkbox, Dropdown } from 'antdv-next'
import { VbenModal } from '#/components'
import type { UserView } from '#/api/system/user-api'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getUserStats,
} from '#/api/system/user-api'
import { listRoles } from '#/api/system/role-api'
import { useUsers } from '#/composables/system/use-users'
import type { RoleWithStatusView } from '#/api/system/role-api'

defineOptions({ name: 'UserManagement' })

// 使用 composable
const {
  users,
  stats,
  loading,
  loadUsers,
  loadStats,
  clearCache,
} = useUsers()

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

// 排序配置
const sortConfig = reactive({
  field: '',
  order: 'ascend' as 'ascend' | 'descend' | null,
})

// 批量选择
const selectedRowKeys = ref<number[]>([])
const selectedRows = ref<UserView[]>([])

// 搜索表单
const queryParams = reactive({
  keyword: '',
  role: null as string | null,
  is_active: undefined as boolean | undefined,
  mobile: '',
  user_code: '',
})

// 高级搜索展开状态
const advancedSearchVisible = ref(false)

// 表单状态
const modalVisible = ref(false)
const editingId = ref<number | null>(null)

const userForm = reactive({
  login_name: '',
  user_name: '',
  user_code: '',
  mobile: '',
  roles: [] as string[],
  is_active: true,
})

const roleOptions = ref<RoleWithStatusView[]>([])

// 表格列配置
const userColumns = [
  { 
    title: '登录名', 
    dataIndex: 'login_name', 
    key: 'login_name', 
    width: 150, 
    fixed: 'left',
    sorter: true,
  },
  { 
    title: '用户名', 
    dataIndex: 'user_name', 
    key: 'user_name', 
    width: 120,
    sorter: true,
  },
  { 
    title: '用户编码', 
    dataIndex: 'user_code', 
    key: 'user_code', 
    width: 120,
    sorter: true,
  },
  { 
    title: '手机号', 
    dataIndex: 'mobile', 
    key: 'mobile', 
    width: 130,
    sorter: true,
  },
  { 
    title: '角色', 
    dataIndex: 'roles', 
    key: 'roles', 
    width: 200,
  },
  { 
    title: '状态', 
    dataIndex: 'is_active', 
    key: 'is_active', 
    width: 80,
    sorter: true,
  },
  { 
    title: '创建时间', 
    dataIndex: 'created_at', 
    key: 'created_at', 
    width: 160,
    sorter: true,
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 250, 
    fixed: 'right',
  },
]

// 计算属性
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 关键词搜索
  if (queryParams.keyword) {
    const keyword = queryParams.keyword.toLowerCase()
    result = result.filter(user => 
      user.login_name.toLowerCase().includes(keyword) ||
      user.user_name.toLowerCase().includes(keyword) ||
      user.user_code?.toLowerCase().includes(keyword) ||
      user.mobile?.includes(keyword)
    )
  }
  
  // 角色筛选
  if (queryParams.role) {
    result = result.filter(user => user.roles?.includes(queryParams.role!))
  }
  
  // 状态筛选
  if (queryParams.is_active !== undefined) {
    result = result.filter(user => user.is_active === queryParams.is_active)
  }
  
  // 手机号筛选
  if (queryParams.mobile) {
    result = result.filter(user => user.mobile?.includes(queryParams.mobile))
  }
  
  // 用户编码筛选
  if (queryParams.user_code) {
    result = result.filter(user => user.user_code?.toLowerCase().includes(queryParams.user_code.toLowerCase()))
  }
  
  // 排序
  if (sortConfig.field && sortConfig.order) {
    result.sort((a, b) => {
      let aVal = (a as any)[sortConfig.field]
      let bVal = (b as any)[sortConfig.field]
      
      if (sortConfig.field === 'created_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (aVal === bVal) return 0
      if (aVal < bVal) return sortConfig.order === 'ascend' ? -1 : 1
      return sortConfig.order === 'ascend' ? 1 : -1
    })
  }
  
  return result
})

const paginatedUsers = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredUsers.value.slice(start, end)
})

const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 方法
function openCreateModal() {
  resetForm()
  editingId.value = null
  modalVisible.value = true
}

function openEditModal(record: UserView) {
  Object.assign(userForm, {
    login_name: record.login_name,
    user_name: record.user_name,
    user_code: record.user_code,
    mobile: record.mobile || '',
    roles: record.roles || [],
    is_active: record.is_active,
  })
  editingId.value = record.id
  modalVisible.value = true
}

async function handleSubmit(e: any) {
  // 阻止弹窗自动关闭
  e?.preventDefault?.()

  // 表单验证
  if (!userForm.login_name.trim()) {
    message.error('请输入登录名')
    return
  }
  if (!userForm.user_name.trim()) {
    message.error('请输入用户名')
    return
  }

  try {
    if (editingId.value) {
      await updateUser({
        id: editingId.value,
        user_name: userForm.user_name,
        mobile: userForm.mobile || undefined,
        roles: userForm.roles,
        is_active: userForm.is_active,
      })
      message.success('更新成功')
    } else {
      await createUser({
        login_name: userForm.login_name,
        user_name: userForm.user_name,
        user_code: userForm.user_code || undefined,
        mobile: userForm.mobile || undefined,
        roles: userForm.roles,
        is_active: userForm.is_active,
      })
      message.success('创建成功')
    }
    modalVisible.value = false
    await loadList()
    await loadStats()
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || '操作失败'
    console.error('操作失败:', error)
    message.error(errorMsg)
  }
}

function handleDelete(record: UserView) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户「${record.user_name}」吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteUser(record.id)
        message.success('删除成功')
        await loadList()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    },
  })
}

async function handleResetPassword(id: number) {
  Modal.confirm({
    title: '确认重置密码',
    content: '确定要重置该用户的密码为默认密码吗？',
    okText: '重置',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await resetPassword(id)
        message.success('密码已重置为默认密码')
      } catch (error: any) {
        message.error(error.message || '重置失败')
      }
    },
  })
}

async function loadList() {
  try {
    await loadUsers(queryParams)
    pagination.total = filteredUsers.value.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  }
}

async function loadRoles() {
  try {
    roleOptions.value = await listRoles()
  } catch (error: any) {
    message.error(error.message || '加载角色失败')
  }
}

function handleSearch() {
  pagination.current = 1
  pagination.total = filteredUsers.value.length
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    role: null,
    is_active: undefined,
    mobile: '',
    user_code: '',
  })
  pagination.current = 1
  sortConfig.field = ''
  sortConfig.order = null
  selectedRowKeys.value = []
  selectedRows.value = []
}

function handleTableChange(pag: any, filters: any, sorter: any) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  
  if (sorter.field) {
    sortConfig.field = sorter.field
    sortConfig.order = sorter.order
  }
}

function onSelectChange(keys: number[], rows: UserView[]) {
  selectedRowKeys.value = keys
  selectedRows.value = rows
}

function toggleAdvancedSearch() {
  advancedSearchVisible.value = !advancedSearchVisible.value
}

async function handleBatchDelete() {
  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        for (const user of selectedRows.value) {
          await deleteUser(user.id)
        }
        message.success(`成功删除 ${selectedRows.value.length} 个用户`)
        selectedRowKeys.value = []
        selectedRows.value = []
        await loadList()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    },
  })
}

async function handleBatchToggleActive(active: boolean) {
  try {
    for (const user of selectedRows.value) {
      await updateUser({
        id: user.id,
        is_active: active,
      })
    }
    message.success(`成功${active ? '启用' : '停用'} ${selectedRows.value.length} 个用户`)
    selectedRowKeys.value = []
    selectedRows.value = []
    await loadList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

function handleExport() {
  // 导出 CSV
  const headers = ['登录名', '用户名', '用户编码', '手机号', '角色', '状态', '创建时间']
  const data = filteredUsers.value.map(user => [
    user.login_name,
    user.user_name,
    user.user_code || '',
    user.mobile || '',
    user.roles?.join(', ') || '',
    user.is_active ? '启用' : '停用',
    new Date(user.created_at).toLocaleString('zh-CN'),
  ])
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `用户列表_${new Date().toLocaleDateString('zh-CN')}.csv`
  link.click()
  
  message.success('导出成功')
}

function resetForm() {
  Object.assign(userForm, {
    login_name: '',
    user_name: '',
    user_code: '',
    mobile: '',
    roles: [],
    is_active: true,
  })
}

// 生命周期
onMounted(async () => {
  await loadList()
  await loadRoles()
  await loadStats()
})
</script>

<template>
  <div class="user-management">
    <!-- 统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :span="6">
        <Card>
          <Statistic title="总用户数" :value="stats?.total || 0" prefix="👥" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="启用用户" :value="stats?.active || 0" prefix="✅" :value-style="{ color: '#52c41a' }" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="停用用户" :value="stats?.inactive || 0" prefix="⛔" :value-style="{ color: '#ff4d4f' }" />
        </Card>
      </Col>
      <Col :span="6">
        <Card>
          <Statistic title="当前页面" :value="paginatedUsers.length" :suffix="`/ ${filteredUsers.length}`" prefix="📄" />
        </Card>
      </Col>
    </Row>

    <!-- 搜索区域 -->
    <Card class="search-card">
      <Form layout="inline">
        <FormItem label="关键词">
          <Input
            v-model:value="queryParams.keyword"
            placeholder="登录名/用户名/编码/手机号"
            style="width: 250px"
            allow-clear
            @press-enter="handleSearch"
          />
        </FormItem>

        <FormItem label="状态">
          <Select
            v-model:value="queryParams.is_active"
            placeholder="请选择"
            style="width: 120px"
            allow-clear
          >
            <Select.Option :value="true">启用</Select.Option>
            <Select.Option :value="false">停用</Select.Option>
          </Select>
        </FormItem>

        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">搜索</Button>
            <Button @click="handleReset">重置</Button>
            <Button @click="toggleAdvancedSearch">
              {{ advancedSearchVisible ? '收起' : '高级搜索' }}
            </Button>
            <Button type="primary" @click="openCreateModal" disabled>新建用户（后端未实现）</Button>
            <Button @click="handleExport">导出</Button>
          </Space>
        </FormItem>
      </Form>

      <!-- 高级搜索 -->
      <div v-show="advancedSearchVisible" class="advanced-search">
        <Form layout="inline">
          <FormItem label="角色">
            <Select
              v-model:value="queryParams.role"
              placeholder="请选择角色"
              style="width: 150px"
              allow-clear
            >
              <Select.Option v-for="item in roleOptions" :key="item.role_code" :value="item.role_code">
                {{ item.role_name }}
              </Select.Option>
            </Select>
          </FormItem>

          <FormItem label="手机号">
            <Input
              v-model:value="queryParams.mobile"
              placeholder="请输入手机号"
              style="width: 150px"
              allow-clear
            />
          </FormItem>

          <FormItem label="用户编码">
            <Input
              v-model:value="queryParams.user_code"
              placeholder="请输入用户编码"
              style="width: 150px"
              allow-clear
            />
          </FormItem>
        </Form>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="hasSelected" class="batch-actions">
        <Space>
          <span>已选择 {{ selectedRowKeys.length }} 项</span>
          <Button size="small" type="primary" @click="handleBatchToggleActive(true)" disabled>批量启用（后端未实现）</Button>
          <Button size="small" @click="handleBatchToggleActive(false)" disabled>批量停用（后端未实现）</Button>
          <Button size="small" danger @click="handleBatchDelete" disabled>批量删除（后端未实现）</Button>
        </Space>
      </div>
    </Card>

    <!-- 数据表格 -->
    <Card>
      <div class="table-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="paginatedUsers.length === 0" class="empty">暂无数据</div>
        <div v-else class="table-wrapper">
          <table class="user-table">
            <thead>
              <tr>
                <th style="width: 50px;">
                  <Checkbox 
                    :checked="selectedRowKeys.length === paginatedUsers.length && paginatedUsers.length > 0"
                    @change="(e: any) => {
                      if (e.target.checked) {
                        selectedRowKeys = paginatedUsers.map(u => u.id)
                        selectedRows = [...paginatedUsers]
                      } else {
                        selectedRowKeys = []
                        selectedRows = []
                      }
                    }"
                  />
                </th>
                <th v-for="col in userColumns" :key="col.key" :style="{ width: col.width + 'px' }" :class="{ sortable: col.sorter }">
                  {{ col.title }}
                  <span v-if="col.sorter" class="sort-icon">
                    <span v-if="sortConfig.field === col.key" class="active">
                      {{ sortConfig.order === 'ascend' ? '↑' : '↓' }}
                    </span>
                    <span v-else>↕</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id" @click="(e: any) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SPAN') {
                  const index = selectedRowKeys.indexOf(user.id)
                  if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                    selectedRows = selectedRows.filter(r => r.id !== user.id)
                  } else {
                    selectedRowKeys.push(user.id)
                    selectedRows.push(user)
                  }
                }
              }" :class="{ selected: selectedRowKeys.includes(user.id) }">
                <td>
                  <Checkbox 
                    :checked="selectedRowKeys.includes(user.id)"
                    @change="(e: any) => {
                      if (e.target.checked) {
                        selectedRowKeys.push(user.id)
                        selectedRows.push(user)
                      } else {
                        const index = selectedRowKeys.indexOf(user.id)
                        selectedRowKeys.splice(index, 1)
                        selectedRows = selectedRows.filter(r => r.id !== user.id)
                      }
                    }"
                    @click.stop
                  />
                </td>
                <td>{{ user.login_name }}</td>
                <td>{{ user.user_name }}</td>
                <td>{{ user.user_code || '-' }}</td>
                <td>{{ user.mobile || '-' }}</td>
                <td>
                  <Space wrap>
                    <Tag v-for="role in user.roles" :key="role" color="blue">
                      {{ role }}
                    </Tag>
                    <span v-if="!user.roles || user.roles.length === 0">-</span>
                  </Space>
                </td>
                <td>
                  <Tag :color="user.is_active ? 'success' : 'default'">
                    {{ user.is_active ? '启用' : '停用' }}
                  </Tag>
                </td>
                <td>{{ new Date(user.created_at).toLocaleString('zh-CN') }}</td>
                <td>
                  <Space>
                    <Button size="small" type="link" @click.stop="openEditModal(user)" disabled>编辑（后端未实现）</Button>
                    <Button size="small" type="link" @click.stop="handleResetPassword(user.id)" disabled>重置密码（后端未实现）</Button>
                    <Button size="small" type="link" danger @click.stop="handleDelete(user)" disabled>删除（后端未实现）</Button>
                  </Space>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && paginatedUsers.length > 0" class="pagination">
        <div class="pagination-info">
          共 {{ filteredUsers.length }} 条数据，当前第 {{ (pagination.current - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.current * pagination.pageSize, filteredUsers.length) }} 条
        </div>
        <Space>
          <Button 
            size="small" 
            :disabled="pagination.current === 1" 
            @click="pagination.current--"
          >
            上一页
          </Button>
          <span>第 {{ pagination.current }} / {{ Math.ceil(filteredUsers.length / pagination.pageSize) }} 页</span>
          <Button 
            size="small" 
            :disabled="pagination.current >= Math.ceil(filteredUsers.length / pagination.pageSize)" 
            @click="pagination.current++"
          >
            下一页
          </Button>
          <Select 
            v-model:value="pagination.pageSize" 
            size="small"
            style="width: 80px"
            @change="pagination.current = 1"
          >
            <Select.Option :value="10">10条/页</Select.Option>
            <Select.Option :value="20">20条/页</Select.Option>
            <Select.Option :value="50">50条/页</Select.Option>
            <Select.Option :value="100">100条/页</Select.Option>
          </Select>
        </Space>
      </div>
    </Card>

    <!-- 新建/编辑用户弹窗 -->
    <VbenModal
      v-model:open="modalVisible"
      :title="editingId ? '编辑用户' : '新建用户'"
      width="600px"
      :confirm-loading="loading"
      @ok="handleSubmit"
    >
      <Form :model="userForm" layout="vertical">
        <FormItem label="登录名" required>
          <Input v-model:value="userForm.login_name" :disabled="!!editingId" placeholder="请输入登录名" />
        </FormItem>

        <FormItem label="用户名" required>
          <Input v-model:value="userForm.user_name" placeholder="请输入用户名" />
        </FormItem>

        <FormItem label="用户编码">
          <Input v-model:value="userForm.user_code" placeholder="请输入用户编码(可选)" />
        </FormItem>

        <FormItem label="手机号">
          <Input v-model:value="userForm.mobile" placeholder="请输入手机号" />
        </FormItem>

        <FormItem label="角色">
          <Select v-model:value="userForm.roles" mode="multiple" placeholder="请选择角色">
            <Select.Option v-for="item in roleOptions" :key="item.role_code" :value="item.role_code">
              {{ item.role_name }}
            </Select.Option>
          </Select>
        </FormItem>

        <FormItem label="是否启用">
          <Switch v-model:checked="userForm.is_active" />
        </FormItem>
      </Form>
    </VbenModal>
  </div>
</template>

<style scoped>
.user-management {
  padding: 16px;
  background: #f0f2f5;
  min-height: 100vh;
}

.stats-row {
  margin-bottom: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.advanced-search {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.batch-actions {
  margin-top: 12px;
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
}

.table-container {
  min-height: 400px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-table thead {
  background: #fafafa;
}

.user-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  border-bottom: 2px solid #e8e8e8;
}

.user-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.user-table th.sortable:hover {
  background: #f5f5f5;
}

.sort-icon {
  margin-left: 4px;
  color: #bfbfbf;
}

.sort-icon .active {
  color: #1890ff;
}

.user-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-table tbody tr:hover {
  background: #fafafa;
}

.user-table tbody tr.selected {
  background: #e6f7ff;
}

.user-table tbody tr.selected td {
  background: #e6f7ff;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.pagination-info {
  color: #595959;
  font-size: 14px;
}
</style>
