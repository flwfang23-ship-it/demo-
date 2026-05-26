# H5 Demo 快速代码索引

> **用途**: 改代码前，对着模块名直接定位到文件和函数。一行不废话。

---

## 1. 文件结构一览

```
h5-demo/
├── index.html              ← 主壳（布局 + 侧边栏 + 顶栏 + 所有页面级JS + 全局样式）
├── css/
│   ├── variables.css       ← 颜色/字号/间距/圆角/阴影的设计Token
│   ├── common.css          ← 全局重置 + 按钮/表格/表单/标签等公共组件
│   ├── layout.css          ← 侧边栏(240px) + 顶栏(56px) + 内容区
│   ├── animations.css      ← 全局动画keyframes
│   ├── benefit-config.css  ← C04 权益页编辑器全部样式（手机模拟器/卡片/弹窗/灯箱）
│   ├── account.css         ← C06 账号设置页样式
│   └── reports.css         ← C05 日报页样式
├── js/
│   ├── nav.js              ← 侧边栏菜单配置 + 页面切换加载
│   ├── mock-data.js        ← 全部静态Mock数据
│   ├── promotion.js        ← C03 推广位管理交互
│   └── benefit-config.js   ← C04 权益页配置（可视化编辑器核心）
├── pages/
│   ├── dashboard.html      ← C01 首页（推广工作台）
│   ├── onboarding.html     ← 新人引导流程页
│   ├── activity-list.html  ← 活动清单（普通活动 + 第三方活动Tab + 新增TPA弹窗）
│   ├── thirdparty-detail.html ← 第三方活动详情页（推广路径配置）
│   ├── promotion-list.html ← C03 推广位列表（分组Tab + 搜索 + CRUD）
│   ├── promotion-group-list.html ← 推广分组管理（独立页签，CRUD）
│   ├── benefit-config.html ← C04 权益页配置（手机模拟器 + 右侧面板）
│   ├── miniprogram-list.html       ← C02 小程序列表（有数据态）
│   ├── miniprogram-list-empty.html ← C02 小程序列表（空状态）
│   ├── reports-list.html   ← C05 日报列表 + 详情抽屉
│   ├── account.html        ← C06 账号设置（企业信息/密码/日志三Tab）
│   └── login.html          ← 登录页（G01 功能规格参考页）
├── login.html              ← G01 独立登录页（扫码登录+账号密码+注册+密码重置）
└── images/
    ├── login.jpeg
    ├── 收入流转图.jpg
    └── flow/
        ├── flow-fast.jpg
        ├── flow-trial.jpg
        └── flow-contact.jpg
```

---

## 2. 改哪个模块 → 动哪个文件

### C01 首页推广工作台

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML结构 | [pages/dashboard.html](pages/dashboard.html) |
| 新人引导横幅 | `index.html` → `renderOnboardingBanner()` |
| 昨日收入数据渲染 | `index.html` → `renderIncomeModule()` |
| 资金余额/提现逻辑 | `index.html` → `renderBalanceModule()` + `openWithdrawModal()` |
| 供应商Tab + 活动卡片 | `index.html` → `renderPromotionModule()` |
| 推广链接抽屉（取链弹窗） | `index.html` → `openPromoteDrawer()` / `generateDrawerLink()` |
| 所有C01相关样式 | `index.html` → `<style>` 块（`.dashboard-top` / `.activity-card` / `.drawer-*` 等） |

### 新人引导页

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML结构 | [pages/onboarding.html](pages/onboarding.html) |
| 引导步骤数据 | [js/mock-data.js](js/mock-data.js) → `onboardingSteps[]` |
| 首页横幅逻辑 | `index.html` → `renderOnboardingBanner()` |
| 样式 | `index.html` → `<style>` 中 `.onboarding-*` 类 |

### C02 小程序管理

| 改什么 | 去哪儿改 |
|--------|----------|
| 列表页HTML | [pages/miniprogram-list.html](pages/miniprogram-list.html) |
| 空状态页HTML | [pages/miniprogram-list-empty.html](pages/miniprogram-list-empty.html) |
| 列表渲染/分页/搜索/筛选 | `index.html` → `mpState` 对象 + `initMiniprogramList()` |
| 注册/编辑弹窗 | `index.html` → `openMpFormModal()` |
| 详情弹窗 | `index.html` → `openMpDetailModal()` |
| 订阅操作记录弹窗 | `index.html` → `openMpSubscribeLogModal()` |
| 订阅开关 | `index.html` → `.mp-sub-toggle` change事件 |
| 批量操作 | `index.html` → `btnBatchSubscribe` / `btnBatchUnsubscribe` |

