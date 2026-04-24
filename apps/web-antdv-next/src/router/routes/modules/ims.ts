import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // ========== 系统管理 ==========
  {
    name: 'System',
    path: '/system',
    meta: {
      icon: 'lucide:settings',
      order: 1,
      title: '系统管理',
    },
    children: [
      {
        name: 'SystemUsers',
        path: '/system/users',
        component: () => import('#/views/system/users/index.vue'),
        meta: { icon: 'lucide:users', title: '用户管理' },
      },
      {
        name: 'SystemRoles',
        path: '/system/roles',
        component: () => import('#/views/system/roles/index.vue'),
        meta: { icon: 'lucide:shield', title: '角色管理' },
      },
      {
        name: 'SystemPermissions',
        path: '/system/permissions',
        component: () => import('#/views/system/permissions/index.vue'),
        meta: { icon: 'lucide:lock', title: '权限管理' },
      },
      {
        name: 'SystemDicts',
        path: '/system/dicts',
        component: () => import('#/views/system/dicts/index.vue'),
        meta: { icon: 'lucide:book-open', title: '字典管理' },
      },
      {
        name: 'SystemDocNoRules',
        path: '/system/doc-no-rules',
        component: () => import('#/views/system/doc-no-rules/index.vue'),
        meta: { icon: 'lucide:hash', title: '单据编号规则' },
      },
    ],
  },

  // ========== 主���据管理 ==========
  {
    name: 'MasterData',
    path: '/master-data',
    meta: {
      icon: 'lucide:database',
      order: 2,
      title: '主数据管理',
    },
    children: [
      {
        name: 'MasterDataWarehouses',
        path: '/master-data/warehouses',
        component: () => import('#/views/master-data/warehouses/index.vue'),
        meta: { icon: 'lucide:warehouse', title: '仓库管理' },
      },
      {
        name: 'MasterDataLocations',
        path: '/master-data/locations',
        component: () => import('#/views/master-data/locations/index.vue'),
        meta: { icon: 'lucide:map-pin', title: '仓位管理' },
      },
      {
        name: 'MasterDataMaterials',
        path: '/master-data/materials',
        component: () => import('#/views/master-data/materials/index.vue'),
        meta: { icon: 'lucide:box', title: '物料管理' },
      },
      {
        name: 'MasterDataSuppliers',
        path: '/master-data/suppliers',
        component: () => import('#/views/master-data/suppliers/index.vue'),
        meta: { icon: 'lucide:truck', title: '供应商管理' },
      },
      {
        name: 'MasterDataCustomers',
        path: '/master-data/customers',
        component: () => import('#/views/master-data/customers/index.vue'),
        meta: { icon: 'lucide:contact', title: '客户管理' },
      },
      {
        name: 'MasterDataBoms',
        path: '/master-data/boms',
        component: () => import('#/views/master-data/boms/index.vue'),
        meta: { icon: 'lucide:list-tree', title: 'BOM管理' },
      },
      {
        name: 'MasterDataRoutes',
        path: '/master-data/routes',
        component: () => import('#/views/master-data/routes/index.vue'),
        meta: { icon: 'lucide:git-branch', title: '工艺路线' },
      },
      {
        name: 'MasterDataStatusFlows',
        path: '/master-data/status-flows',
        component: () => import('#/views/master-data/status-flows/index.vue'),
        meta: { icon: 'lucide:workflow', title: '状态流转规则' },
      },
      {
        name: 'MasterDataRecoveryTemplates',
        path: '/master-data/recovery-templates',
        component: () =>
          import('#/views/master-data/recovery-templates/index.vue'),
        meta: { icon: 'lucide:file-check', title: '回收模板' },
      },
    ],
  },

  // ========== 入库管理 ==========
  {
    name: 'Inbound',
    path: '/inbound',
    meta: {
      icon: 'lucide:package-plus',
      order: 3,
      title: '入库管理',
    },
    children: [
      {
        name: 'InboundList',
        path: '/inbound/list',
        component: () => import('#/views/inbound/list/index.vue'),
        meta: { icon: 'lucide:list', title: '入库单列表' },
      },
      {
        name: 'InboundCreate',
        path: '/inbound/create',
        component: () => import('#/views/inbound/create/index.vue'),
        meta: { icon: 'lucide:plus-circle', title: '创建入库单' },
      },
    ],
  },

  // ========== 出库管理 ==========
  {
    name: 'Outbound',
    path: '/outbound',
    meta: {
      icon: 'lucide:package-minus',
      order: 4,
      title: '出库管理',
    },
    children: [
      {
        name: 'OutboundList',
        path: '/outbound/list',
        component: () => import('#/views/outbound/list/index.vue'),
        meta: { icon: 'lucide:list', title: '出库单列表' },
      },
      {
        name: 'OutboundCreate',
        path: '/outbound/create',
        component: () => import('#/views/outbound/create/index.vue'),
        meta: { icon: 'lucide:plus-circle', title: '创建出库单' },
      },
      {
        name: 'OutboundBatch',
        path: '/outbound/batch',
        component: () => import('#/views/outbound/batch/index.vue'),
        meta: { icon: 'lucide:layers', title: '批量出库' },
      },
    ],
  },

  // ========== 库存管理 ==========
  {
    name: 'Inventory',
    path: '/inventory',
    meta: {
      icon: 'lucide:bar-chart-3',
      order: 5,
      title: '库存管理',
    },
    children: [
      {
        name: 'InventoryBalance',
        path: '/inventory/balance',
        component: () => import('#/views/inventory/balance/index.vue'),
        meta: { icon: 'lucide:scale', title: '库存余额查询' },
      },
      {
        name: 'InventoryTransactions',
        path: '/inventory/transactions',
        component: () => import('#/views/inventory/transactions/index.vue'),
        meta: { icon: 'lucide:arrow-left-right', title: '库存事务查询' },
      },
      {
        name: 'InventoryOccupancy',
        path: '/inventory/occupancy',
        component: () => import('#/views/inventory/occupancy/index.vue'),
        meta: { icon: 'lucide:percent', title: '仓位占用率' },
      },
    ],
  },

  // ========== 预发料管理 ==========
  {
    name: 'PreIssue',
    path: '/pre-issue',
    meta: {
      icon: 'lucide:repeat',
      order: 6,
      title: '预发料管理',
    },
    children: [
      {
        name: 'PreIssueList',
        path: '/pre-issue/list',
        component: () => import('#/views/pre-issue/list/index.vue'),
        meta: { icon: 'lucide:list', title: '预发料单列表' },
      },
      {
        name: 'PreIssueCreate',
        path: '/pre-issue/create',
        component: () => import('#/views/pre-issue/create/index.vue'),
        meta: { icon: 'lucide:plus-circle', title: '创建预发料单' },
      },
      {
        name: 'PreIssueWarnings',
        path: '/pre-issue/warnings',
        component: () => import('#/views/pre-issue/warnings/index.vue'),
        meta: { icon: 'lucide:alarm-clock', title: '超时预警' },
      },
    ],
  },

  // ========== 盘点管理 ==========
  {
    name: 'Stocktake',
    path: '/stocktake',
    meta: {
      icon: 'lucide:clipboard-check',
      order: 7,
      title: '盘点管理',
    },
    children: [
      {
        name: 'StocktakeList',
        path: '/stocktake/list',
        component: () => import('#/views/stocktake/list/index.vue'),
        meta: { icon: 'lucide:list', title: '盘点单列表' },
      },
      {
        name: 'StocktakeCreate',
        path: '/stocktake/create',
        component: () => import('#/views/stocktake/create/index.vue'),
        meta: { icon: 'lucide:plus-circle', title: '创建盘点单' },
      },
      {
        name: 'StocktakeProgress',
        path: '/stocktake/progress',
        component: () => import('#/views/stocktake/progress/index.vue'),
        meta: { icon: 'lucide:loader', title: '盘点进度查询' },
      },
    ],
  },

  // ========== 质量管理 ==========
  {
    name: 'Quality',
    path: '/quality',
    meta: {
      icon: 'lucide:alert-triangle',
      order: 8,
      title: '质量管理',
    },
    children: [
      // 不良品管理
      {
        name: 'QualityDefects',
        path: '/quality/defects',
        meta: { icon: 'lucide:bug', title: '不良品管理' },
        children: [
          {
            name: 'QualityDefectList',
            path: '/quality/defects/list',
            component: () =>
              import('#/views/quality/defects/list/index.vue'),
            meta: { icon: 'lucide:list', title: '不良品列表' },
          },
          {
            name: 'QualityDefectPendingDismantle',
            path: '/quality/defects/pending-dismantle',
            component: () =>
              import('#/views/quality/defects/pending-dismantle/index.vue'),
            meta: { icon: 'lucide:wrench', title: '待拆解列表' },
          },
          {
            name: 'QualityDefectPendingScrap',
            path: '/quality/defects/pending-scrap',
            component: () =>
              import('#/views/quality/defects/pending-scrap/index.vue'),
            meta: { icon: 'lucide:trash-2', title: '待报废列表' },
          },
          {
            name: 'QualityDefectPendingRework',
            path: '/quality/defects/pending-rework',
            component: () =>
              import('#/views/quality/defects/pending-rework/index.vue'),
            meta: { icon: 'lucide:refresh-cw', title: '待返工列表' },
          },
        ],
      },
      // 报废管理
      {
        name: 'QualityScraps',
        path: '/quality/scraps',
        meta: { icon: 'lucide:trash', title: '报废管理' },
        children: [
          {
            name: 'QualityScrapList',
            path: '/quality/scraps/list',
            component: () =>
              import('#/views/quality/scraps/list/index.vue'),
            meta: { icon: 'lucide:list', title: '报废单列表' },
          },
          {
            name: 'QualityScrapCreate',
            path: '/quality/scraps/create',
            component: () =>
              import('#/views/quality/scraps/create/index.vue'),
            meta: { icon: 'lucide:plus-circle', title: '创建报废单' },
          },
        ],
      },
      // 拆解回收
      {
        name: 'QualityRecoveries',
        path: '/quality/recoveries',
        meta: { icon: 'lucide:recycle', title: '拆解回收' },
        children: [
          {
            name: 'QualityRecoveryList',
            path: '/quality/recoveries/list',
            component: () =>
              import('#/views/quality/recoveries/list/index.vue'),
            meta: { icon: 'lucide:list', title: '回收单列表' },
          },
          {
            name: 'QualityRecoveryApplyTemplate',
            path: '/quality/recoveries/apply-template',
            component: () =>
              import('#/views/quality/recoveries/apply-template/index.vue'),
            meta: { icon: 'lucide:file-input', title: '应用回收模板' },
          },
        ],
      },
    ],
  },

  // ========== 退货管理 ==========
  {
    name: 'Returns',
    path: '/returns',
    meta: {
      icon: 'lucide:undo-2',
      order: 9,
      title: '退货管理',
    },
    children: [
      // 客户退货
      {
        name: 'CustomerReturns',
        path: '/returns/customer',
        meta: { icon: 'lucide:user-x', title: '客户退货' },
        children: [
          {
            name: 'CustomerReturnList',
            path: '/returns/customer/list',
            component: () =>
              import('#/views/returns/customer/list/index.vue'),
            meta: { icon: 'lucide:list', title: '退货单列表' },
          },
          {
            name: 'CustomerReturnCreate',
            path: '/returns/customer/create',
            component: () =>
              import('#/views/returns/customer/create/index.vue'),
            meta: { icon: 'lucide:plus-circle', title: '创建退货单' },
          },
        ],
      },
      // 退供管理
      {
        name: 'SupplierReturns',
        path: '/returns/supplier',
        meta: { icon: 'lucide:truck', title: '退供管理' },
        children: [
          {
            name: 'SupplierReturnList',
            path: '/returns/supplier/list',
            component: () =>
              import('#/views/returns/supplier/list/index.vue'),
            meta: { icon: 'lucide:list', title: '退供单列表' },
          },
          {
            name: 'SupplierReturnCreate',
            path: '/returns/supplier/create',
            component: () =>
              import('#/views/returns/supplier/create/index.vue'),
            meta: { icon: 'lucide:plus-circle', title: '创建退供单' },
          },
        ],
      },
    ],
  },

  // ========== 委外管理 ==========
  {
    name: 'Outsource',
    path: '/outsource',
    meta: {
      icon: 'lucide:factory',
      order: 10,
      title: '委外管理',
    },
    children: [
      {
        name: 'OutsourceList',
        path: '/outsource/list',
        component: () => import('#/views/outsource/list/index.vue'),
        meta: { icon: 'lucide:list', title: '委外单列表' },
      },
      {
        name: 'OutsourceCreate',
        path: '/outsource/create',
        component: () => import('#/views/outsource/create/index.vue'),
        meta: { icon: 'lucide:plus-circle', title: '创建委外单' },
      },
      {
        name: 'OutsourceInTransit',
        path: '/outsource/in-transit',
        component: () => import('#/views/outsource/in-transit/index.vue'),
        meta: { icon: 'lucide:navigation', title: '在途查询' },
      },
    ],
  },

  // ========== 报表中心 ==========
  {
    name: 'Reports',
    path: '/reports',
    meta: {
      icon: 'lucide:pie-chart',
      order: 11,
      title: '报表中心',
    },
    children: [
      // 库存报表
      {
        name: 'ReportsInventory',
        path: '/reports/inventory',
        meta: { icon: 'lucide:bar-chart', title: '库存报表' },
        children: [
          {
            name: 'ReportsAgingAnalysis',
            path: '/reports/inventory/aging',
            component: () =>
              import('#/views/reports/inventory/aging/index.vue'),
            meta: { icon: 'lucide:calendar-clock', title: '库龄分析' },
          },
          {
            name: 'ReportsDormantAnalysis',
            path: '/reports/inventory/dormant',
            component: () =>
              import('#/views/reports/inventory/dormant/index.vue'),
            meta: { icon: 'lucide:moon', title: '呆滞料分析' },
          },
          {
            name: 'ReportsByMaterial',
            path: '/reports/inventory/by-material',
            component: () =>
              import('#/views/reports/inventory/by-material/index.vue'),
            meta: { icon: 'lucide:box', title: '按物料统计' },
          },
          {
            name: 'ReportsByLocation',
            path: '/reports/inventory/by-location',
            component: () =>
              import('#/views/reports/inventory/by-location/index.vue'),
            meta: { icon: 'lucide:map-pin', title: '按仓位统计' },
          },
          {
            name: 'ReportsLowStock',
            path: '/reports/inventory/low-stock',
            component: () =>
              import('#/views/reports/inventory/low-stock/index.vue'),
            meta: { icon: 'lucide:alert-circle', title: '低库存预警' },
          },
        ],
      },
      // 业务报表
      {
        name: 'ReportsBusiness',
        path: '/reports/business',
        meta: { icon: 'lucide:briefcase', title: '业务报表' },
        children: [
          {
            name: 'ReportsTodayIO',
            path: '/reports/business/today-io',
            component: () =>
              import('#/views/reports/business/today-io/index.vue'),
            meta: { icon: 'lucide:calendar', title: '今日出入库' },
          },
          {
            name: 'ReportsTransactionFlow',
            path: '/reports/business/transaction-flow',
            component: () =>
              import('#/views/reports/business/transaction-flow/index.vue'),
            meta: { icon: 'lucide:activity', title: '事务流水' },
          },
          {
            name: 'ReportsExceptionSummary',
            path: '/reports/business/exceptions',
            component: () =>
              import('#/views/reports/business/exceptions/index.vue'),
            meta: { icon: 'lucide:alert-octagon', title: '异常汇总' },
          },
          {
            name: 'ReportsDefectStats',
            path: '/reports/business/defect-stats',
            component: () =>
              import('#/views/reports/business/defect-stats/index.vue'),
            meta: { icon: 'lucide:bug', title: '不良品统计' },
          },
          {
            name: 'ReportsOutsourceInTransit',
            path: '/reports/business/outsource-in-transit',
            component: () =>
              import(
                '#/views/reports/business/outsource-in-transit/index.vue'
              ),
            meta: { icon: 'lucide:navigation', title: '委外在途' },
          },
        ],
      },
      // 待办事项
      {
        name: 'ReportsTodo',
        path: '/reports/todo',
        meta: { icon: 'lucide:check-square', title: '待办事项' },
        children: [
          {
            name: 'ReportsAnomalyTodo',
            path: '/reports/todo/anomaly',
            component: () =>
              import('#/views/reports/todo/anomaly/index.vue'),
            meta: { icon: 'lucide:alert-triangle', title: '异常待办' },
          },
        ],
      },
    ],
  },
];

export default routes;