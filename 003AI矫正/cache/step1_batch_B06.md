# Step 1 缓存：B06 权益页功能 — 实体与字段提取

> 源文件：`001功能文档/B06_权益页功能（0526）.md`
> 提取时间：2026-05-27

---

## 实体1：组件模板 (Component)

来源：§3.1 组件库列表页 B6-A, §3.2 编辑弹窗 D-B6-B

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 组件ID | id | string | Y | 系统生成 | 组件唯一标识 | API |
| 组件名称 | name | string | Y | 开发预编译 | 运营不可修改 | §3.1.3 |
| 组件类型 | type | enum | Y | - | title / link | §3.1.3 |
| 缩略图 | thumbnail | string | N | - | 开发预编译时提供 | §3.1.3 |
| 启用状态 | enabled | boolean | Y | true | 运营手动切换，即时生效 | §3.1.3 |
| 跳转平台 | platform | enum | N | - | h5 / miniprogram（仅 type=link 时有效） | §3.2.3 |
| 目标活动ID | targetActivityId | string | N | - | 选中的活动ID（仅 type=link 时有效） | §3.2.3 |

### type 枚举值

| 枚举值 | 显示文案 | 说明 |
|--------|---------|------|
| title | 标题 | 不可点击，纯展示，无跳转配置 |
| link | 链接 | 可点击，需配置跳转平台+活动 |

### platform 枚举值

| 枚举值 | 显示文案 | 跳转行为 |
|--------|---------|---------|
| h5 | H5活动页 | 跳转SaaS平台H5活动页 |
| miniprogram | 第三方小程序 | 通过wx-open-launch-weapp跳转 |

---

## 实体2：权益页配置 (BenefitPageConfig)

来源：§功能A002（客户端权益页拖拽配置）

商户端权益页，由拖拽组件组成。具体字段在 B06 文档后半部分（未在 limit 250 行内完整呈现）。

| 字段中文名 | 字段英文名 | 类型 | 说明 |
|-----------|-----------|------|------|
| 权益页ID | pageId | string | 关联推广位? |
| 组件列表 | components | Array | 拖入画布的有序组件列表 |
| 布局配置 | layout | Object | 组件排列信息 |

---

## 本模块接口命名风格

**风格：camelCase**
- enabled, thumbnail, targetActivityId

与 B02(snake_case) 不一致。

---

## 🔴 发现的命名冲突

| 冲突编号 | 描述 |
|---------|------|
| CON-012 | B06 `enabled` (boolean) 命名 vs B01 accountStatus (enum) — 布尔状态命名风格不统一。B06用 enabled:boolean，B03也用 isDefault:boolean/isEnabled，B01用 accountStatus:enum |