### C03 推广位管理

| 改什么 | 去哪儿改 |
|--------|----------|
| 列表页HTML | [pages/promotion-list.html](pages/promotion-list.html) |
| 列表渲染/搜索/分页 | [js/promotion.js](js/promotion.js) → `renderPromoList()` / `getFilteredList()` |
| 分组Tab栏渲染/切换 | [js/promotion.js](js/promotion.js) → `renderGroupTabs()` / `switchGroupTab()` |
| 新增/编辑推广位弹窗 | [js/promotion.js](js/promotion.js) → `openPromoForm()` / `savePromoForm()` |
| 新增/删除分组 | [js/promotion.js](js/promotion.js) → `openAddGroupModal()` / `createGroupFromModal()` / `confirmDeleteGroup()` |
| 弹窗内嵌新建分组 | [js/promotion.js](js/promotion.js) → `confirmNewGroupInline()` / `cancelNewGroupInline()` |
| 删除确认 | [js/promotion.js](js/promotion.js) → `confirmDeletePromo()` / `executeDeletePromo()` |
| 确认弹窗组件 | [js/promotion.js](js/promotion.js) → `showConfirm()` |
| 样式 | `index.html` → `<style>` 中 `promo-*` / `promo-group-*` 类 |
| 数据结构 | [js/mock-data.js](js/mock-data.js) → `promotionGroups[]` + `getAllPromotions()` |

### 推广分组管理（独立页签）

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML（表格 + 弹窗 + 内嵌脚本） | [pages/promotion-group-list.html](pages/promotion-group-list.html) |
| 入口初始化 | `index.html` → `onPageLoaded` → `window.__initPromotionGroupList()` |
| 菜单项（g02-d） | [js/nav.js](js/nav.js) → `menuConfig` g02.children |
| 搜索/过滤/分页/渲染 | 页面内嵌脚本 → `renderTable()` / `getFilteredGroups()` |
| 新增/编辑弹窗 | 页面内嵌脚本 → `openForm()` / `saveForm()` |
| 删除确认 + 迁移推广位 | 页面内嵌脚本 → `confirmDelete()` / `executeDelete()` |
| 样式 | `index.html` → `<style>` 中 `.promo-group-page-*` / `.pg-*` 类 |
| 数据结构 | [js/mock-data.js](js/mock-data.js) → `promotionGroups[]`（复用，与C03共享） |

