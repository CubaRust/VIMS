/**
 * 角色管理页面
 */

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Button, Form, FormItem, Input, Space, Switch, Tree, message, Modal, Table, Tag } from 'antdv-next'
import { VbenModal } from '@vben/common-ui'
import type { RoleWithStatusView } from '#/api/system/role-api'
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  getRolePermissions,
} from '#/api/system/role-api'
import { listPermissions } from '#/api/system/permission-api'

defineOptions({ name: 'RoleManagement' })

const roles = ref<RoleWithStatusView[]>([])
const loading = ref(false)
const modalVisible = ref(false)
const permissionModalVisible = ref(false)
const editingId = ref<number | null>(null)

const roleForm = reactive({
  role_code: '',
  role_name: '',
  description: '',
  is_active: true,
})

const selectedPermissions = ref<number[]>([])
const permissionTree = ref<any[]>([])

const roleColumns = [
  { title: '角色编码', dataIndex: 'role_code', key: 'role_code', width: 150, fixed: 'left' },
  { title: '角色名称', dataIndex: 'role_name', key: 'role_name', width: 200 },
  { title: '描述', dataIndex: 'description', key: 'description', width: 300 },
  { title: '用户数', dataIndex: 'user_count', key: 'user_count', width: 100, align: 'right' },
  { title: '状态', dataIndex: 'is_active', key: 'is_active', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]

async function loadList() {
  loading.value = true
  try {
    const result = await listRoles()
    console.log('Loaded roles:', result)
    roles.value = result
    console.log('Roles value:', roles.value)
  } catch (error: any) {
    console.error('Load roles error:', error)
    message.error(error.message || '加载失败')
    roles.value = []
  } finally {
    loading.value = false
  }
}

async function loadPermissions() {
  try {
    const permissions = await listPermissions()
    permissionTree.value = buildPermissionTree(permissions)
  } catch (error: any) {
    message.error(error.message || '加载权限失败')
  }
}

function buildPermissionTree(permissions: any[]): any[] {
  const map = new Map()
  const roots: any[] = []

  permissions.forEach((perm) => {
    map.set(perm.id, { ...perm, children: [] })
  })

  permissions.forEach((perm) => {
    const node = map.get(perm.id)
    if (perm.parent_id && map.has(perm.parent_id)) {
      map.get(perm.parent_id).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function openCreateModal() {
  resetForm()
  editingId.value = null
  modalVisible.value = true
}

async function openEditModal(record: RoleWithStatusView) {
  editingId.value = record.id
  Object.assign(roleForm, {
    role_code: record.role_code,
    role_name: record.role_name,
    description: (record as any).description || '',
    is_active: record.is_active !== false,
  })
  modalVisible.value = true
}

async function openPermissionModal(record: RoleWithStatusView) {
  editingId.value = record.id
  try {
    selectedPermissions.value = await getRolePermissions(record.id)
    permissionModalVisible.value = true
  } catch (error: any) {
    message.error(error.message || '加载权限失败')
  }
}

async function handleSubmit() {
  try {
    if (editingId.value) {
      await updateRole({
        role_id: editingId.value,
        role_name: roleForm.role_name,
        description: roleForm.description,
        is_active: roleForm.is_active,
      })
      message.success('更新成功')
    } else {
      await createRole(roleForm)
      message.success('创建成功')
    }
    modalVisible.value = false
    await loadList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

async function handlePermissionSubmit() {
  if (!editingId.value) return
  try {
    await assignPermissions({
      role_id: editingId.value,
      permission_ids: selectedPermissions.value,
    })
    message.success('权限分配成功')
    permissionModalVisible.value = false
    await loadList()
  } catch (error: any) {
    message.error(error.message || '分配失败')
  }
}

function handleDelete(record: RoleWithStatusView) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色「${record.role_name}」吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteRole(record.id)
        message.success('删除成功')
        await loadList()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    },
  })
}

function resetForm() {
  Object.assign(roleForm, {
    role_code: '',
    role_name: '',
    description: '',
    is_active: true,
  })
}

onMounted(() => {
  loadList()
  loadPermissions()
})
</script>

<template>
  <div class="role-management">
    <div class="toolbar">
      <Button type="primary" @click="openCreateModal">新建角色</Button>
    </div>

    <Table
      :columns="roleColumns"
      :data-source="roles"
      :loading="loading"
      :scroll="{ x: 1200 }"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'is_active'">
          <Tag :color="record.is_active ? 'success' : 'default'">
            {{ record.is_active ? '启用' : '停用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button size="small" type="link" @click="openEditModal(record)">编辑</Button>
            <Button size="small" type="link" @click="openPermissionModal(record)">分配权限</Button>
            <Button size="small" type="link" danger @click="handleDelete(record)">删除</Button>
          </Space>
        </template>
      </template>
    </Table>

    <VbenModal
      v-model:open="modalVisible"
      :title="editingId ? '编辑角色' : '新建角色'"
      width="600px"
      @ok="handleSubmit"
    >
      <Form :model="roleForm" layout="vertical">
        <FormItem label="角色编码" required>
          <Input v-model:value="roleForm.role_code" :disabled="!!editingId" placeholder="请输入角色编码" />
        </FormItem>
        <FormItem label="角色名称" required>
          <Input v-model:value="roleForm.role_name" placeholder="请输入角色名称" />
        </FormItem>
        <FormItem label="描述">
          <Input.TextArea v-model:value="roleForm.description" :rows="3" placeholder="请输入角色描述" />
        </FormItem>
        <FormItem label="是否启用">
          <Switch v-model:checked="roleForm.is_active" />
        </FormItem>
      </Form>
    </VbenModal>

    <VbenModal
      v-model:open="permissionModalVisible"
      title="分配权限"
      width="600px"
      @ok="handlePermissionSubmit"
    >
      <Tree
        v-model:checkedKeys="selectedPermissions"
        :tree-data="permissionTree"
        checkable
        :field-names="{ title: 'perm_name', key: 'id', children: 'children' }"
        placeholder="请选择权限"
      />
    </VbenModal>
  </div>
</template>

<style scoped>
.role-management {
  padding: 16px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
