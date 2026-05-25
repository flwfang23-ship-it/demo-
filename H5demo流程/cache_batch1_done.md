---
batch: 1
status: done
completed_at: 2026-05-21
---

# 第1批完成缓存：设计规范 + PC布局框架 + 侧边栏导航

## 产出文件清单
- [x] `css/variables.css` — CSS变量（颜色/字体/间距/圆角/阴影）
- [x] `css/common.css` — 全局重置 + 按钮/输入框/表格/卡片/表单/开关/分页/标签等公共组件
- [x] `css/layout.css` — 侧边栏240px + 顶栏56px + 内容区布局 + 子菜单 + 响应式
- [x] `js/nav.js` — 菜单渲染/展开收起/页面切换/面包屑更新（含完整菜单配置）
- [x] `js/mock-data.js` — 全局Mock数据（商户/小程序/推广位/权益页/活动/日报/操作日志）
- [x] `index.html` — 主框架：侧边栏+顶栏+内容容器+Toast

## 关键设计决策
- **侧边栏配色**：深色主题 `#001529`，当前激活项 `#1677ff` 背景
- **布局方式**：Flexbox 全高布局，侧边栏固定宽度 + 右侧弹性
- **菜单结构**：采用手风琴式子菜单，默认展开当前页面所属菜单组
- **页面加载**：Fetch API 加载 `pages/xxx.html` 片段，失败时降级显示占位提示
- **Mock数据**：全部集中在 `mock-data.js`，后续批次直接引用 `window.MockData`
- **Toast**：全局 `showToast(msg, type)` 函数

## 接口约定
- 页面切换：调用 `window.AppNav.navigateTo('page-name')`
- Toast提示：调用 `window.showToast('消息内容', 'success'|'error'|'info')`
- 页面加载回调：定义 `window.onPageLoaded = function(page) {}` 在各模块JS中
- Mock数据访问：`window.MockData.xxx`
- CSS变量：所有颜色/间距/字体统一使用 `var(--xxx)` 引用

## MockData 数据覆盖清单（2026-05-21 补充完毕）
| 数据字段 | 覆盖批次 | 说明 |
|----------|----------|------|
| `currentMerchant` | 第4批 C06 | 企业信息（含 contact/phone 等） |
| `dashboardStats` | 第2批 C01 | 统计概览数字 |
| `latestReport` | 第2批 C01 | 昨日收入+订单+环比（`incomeChange`/`ordersChange`） |
| `financeData` | 第2批 C01 | 账户余额/提现审核中/已提现/绑定状态 |
| `miniPrograms` | 第2批 C02 | 8条，覆盖多种部署状态和订阅状态 |
| `deployTimeline` | 第2批 C02 | 部署进度时间线 |
| `promotions` | 第3批 C03 | 5条，含默认+自定义 |
| `benefitPages` | 第3批 C04 | 4个Tab页面 |
| `availableActivities` | 第2批 C01 + 第3批 C04 | 15条，含 `supplier`/`supplierLabel`/`endDate` 字段 |
| `pageSlotActivities` | 第3批 C04 | 4页面×6坑位配置 |
| `reports` | 第4批 C05 | 15条日报+推广位明细 |
| `operationLogs` | 第4批 C06 | 20条操作日志 |

**第2/3/4批并行时，mock-data.js 无需再修改，只读引用即可。**

## 已知问题 / 留给后续批次处理
- [ ] 侧边栏折叠后菜单文字隐藏（目前仅CSS控制，子菜单交互待完善）
- [ ] 页面无实际内容（待第2-4批创建 pages/*.html）
- [ ] 登录态模拟暂未实现（第5批考虑简单模拟）
