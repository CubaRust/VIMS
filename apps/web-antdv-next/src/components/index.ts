/**
 * 通用组件导出
 */

// 从 antdv-next 导入基础组件
import { Button, Form, FormItem, Input, Select, Space, Switch, Tree, message, Modal, Tag, Checkbox } from 'antdv-next';

// 从 @vben/plugins 导入 VxeTable 相关
import { VbenVxeGrid, useVbenVxeGrid } from '@vben/plugins/vxe-table';

// 导入 VbenModal
import { VbenModal } from '@vben/common-ui';

// 重新导出组件
export { Button, Form, FormItem, Input, Select, Space, Switch, Tree, message, Modal, Tag, Checkbox };
export { VbenVxeGrid, useVbenVxeGrid };
export { VbenModal };

// 导出 Input 的子组件
export { InputPassword } from 'antdv-next';

// 兼容性导出别名
export { VbenVxeGrid as VbenVxeTable };

