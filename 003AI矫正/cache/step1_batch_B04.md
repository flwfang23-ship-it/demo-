# Step 1 缓存：B04 活动管理-第三方 — 实体与字段提取

> 源文件：`001功能文档/B04_活动管理-第三方（0526）.md`
> 提取时间：2026-05-27

---

## 实体1：第三方活动分组 (ThirdPartyGroup)

来源：§3.1 分组列表页 B04, §3.2 分组弹窗

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 分组ID | id | string | Y | 系统生成 | TG_001(京东)/TG_002(打车)/TG_003(其他) | §3.1.3, API |
| 分组名称 | name | string | Y | - | 1-20字符，不可重名 | §3.1.3, §3.2.2 |
| 排序 | sortOrder | number | Y | 当前最大值+1 | 数字越小越靠前（客户端Tab从左到右） | §3.1.3, §3.2.2 |
| 状态 | status | enum | Y | enabled | enabled / disabled | §3.1.3, §3.2.2 |
| 预设活动数 | _count | number | R | 0 | 该分组下isPreset=true的活动数量（只读） | §3.1.3 |

### status 枚举值

| 枚举值 | 显示文案 | 视觉 | 说明 |
|--------|---------|------|------|
| enabled | 启用 | 🟢 | 客户端可见 |
| disabled | 禁用 | ⚫ | 客户端不可见，行置灰 |

---

## 实体2：第三方活动 (ThirdPartyActivity)

来源：§3.3 预设活动列表, §3.4 预设活动弹窗, §4.1 客户端活动清单, §4.3 自定义活动弹窗, §5.2 API

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 活动ID | id | string | Y | 系统生成 | TPA_XXX 格式 | API-M04-001 |
| 排序 | sortOrder | number | Y | - | 数字越大越靠前（降序） | §3.3.3, §3.4.2 |
| 所属分组ID | groupId | string | Y | - | 关联第三方活动分组 | §3.4.2, API |
| 活动名称 | name | string | Y | - | 1-50字符，同分组下不可重名 | §3.3.3, §3.4.2, §4.3.2 |
| 微信AppID | appId | string | Y | - | wx开头+字母数字 | §3.3.3, §3.4.2, §4.3.2 |
| 是否预设活动 | isPreset | boolean | Y | false | true=全商户可见, false=商户自定义 | §4.1.3, API |
| 默认推广位路径 | defaultPath | string | N | "" | 全局fallback，商户可覆盖 | §3.4.2, API |
| 是否有路径配置 | hasPathConfig | boolean | R | false | 后端计算：defaultPath非空或任一promoPaths非空 | API-M04-001 |
| 推广位路径映射 | promoPaths | Object | N | {} | key=推广位ID, value=小程序路径, 空值=沿用defaultPath | §5.2 API |
| 引用商户数 | _merchantCount | number | R | 0 | 只读，多少商户配置了此活动 | §3.3.3 |

### 系统预置分组

| groupId | name | 说明 |
|---------|------|------|
| TG_001 | 京东 | 预置分组 |
| TG_002 | 打车 | 预置分组 |
| TG_003 | 其他 | 商户自定义活动归入此分组 |

---

## 本模块接口命名风格

**风格：camelCase**
- sortOrder, groupId, appId, isPreset, defaultPath, hasPathConfig, promoPaths

**与 B02 的 snake_case 冲突一致。**

---

## 🔴 发现的命名冲突（跨文档）

| 冲突编号 | 描述 | 涉及 |
|---------|------|------|
| CON-006 | B04 ThirdPartyActivity.name 与 B02 Activity.activity_name — 同名概念"活动名称"不同字段名 | B02, B04 |
| CON-007 | B04 sortOrder vs B02 sort_order — 同一概念"排序"不同命名 | B02, B04 |
| CON-008 | B04 第三方活动ID用 `id`，B02 联盟活动ID用 `activity_id` | B02, B04 |

---

## 数据模型关系

```
ThirdPartyGroup (1) ──< (N) ThirdPartyActivity
    │                              │
    │ status=enabled               │ promoPaths: { slotId: path }
    │ 控制客户端Tab可见性          │ 按推广位独立存储路径
    │                              │
    ▼                              ▼
  客户端Tab切换                   路径三级兜底：
                                  promoPaths[slotId] || defaultPath || 空
```