### C04 权益页配置（核心模块）

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML（模拟器+面板+所有弹窗） | [pages/benefit-config.html](pages/benefit-config.html) |
| **所有样式** | [css/benefit-config.css](css/benefit-config.css)（独立CSS文件） |
| 入口初始化 | [js/benefit-config.js](js/benefit-config.js) → `initBenefitConfig()` |
| 手机模拟器导航菜单渲染 | [js/benefit-config.js](js/benefit-config.js) → `renderNavMenu()` |
| 分类切换 | [js/benefit-config.js](js/benefit-config.js) → `switchCategory()` / `saveCurrentCanvas()` |
| 分类增删改 | [js/benefit-config.js](js/benefit-config.js) → `addNewCategory()` / `openCateModal()` / `saveCateConfig()` / `deleteCategory()` |
| 画布HTML生成（模块标题+卡片） | [js/benefit-config.js](js/benefit-config.js) → `generateModuleHtml()` / `generateCardHtml()` |
| 初始布局渲染 | [js/benefit-config.js](js/benefit-config.js) → `renderInitialLayout()` |
| 模块标题编辑弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openModuleTitleModal()` / `saveModuleTitle()` |
| 卡片样式编辑弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openStyleModal()` / `saveStyle()` |
| 卡片活动选择弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openActivityModal()` / `saveActivity()` |
| 右侧面板 - 推广位列表 | [js/benefit-config.js](js/benefit-config.js) → `initRightPanel()` / `renderPromoTable()` |
| 推广位选择器弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openPromoPicker()` / `confirmPromoPicker()` |
| 内嵌新建推广位 | [js/benefit-config.js](js/benefit-config.js) → `inlineCreatePromo()` |
| 缺失活动编辑弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openMissingActModal()` / `saveMissingActPaths()` |
| 关闭确认弹窗 | [js/benefit-config.js](js/benefit-config.js) → `openCloseConfirm()` / `confirmClosePromo()` |
| 新增第三方活动（活动弹窗内） | [js/benefit-config.js](js/benefit-config.js) → `toggleNewTPForm()` / `saveNewThirdParty()` |
| 保存/脏状态 | [js/benefit-config.js](js/benefit-config.js) → `saveAllConfig()` / `markDirty()` / `updateSaveButton()` |
| 收入流转图灯箱 | [js/benefit-config.js](js/benefit-config.js) → `openChartLightbox()` / `closeChartLightbox()` |
| 弹窗基础方法 | [js/benefit-config.js](js/benefit-config.js) → `openModalBase()` / `closeBenefitModal()` |
| 导航菜单缓存数据 | [js/benefit-config.js](js/benefit-config.js) → `slotCategoryCache` / `slotPaths` |
| Mock数据 - 推广位配置 | [js/mock-data.js](js/mock-data.js) → `promotionSlots[]` / `slotActivities{}` / `slotNavMenus{}` |

> **注意**：推广位级别的路径字段（小程序推广路径/H5推广路径/缺失H5）已迁移至 C03 推广位管理列表。C04 仅保留 slot 级别的路径展示（`slotPathsBox`）。

### C05 日报

| 改什么 | 去哪儿改 |
|--------|----------|
| 列表页HTML + 详情抽屉 | [pages/reports-list.html](pages/reports-list.html) |
| 列表/筛选/分页/详情 | 逻辑内嵌在 `reports-list.html` 的 `<script>` 中 |
| 样式 | [css/reports.css](css/reports.css) |

### C06 账号设置

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML（三Tab） | [pages/account.html](pages/account.html) |
| 企业信息/密码/日志Tab | 逻辑内嵌在 `account.html` 的 `<script>` 中 |
| 样式 | [css/account.css](css/account.css) |

### 活动清单

| 改什么 | 去哪儿改 |
|--------|----------|
| 页面HTML + 弹窗 | [pages/activity-list.html](pages/activity-list.html) |
| 普通活动+第三方活动Tab | 逻辑内嵌 `<script>` → `window.__initActivityList(tab)` |
| 样式 | `index.html` → `<style>` 中 `.act-list-*` / `.tpa-list-*` 类 |

### G01 用户登录注册

| 改什么 | 去哪儿改 |
|--------|----------|
| 独立登录页（完整功能） | [login.html](login.html) — 扫码登录+账号密码+注册+密码重置 |
| 登录页规格参考（壳内） | [pages/login.html](pages/login.html) — 用户路径图+接口清单+业务规则 |
| 菜单入口 | [js/nav.js](js/nav.js) → g06 菜单组 |
| Demo会话管理 | [login.html](login.html) → localStorage `__demoSession` / `__demoUser` |
| 功能规格文档 | [001功能文档/B01_用户登录注册（0526）.md](../001功能文档/B01_用户登录注册（0526）.md) |

> **注意**：独立登录页 `login.html` 不经过 index.html 壳，直接浏览器打开。扫码登录需公众号appid和密钥（待补充）。
>
> **Demo测试账号**：`13800008888` / `Abc12345` 或 `13912345678` / `Test1234`，也可通过注册表单创建新账号。验证码统一使用 `123456`。

### 全局（菜单/导航/Toast/Mock数据）

| 改什么 | 去哪儿改 |
|--------|----------|
| 侧边栏菜单结构 | [js/nav.js](js/nav.js) → `menuConfig` 数组 |
| 页面加载/切换 | [js/nav.js](js/nav.js) → `loadPage()` / `navigateTo()` |
| 页面别名映射（account-*, activity-list-other） | [js/nav.js](js/nav.js) → `pageAliases` |
| Mock数据 | [js/mock-data.js](js/mock-data.js) → `window.MockData` |
| Toast提示 | `index.html` → `window.showToast(message, type)` |
| 通用弹窗确认 | `index.html` → `showConfirm(title, msg, onConfirm)` 或 promotion.js 内 `showConfirm()` |
| 设计Token | [css/variables.css](css/variables.css) |
| 公共组件样式 | [css/common.css](css/common.css) |

---

## 3. 关键函数速查

### index.html 中的全局函数

| 函数 | 作用 | 所属模块 |
|------|------|----------|
| `window.showToast(msg, type)` | 弹出Toast提示 | 全局 |
| `showConfirm(title, msg, onConfirm)` | 确认弹窗（index内） | 全局 |
| `closeModalAnimated(overlay)` | 带动画关闭弹窗 | 全局 |
| `openModalAnimated(overlay)` | 带动画打开弹窗 | 全局 |
| `animateNumber(el, val, fmt, duration)` | 数字滚动动画 | 全局 |
| `fmtMoney(val)` | 格式化金额 ¥xxx.xx | 全局 |
| `fmtInt(val)` | 格式化整数 | 全局 |
| `initDashboard()` | 初始化首页 | C01 |
| `renderOnboardingBanner()` | 渲染新人引导横幅 | C01 |
| `renderIncomeModule(data)` | 渲染昨日收入 | C01 |
| `renderBalanceModule(data)` | 渲染余额卡片 | C01 |
| `renderPromotionModule(acts)` | 渲染取链模块（Tab+卡片） | C01 |
| `openWithdrawModal(data)` | 提现弹窗 | C01 |
| `openPromoteDrawer(activity)` | 打开推广链接抽屉 | C01 |
| `closePromoteDrawer()` | 关闭推广链接抽屉 | C01 |
| `generateDrawerLink()` | 生成推广链接 | C01 |
| `bindDrawerEvents()` | 绑定抽屉事件（全局复用） | C01 |
| `initMiniprogramList()` | 初始化小程序列表 | C02 |
| `openMpFormModal(mpId)` | 注册/编辑弹窗 | C02 |
| `openMpDetailModal(mpId)` | 小程序详情弹窗 | C02 |
| `openMpSubscribeLogModal()` | 订阅操作记录弹窗 | C02 |
| `window.onPageLoaded(page)` | 页面加载回调（路由分发） | 全局 |

### nav.js 中的导出

| 函数/对象 | 用途 |
|-----------|------|
| `window.AppNav.navigateTo(page)` | 跳转到指定页面 |
| `window.AppNav.getCurrentPage()` | 获取当前页面名 |
| `window.AppNav.menuConfig` | 菜单配置数组 |

### promotion.js (C03)

| 函数 | 用途 |
|------|------|
| `initPromotionList()` | 入口 |
| `renderGroupTabs()` | 渲染分组Tab栏 |
| `switchGroupTab(id)` | 切换分组Tab |
| `renderPromoList()` | 渲染推广位列表 |
| `getFilteredList()` | 获取过滤后的推广位列表 |
| `openPromoForm(mode, id)` | 打开新增/编辑弹窗 |
| `savePromoForm()` | 保存推广位 |
| `openAddGroupModal()` | 打开新增分组弹窗 |
| `createGroupFromModal()` | 创建分组 |
| `confirmDeleteGroup(id)` | 删除分组确认 |
| `confirmNewGroupInline()` | 弹窗内嵌新建分组确认 |
| `cancelNewGroupInline()` | 弹窗内嵌新建分组取消 |
| `confirmDeletePromo(id)` | 删除推广位确认 |
| `executeDeletePromo(id)` | 执行删除推广位 |
| `getMissingActivities(promoId)` | 获取推广位下缺失路径的第三方活动列表 |
| `openPromoPathModal(promoId)` | 打开推广位路径编辑弹窗 |
| `closePromoPathModal()` | 关闭路径编辑弹窗 |
| `togglePathRowEdit(actId)` | 切换第三方活动路径行编辑/保存 |
| `savePathRow(actId, val)` | 保存单行路径到 thirdPartyActivities |
| `showConfirm(title, msg, fn)` | 通用确认弹窗（promotion.js内部） |

### benefit-config.js (C04)

| 函数 | 用途 |
|------|------|
| `initBenefitConfig()` | 入口，初始化全部状态和缓存 |
| `renderNavMenu()` | 渲染手机模拟器左侧导航菜单 |
| `switchCategory(id)` | 切换导航分类，保存当前画布并加载目标分类 |
| `addNewCategory()` | 添加新导航分类 |
| `openCateModal(item)` | 打开分类编辑弹窗（图标+名称） |
| `saveCateConfig()` | 保存分类编辑 |
| `deleteCategory(id)` | 删除分类（含确认） |
| `generateModuleHtml(title, logo)` | 生成模块标题栏HTML |
| `generateCardHtml(title, sub, platform, activity, color, isMini)` | 生成活动卡片HTML |
| `renderInitialLayout()` | 渲染默认初始布局（slot_default） |
| `openModuleTitleModal(id)` | 打开模块标题编辑弹窗 |
| `saveModuleTitle()` | 保存模块标题 |
| `openStyleModal(cardId)` | 打开卡片样式编辑弹窗 |
| `saveStyle()` | 保存卡片样式 |
| `openActivityModal(cardId)` | 打开活动选择弹窗 |
| `saveActivity()` | 保存活动选择 |
| `initRightPanel()` | 初始化右侧推广位面板 |
| `renderPromoTable()` | 渲染推广位表格 |
| `openPromoPicker()` | 打开推广位选择器弹窗 |
| `confirmPromoPicker()` | 确认推广位选择 |
| `inlineCreatePromo()` | 选择器内嵌新建推广位 |
| `openMissingActModal(promoId)` | 打开缺失活动编辑弹窗 |
| `saveMissingActPaths()` | 保存缺失活动路径 |
| `openCloseConfirm(promoId)` | 打开关闭确认弹窗 |
| `confirmClosePromo()` | 确认从列表移除 |
| `saveAllConfig()` | 保存全部配置到localStorage |
| `markDirty()` | 标记脏状态 |
| `updateSaveButton()` | 更新保存按钮状态 |
| `openChartLightbox()` | 打开收入流转图灯箱 |
| `closeChartLightbox()` | 关闭灯箱 |
| `openModalBase(overlayId, modalId)` | 打开弹窗基础方法 |
| `closeBenefitModal(overlayId)` | 关闭弹窗基础方法 |

---

## 4. 页面加载机制

```
用户点击侧边栏菜单
    → nav.js navigateTo(page)
    → 页面别名解析（pageAliases: account-* → account, activity-list-other → activity-list）
    → loadPage(page) 通过XHR加载 pages/{page}.html
    → 分离 <script> 标签，先注入HTML再执行脚本
    → 包裹 .page-transition-wrapper 实现淡入动画
    → 调用 window.onPageLoaded(page) 分发到各模块初始化函数
