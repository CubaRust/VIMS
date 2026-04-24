/**
* 工作台首页
*/

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Card, Row, Col, Statistic, Tag, message } from 'antdv-next'
// import { VbenCountToAnimator } from '#/components'

defineOptions({ name: 'Dashboard' })

const stats = ref({
  todayInbound: 0,
  todayOutbound: 0,
  lowStockCount: 0,
  pendingApproval: 0,
})

const recentInbounds = ref<any[]>([])
const recentOutbounds = ref<any[]>([])
const alerts = ref<any[]>([])
const todos = ref<any[]>([])

async function loadDashboardData() {
  try {
    // TODO: 调用统计 API
    stats.value = {
      todayInbound: 125,
      todayOutbound: 98,
      lowStockCount: 15,
      pendingApproval: 8,
    }

    recentInbounds.value = []
    recentOutbounds.value = []
    alerts.value = []
    todos.value = []
  } catch (error: any) {
    message.error(error.message || '加载失败')
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <Row :gutter="16" class="stats-row">
      <Col :span="6">
        <Card>
          <Statistic title="今日入库" :value="stats.todayInbound" suffix="单">
            <template #prefix>
              <VbenCountToAnimator :end-val="stats.todayInbound" />
            </template>
          </Statistic>
        </Card>
      </Col>

      <Col :span="6">
        <Card>
          <Statistic title="今日出库" :value="stats.todayOutbound" suffix="单">
            <template #prefix>
              <VbenCountToAnimator :end-val="stats.todayOutbound" />
            </template>
          </Statistic>
        </Card>
      </Col>

      <Col :span="6">
        <Card>
          <Statistic title="低库存预警" :value="stats.lowStockCount" suffix="项">
            <template #prefix>
              <VbenCountToAnimator :end-val="stats.lowStockCount" />
            </template>
          </Statistic>
        </Card>
      </Col>

      <Col :span="6">
        <Card>
          <Statistic title="待审批单据" :value="stats.pendingApproval" suffix="单">
            <template #prefix>
              <VbenCountToAnimator :end-val="stats.pendingApproval" />
            </template>
          </Statistic>
        </Card>
      </Col>
    </Row>

    <!-- 内容区域 -->
    <Row :gutter="16" class="content-row">
      <Col :span="12">
        <Card title="最近入库单" :bordered="false">
          <div v-if="recentInbounds.length === 0" class="empty-list">暂无数据</div>
          <div v-else class="list-container">
            <div v-for="item in recentInbounds" :key="item.doc_no" class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">{{ item.doc_no }}</div>
                <div class="list-item-description">{{ item.supplier_name }} | {{ item.inbound_date }}</div>
              </div>
              <Tag :color="item.status === 'APPROVED' ? 'success' : 'processing'">
                {{ item.status }}
              </Tag>
            </div>
          </div>
        </Card>
      </Col>

      <Col :span="12">
        <Card title="最近出库单" :bordered="false">
          <div v-if="recentOutbounds.length === 0" class="empty-list">暂无数据</div>
          <div v-else class="list-container">
            <div v-for="item in recentOutbounds" :key="item.doc_no" class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">{{ item.doc_no }}</div>
                <div class="list-item-description">{{ item.customer_name }} | {{ item.outbound_date }}</div>
              </div>
              <Tag :color="item.status === 'APPROVED' ? 'success' : 'processing'">
                {{ item.status }}
              </Tag>
            </div>
          </div>
        </Card>
      </Col>
    </Row>

    <Row :gutter="16" class="content-row">
      <Col :span="12">
        <Card title="异常预警" :bordered="false">
          <div v-if="alerts.length === 0" class="empty-list">暂无数据</div>
          <div v-else class="list-container">
            <div v-for="(item, index) in alerts" :key="index" class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">{{ item.title }}</div>
                <div class="list-item-description">{{ item.description }}</div>
              </div>
              <Tag color="red">{{ item.type }}</Tag>
            </div>
          </div>
        </Card>
      </Col>

      <Col :span="12">
        <Card title="待办事项" :bordered="false">
          <div v-if="todos.length === 0" class="empty-list">暂无数据</div>
          <div v-else class="list-container">
            <div v-for="(item, index) in todos" :key="index" class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">{{ item.title }}</div>
                <div class="list-item-description">{{ item.description }}</div>
              </div>
              <Tag color="blue">{{ item.priority }}</Tag>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.content-row {
  margin-bottom: 16px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 4px;
}

.list-item-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.empty-list {
  text-align: center;
  padding: 24px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
</style>
