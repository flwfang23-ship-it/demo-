# Step 1 缓存：B03 推广位管理 — 实体与字段提取

> 源文件：`001功能文档/B03_推广位管理（0526）.md`
> 提取时间：2026-05-27

---

## 实体1：推广分组 (PromotionGroup)

来源：§功能A004, §4.2 数据结构

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 分组ID | id | string | Y | 系统生成 | 分组唯一ID | §4.2, API-M03-01 |
| 分组名称 | name | string | Y | - | 1-10字符，同商户下不可重复 | §3.2.3, §4.2 |
| 是否默认 | isDefault | boolean | Y | false | 系统预置默认分组为true，不可删除 | §4.2 |
| 包含推广位数 | promotionCount | number | Y | 0 | 该分组下推广位数量 | §4.2, §3.1.3 |
| 推广位列表 | promotions | Array\<Promotion\> | N | [] | 仅客户端前端使用 | §4.2 |
| 创建时间 | createdAt | string | Y | 系统生成 | YYYY-MM-DD HH:mm:ss | §4.2, §3.1.3 |

---

## 实体2：推广位 (Promotion / PromotionSlot)

来源：§功能A003 (客户端), §功能A005 (总后台), §4.2 数据结构

**⚠️ 注意：同一实体在客户端和总后台使用了不同的字段命名体系！**

### 客户端视角字段

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 推广位ID | id | string | Y | 系统生成 | 格式 PROMO_XXX | §3.1.3, §4.2 |
| 推广位名称 | name | string | Y | - | 1-20字符，同分组下不可重复 | §3.1.3, §3.2.3, §4.2 |
| 是否默认 | isDefault | boolean | Y | false | 系统预置默认为true，不可删除 | §3.1.3, §4.2 |
| 所属分组ID | groupId | string | Y | - | 关联分组 | §4.2 |
| 所属分组名称 | groupName | string | Y | - | 冗余字段，列表展示用 | §3.1.3, §4.2 |
| 创建时间 | createdAt | string | Y | 系统生成 | YYYY-MM-DD HH:mm:ss | §4.2 |

### 总后台视角字段（同一实体，不同命名！）

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 | 来源位置 |
|-----------|-----------|------|------|------|---------|
| 推广位ID | slotId | string | Y | 格式 PROMO_XXX | §3.1.3 (B03-B) |
| 推广位名称 | slotName | string | Y | 商户自定义 | §3.1.3 (B03-B) |
| 商户姓名 | customerName | string | Y | 上行展示 | §3.1.3 (B03-B) |
| 商户手机号 | customerPhone | string | Y | 脱敏展示 | §3.1.3 (B03-B) |
| 所属分组 | groupName | string | Y | 分组名称 | §3.1.3 (B03-B) |
| 是否默认 | isDefault | boolean | Y | 🟢是/-否 | §3.1.3 (B03-B) |
| 创建时间 | createdAt | string | Y | YYYY-MM-DD HH:mm | §3.1.3 (B03-B) |

### 🔴 命名冲突：id vs slotId, name vs slotName

| 属性 | 客户端字段名 | 总后台字段名 | 建议统一 |
|------|-----------|-----------|---------|
| 推广位ID | id | slotId | → slotId |
| 推广位名称 | name | slotName | → slotName |

---

## 实体3：推广位平台参数 (PlatformConfig)

来源：§3.2.3 总后台详情抽屉, §4.2

| 字段中文名 | 字段英文名 | 类型 | 必填 | 脱敏 | 说明 | 来源位置 |
|-----------|-----------|------|------|------|------|---------|
| 美团-媒体ID | meituanMediaId | string\|null | N | 否 | 美团联盟分配 | §3.2.3 |
| 美团-推广位SID | meituanSlotSid | string\|null | N | 否 | 美团联盟接口返回 | §3.2.3 |
| 美团-媒体appkey | meituanAppkey | string\|null | N | 否 | 美团联盟分配 | §3.2.3 |
| 美团-媒体AppSecret | meituanAppSecret | string\|null | N | 是 | 默认脱敏 `****` | §3.2.3 |
| 饿了么-媒体ID | elemeMediaId | string\|null | N | 否 | 饿了么联盟分配 | §3.2.3 |
| 饿了么-推广位PID | elemePid | string\|null | N | 否 | 饿了么联盟接口返回 | §3.2.3 |
| 饿了么-淘宝联盟appkey | taobaoAppkey | string\|null | N | 否 | 淘宝联盟分配 | §3.2.3 |
| 饿了么-淘宝联盟AppSecret | taobaoAppSecret | string\|null | N | 是 | 默认脱敏 `****` | §3.2.3 |

> **权限约束**：platformConfig 整组字段仅总后台可见，商户端接口不返回。

---

## 本模块接口命名风格

**风格：camelCase**
- 分组：id, name, isDefault, promotionCount, createdAt
- 推广位客户端：id, name, isDefault, groupId, groupName, createdAt
- 推广位总后台：slotId, slotName, customerName, customerPhone, groupName, isDefault, createdAt
- 平台参数：meituanMediaId, meituanSlotSid, meituanAppkey, meituanAppSecret, elemeMediaId, elemePid, taobaoAppkey, taobaoAppSecret

**整体一致，但与 B02 的 snake_case 冲突。**

---

## 🔴 发现的命名冲突（跨文档）

| 冲突编号 | 描述 | 涉及 |
|---------|------|------|
| CON-003 | B03 推广位ID在客户端叫 `id`，总后台叫 `slotId`，同一实体两套命名 | B03自身 |
| CON-004 | B03 推广位名称在客户端叫 `name`，总后台叫 `slotName` | B03自身 |
| CON-005 | B03 用 camelCase，B02 用 snake_case | B02, B03 |