```

**页面别名映射**（nav.js `pageAliases`）：
- `account-info` → `account.html` (tab=info)
- `account-pwd` → `account.html` (tab=pwd)
- `account-log` → `account.html` (tab=log)

**注意**: `index.html` 中是纯页面级逻辑。`promotion.js` 和 `benefit-config.js` 是独立JS文件（IIFE模式），其他模块逻辑内嵌在页面 `<script>` 标签中。

---

## 5. 常用CSS类名

| 用途 | 类名 |
|------|------|
| 主按钮 | `.btn.btn-primary` |
| 次要按钮 | `.btn.btn-default` |
| 危险按钮 | `.btn.btn-danger` |
| 链接按钮 | `.btn.btn-link` |
| 开关 | `.switch > input + .switch-slider` |
| 标签 | `.tag.tag-success` / `.tag-warning` / `.tag-default` |
| 表格 | `table` 直接用，参考 common.css |
| 分页 | `.pagination` + `.page-btn` |
| 弹窗蒙层 | `.modal-overlay` |
| 弹窗内容 | `.modal-box` + `.modal-header` + `.modal-body` + `.modal-footer` |
| 输入框 | `.form-group > label + input` |
| 空状态 | `.empty-state` + `.empty-state-icon` + `.empty-state-text` |
| 加载中 | `.loading-spinner` |
| C04 模拟器 | `.mobile-simulator-enhanced` + `.sim-body` + `.sim-content` |
| C04 卡片 | `.card` + `.card-preview` + `.card-config-info` |
| C04 弹窗 | `.benefit-modal` + `.modal-header` + `.modal-body` |
| 提现弹窗 | `.withdraw-modal-overlay` + `.withdraw-modal` |
| 抽屉 | `.drawer-overlay` + `.drawer` + `.drawer-header` + `.drawer-body` |

---

## 6. Mock数据结构

所有数据在 `window.MockData`，直接读：

```js
// === 基础数据 ===
window.MockData.currentMerchant       // 当前商户
window.MockData.dashboardStats        // 统计概览
window.MockData.onboardingSteps       // 新人引导步骤（done/current/todo）

