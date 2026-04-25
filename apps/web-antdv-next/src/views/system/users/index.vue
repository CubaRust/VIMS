<!--<script setup lang="ts">-->
<!--defineOptions({ name: '用户管理' });-->
<!--</script>-->

<!--<template>-->
<!--  <div>用户管理</div>-->
<!--</template>-->

/**
* 用户管理页面
*/

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { Button, Form, FormItem, Input, Select, Space, Switch, Tag, message } from 'antdv-next'
import { VbenModal, VbenVxeTable } from '#/components'

defineOptions({ name: 'UserManagement' })

const users = ref<any[]>([])
const loading = ref(false)
const modalVisible = ref(false)
const editingId = ref<number | null>(null)

const userForm = reactive({
  username: '',
  password: '',
  real_name: '',
  email: '',
  phone: '',
  role_ids: [] as number[],
  is_active: true,
})

const queryParams = reactive({
  keyword: '',
  role_id: null as number | null,
  is_active: undefined as boolean | undefined,
})

const userColumns = [
  { field: 'username', title: '用户名', width: 150, fixed: 'left' },
  { field: 'real_name', title: '真实姓名', width: 120 },
  { field: 'email', title: '邮箱', width: 180 },
  { field: 'phone', title: '手机号', width: 130 },
  { field: 'roles', title: '角色', width: 200, slots: { default: 'roles' } },
  { field: 'is_active', title: '状态', width: 80, slots: { default: 'is_active' } },
  { field: 'last_login_at', title: '最后登录', width: 160 },
  { field: 'action', title: '操作', width: 200, fixed: 'right', slots: { default: 'action' } },
]

const roleOptions = ref<any[]>([])

function openCreateModal() {
  resetForm()
  editingId.value = null
  modalVisible.value = true
}

function openEditModal(record: any) {
  Object.assign(userForm, {
    username: record.username,
    real_name: record.real_name,
    email: record.email || '',
    phone: record.phone || '',
    role_ids: record.role_ids || [],
    is_active: record.is_active,
  })
  editingId.value = record.id
  modalVisible.value = true
}

async function handleSubmit() {
  try {
    // TODO: 调用创建/更新 API
    message.success(editingId.value ? '更新成功' : '创建成功')
    modalVisible.value = false
    await loadList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

async function handleDelete(id: number) {
  try {
    // TODO: 调用删除 API
    message.success('删除成功')
    await loadList()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

async function handleResetPassword(id: number) {
  try {
    // TODO: 调用重置密码 API
    message.success('密码已重置为默认密码')
  } catch (error: any) {
    message.error(error.message || '重置失败')
  }
}

function handleSearch() {
  loadList()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.role_id = null
  queryParams.is_active = undefined
  loadList()
}

async function loadList() {
  loading.value = true
  try {
    // TODO: 调用用户列表 API
    users.value = []
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(userForm, {
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    role_ids: [],
    is_active: true,
  })
}

onMounted(() => {
  loadList()
  // TODO: 加载角色列表
})
</script>

<template>
  <div class="user-management">
    <div class="search-bar">
      <Form layout="inline">
        <FormItem label="关键词">
          <Input
            v-model:value="queryParams.keyword"
            placeholder="用户名/姓名"
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </FormItem>

        <FormItem label="角色">
          <Select
            v-model:value="queryParams.role_id"
            placeholder="请选择"
            style="width: 150px"
            allow-clear
          >
            <Select.Option v-for="item in roleOptions" :key="item.id" :value="item.id">
              {{ item.role_name }}
            </Select.Option>
          </Select>
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
            <Button type="primary" @click="openCreateModal">新建用户</Button>
          </Space>
        </FormItem>
      </Form>
    </div>

    <VbenVxeTable :columns="userColumns" :data="users" :loading="loading">
      <template #roles="{ row }">
        <Space>
          <Tag v-for="role in row.roles" :key="role.id" color="blue">
            {{ role.role_name }}
          </Tag>
        </Space>
      </template>

      <template #is_active="{ row }">
        <Tag :color="row.is_active ? 'success' : 'default'">
          {{ row.is_active ? '启用' : '停用' }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <Button size="small" type="link" @click="openEditModal(row)">编辑</Button>
          <Button size="small" type="link" @click="handleResetPassword(row.id)">重置密码</Button>
          <Button size="small" type="link" danger @click="handleDelete(row.id)">删除</Button>
        </Space>
      </template>
    </VbenVxeTable>

    <VbenModal
      v-model:open="modalVisible"
      :title="editingId ? '编辑用户' : '新建用户'"
      width="600px"
      @ok="handleSubmit"
    >
      <Form :model="userForm" layout="vertical">
        <FormItem label="用户名" required>
          <Input v-model:value="userForm.username" :disabled="!!editingId" />
        </FormItem>

        <FormItem v-if="!editingId" label="密码" required>
          <Input.Password v-model:value="userForm.password" />
        </FormItem>

        <FormItem label="真实姓名" required>
          <Input v-model:value="userForm.real_name" />
        </FormItem>

        <FormItem label="邮箱">
          <Input v-model:value="userForm.email" type="email" />
        </FormItem>

        <FormItem label="手机号">
          <Input v-model:value="userForm.phone" />
        </FormItem>

        <FormItem label="角色" required>
          <Select v-model:value="userForm.role_ids" mode="multiple">
            <Select.Option v-for="item in roleOptions" :key="item.id" :value="item.id">
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
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
