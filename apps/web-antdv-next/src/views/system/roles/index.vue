<script setup lang="ts">
import { onMounted } from 'vue';

import { useUsers } from '#/composables/system';

const {
  users,
  loading,
  error,
  loadUsers,
  loadUsersByRole,
} = useUsers();



onMounted(() => {
  void loadUsers();
});

async function loadAdmins() {
  await loadUsersByRole('ADMIN');
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败</div>

    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.user_name }} - {{ user.roles?.join(', ') }}
      </li>
    </ul>

    <button @click="loadAdmins">只看管理员</button>
  </div>
</template>
