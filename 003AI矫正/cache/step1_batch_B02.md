# Step 1 缓存：B02 活动管理-联盟 — 实体与字段提取

> 源文件：`001功能文档/B02_活动管理-联盟（0526）.md`
> 提取时间：2026-05-27

---

## 实体1：联盟活动 (AllianceActivity)

来源：§3.1 活动列表页 B02-A, §3.2 活动表单 B02-A-a, §5.2 接口规格

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 活动类型 | activity_type | enum | Y | alliance | alliance / third_party | API-ACT-01 |
| 活动ID | activity_id | number | Y | 系统生成 | 全局唯一 | API-ACT-01/02 |
| 活动名称 | activity_name | string | Y | - | 最多30字，活动主标题 | §3.2.3, API-ACT-02 |
| 活动副标题 | activity_subtitle | string | N | null | 最多50字 | §3.2.3, API-ACT-02 |
| 供应商 | supplier | enum | Y | - | meituan / eleme | §3.2.3, API-ACT-02 |
| 第三方活动ID | third_party_activity_id | string | Y | - | 取链核心字段，全局唯一，最多100字 | §3.2.3, API-ACT-02 |
| 佣金 | commission | string | N | null | 最多20字，仅展示 | §3.2.3, API-ACT-02 |
| 排序 | sort_order | number | Y | - | 正整数，数字越大越靠前 | §3.2.3, API-ACT-02 |
| 会场推广规则 | promotion_rules | string | N | null | 最多200字，仅展示 | §3.2.3, API-ACT-02 |
| 有效期-开始 | valid_from | string | N | null | YYYY-MM-DD，仅展示 | §3.2.3, API-ACT-02 |
| 有效期-结束 | valid_to | string | N | null | YYYY-MM-DD，若填须≥开始 | §3.2.3, API-ACT-02 |
| 小程序跳转路径 | miniProgramPath | string | N | null | 联盟活动专属，B06组件库使用 | §3.2.3, API-ACT-01 |
| 状态 | status | enum | Y | offline | online / offline | §3.2.3, API-ACT-02 |
| 自动更新口令 | autoUpdateToken | boolean | N | false | 是否纳入口令自动更新清单 | §3.2.3（注：字段名未在API中确认） |
| 创建时间 | created_at | datetime | Y | 系统生成 | YYYY-MM-DD HH:mm | API-ACT-01/02 |
| 更新时间 | updated_at | datetime | Y | 系统生成 | YYYY-MM-DD HH:mm | API-ACT-01/02 |

### supplier 枚举值

| 枚举值 | 显示文案 | 说明 |
|--------|---------|------|
| meituan | 美团 | 调用美团取链接口 |
| eleme | 饿了么 | 调用饿了么取链接口 |

### status 枚举值

| 枚举值 | 显示文案 | 视觉 | 说明 |
|--------|---------|------|------|
| online | 已上架 | 🟢 | 商户端可见可取链 |
| offline | 已下架 | ⚪ | 商户端不可见 |

---

## 本模块接口中的字段命名风格

**风格：snake_case**
- activity_id, activity_name, activity_subtitle, third_party_activity_id
- sort_order, promotion_rules, valid_from, valid_to
- miniProgramPath（**注意：此字段是 camelCase，与同接口其他字段风格不一致！**）
- created_at, updated_at

---

## 🔴 发现的命名冲突（跨文档）

| 冲突编号 | 字段 | B01 命名 | B02 命名 | 建议 |
|---------|------|---------|---------|------|
| CON-001 | 命名风格 | camelCase | snake_case | 统一为 camelCase |
| CON-001a | (示例) 创建时间 | createdAt | created_at | → createdAt |
| CON-001b | (示例) 更新时间 | updatedAt | updated_at | → updatedAt |
| CON-001c | (示例) 活动ID | activityId | activity_id | → activityId |
| CON-002 | miniProgramPath 命名 | - | 在 snake_case 接口中用 camelCase | 统一后自然解决 |
