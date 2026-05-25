---
batch: 3
status: done
completed_at: 2026-05-21
---

# 第3批完成缓存：C03推广位管理 + C04权益页配置（核心）

## 产出文件清单
- [x] `js/promotion.js` — C03 推广位管理：列表渲染/分页/新增/编辑/设为默认/删除/搜索
- [x] `pages/promotion-list.html` — C03 推广位列表页 HTML 片段（含新增/编辑弹窗）
- [x] `js/benefit-config.js` — C04 权益页配置：Tab切换/状态栏/6坑位网格/D01活动选择器/D02推广位管理弹窗/复制参数
- [x] `pages/benefit-config.html` — C04 权益页配置 HTML 片段（含 D01/D02 弹窗）
- [x] `index.html` — 新增 CSS（通用弹窗/C03/C04/D01/D02 全部样式）+ JS 引用 + onPageLoaded 钩子

## 模块实现明细

### C03 推广位管理
| 功能 | 实现方式 |
|------|----------|
| 列表渲染 | `renderPromoList()` — 表格 + 分页 20条/页，默认推广位优先排序 |
| 搜索 | `#promoSearchInput` oninput → 前端过滤名称/ID |
| 新增推广位 | `openPromoForm('create')` → 弹窗输入名称（≤20字）→ save |
| 编辑推广位 | `openPromoForm('edit', id)` → 弹窗修改名称 |
| 设为默认 | `setDefaultPromo(id)` → 即时切换，原默认取消 |
| 删除推广位 | `confirmDeletePromo(id)` → 二次确认弹窗 → 默认推广位拒绝删除 |
| 分页 | 前端分页，`renderPagination()` 复用 `.page-btn` 样式 |

### C04 权益页配置（核心模块）
| 功能 | 实现方式 |
|------|----------|
| Tab栏 | `renderBenefitTabs()` — 默认主页+自定义页平铺，已关闭Tab置灰显示"(已关闭)"，末尾 [⚙️ 推广位管理] 入口 |
| Tab切换 | `switchBenefitTab(slotId)` → 刷新状态栏+6坑位网格 |
| 状态栏 | `renderStatusBar()` — 启用状态徽标 + 推广参数 + [📋 复制推广参数] 按钮 |
| 6坑位网格 | `renderSlotGrid()` — 3×2 排列，活动卡片显示渐变色主图/名称/跳转类型标签；空坑位显示 "+" 占位；hover 显示蓝色蒙层"点击更换" |
| D01 活动选择器 | `openActivityPicker(index)` → 搜索框（300ms防抖）+ 活动列表（单选，已选高亮"当前使用"，显示供应商/跳转类型/截止日期标签）→ 点击目标活动 → 即时替换坑位 + 弹窗关闭 + Toast |
| D02 推广位管理 | `openSlotManager()` → Checkbox列表（勾选启用/取消关闭），默认主页disabled锁定 → [+新建推广位] → prompt输入名称 → 拷贝默认主页6个活动 → Tab栏新增并自动选中 |
| 复制参数 | `copyToClipboard()` → 写入剪贴板 + Toast提示 |

## 关键设计决策
- **页面加载模式**：HTML 片段通过 innerHTML 注入，JS 逻辑独立文件在 index.html 预加载，通过 `window.onPageLoaded` 回调触发 `initXxx()` 初始化
- **弹窗实现**：D01/D02 弹窗 HTML 放在页面片段内，随页面加载/卸载自动创建/销毁；C03 新增/编辑弹窗同策略
- **活动选择器搜索**：300ms 防抖，匹配活动名称/分类/供应商名称
- **新建页面继承**：拷贝默认主页（slot_default）的 6 个活动作为初始内容
- **Mock数据只读引用**：所有数据操作直接修改 `window.MockData` 对象，无需 API 调用
- **颜色渐变**：6种渐变色方案按活动ID取模分配，模拟活动主图

## 接口约定
- 推广位管理入口：`window.initPromotionList()` — 由 index.html onPageLoaded 调用
- 权益页配置入口：`window.initBenefitConfig()` — 由 index.html onPageLoaded 调用
- 页面导航：`window.AppNav.navigateTo('promotion-list')` / `navigateTo('benefit-config')`
- Toast 提示：`window.showToast(msg, 'success'|'error'|'info')`
- 确认弹窗：promotion.js 内置 `showConfirm(title, msg, onConfirm)` 函数
- 剪贴板：benefit-config.js 内置 `copyToClipboard(text)` 兼容新旧 API

## 已知问题 / 留给后续批次处理
- [ ] 推广位管理新建弹窗使用 `prompt()` 简易实现，后续可替换为正式弹窗
- [ ] D02 新建推广位后，即时的 Tab 数据源同步到 promotion-list 页面需手动完成（当前仅修改 benefitPages）
- [ ] 活动选择器未实现分类筛选 Tab（规格V1.1中未明确要求）
- [ ] 6坑位卡片的活动主图为渐变色占位，未使用真实图片
- [ ] 页面刷新后 MockData 修改丢失（纯前端演示特性）