// === C01 首页 ===
window.MockData.latestReport          // 最新日报（收入+环比）
window.MockData.financeData           // 财务数据（余额+提现+绑定状态）

// === C02 小程序 ===
window.MockData.miniPrograms          // 小程序列表（含deployStatus/subscribeOn）
window.MockData.operationLogs         // 操作日志（含订阅开关记录）
window.MockData.deployTimeline        // 部署进度时间线

// === C03 推广位 ===
window.MockData.promotionGroups       // 推广位分组列表（含嵌套 promotions[]）
window.MockData.getAllPromotions()    // 扁平化推广位列表（含 groupId/groupName）

// === C04 权益页 ===
window.MockData.promotionSlots        // 权益页推广位配置（原promotionPages，有向后兼容别名 benefitPages）
window.MockData.slotActivities        // 各slot的坑位活动配置（向后兼容别名 pageSlotActivities）
window.MockData.slotNavMenus          // 各slot的手机模拟器导航菜单数据

// === 活动 ===
window.MockData.availableActivities   // 可用活动池（12条，含jumpType/platform/venueId）
window.MockData.thirdPartyActivities  // 第三方活动（花小猪/滴滴/电影票 + promoPaths）

// === C05 日报 ===
window.MockData.reports               // 日报列表（含details按推广位明细）

// === 其他 ===
window.MockData.quickActions          // 快捷入口
```
