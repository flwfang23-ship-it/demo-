# Step 1 缓存：B05 系列 — 实体与字段提取

> 源文件：B05/B05-A/B05-B/B05-C
> 提取时间：2026-05-27

---

## 实体1：取链请求 (GenerateLinkRequest)

来源：B05 §3.2

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 |
|-----------|-----------|------|------|------|
| 活动ID | activityId | string | Y | 联盟活动ID |
| 推广位ID | promotionSlotId | string | Y | 推广位ID |

---

## 实体2：美团取链结果 (MeituanLinkResult)

来源：B05 §2.1

| 字段中文名 | 字段英文名 | 类型 | 说明 |
|-----------|-----------|------|------|
| 短链接 | referralLinkMap["1"] | string | 短URL，如 dpurl.cn/xxx |
| 长链接 | referralLinkMap["2"] | string | 完整追踪链接 |
| 唤起协议 | referralLinkMap["3"] | string | imeituan:// scheme |
| 小程序路径 | referralLinkMap["4"] | string | 美团小程序页面路径 |
| 团口令 | referralLinkMap["5"] | string | 文案口令含emoji |
| 小程序二维码 | referralLinkMap["6"] | string | 二维码图片URL |

---

## 实体3：饿了么取链结果 (ElemeLinkResult)

来源：B05 §2.2

分组结构：link → { taobao_promotion, h5_promotion, app_promotion, alipay_promotion, wx_promotion }

**taobao_promotion 组（核心）：**

| 字段中文名 | 字段英文名 | 类型 | 说明 |
|-----------|-----------|------|------|
| H5推广页 | h5_url | string | H5推广链接 |
| 唤起协议 | scheme_url | string | tbopen:// scheme |
| 推广图片 | img_url | string | 图片URL |
| 淘宝二维码 | tb_qr_code | string | 二维码图片 |
| 淘宝口令(短) | tb_watchword | string | ￥xxx￥格式 |
| 淘宝口令(建议版) | tb_watchword_suggest | string | 完整文案 |

**顶层扁平字段：**

| 字段中文名 | 字段英文名 | 类型 | 说明 |
|-----------|-----------|------|------|
| 完整淘宝口令 | full_taobao_word | string | - |
| 淘宝口令(短) | taobao_word | string | 与tb_watchword重复 |
| 淘宝小程序二维码 | tb_mini_qrcode | string | - |
| 淘宝二维码图片 | tb_qr_code | string | 与taobao_promotion.tb_qr_code重复 |
| 淘宝唤起协议 | tb_scheme_url | string | - |

---

## 实体4：口令缓存表 (TokenCache)

来源：B05-A §2

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 |
|-----------|-----------|------|------|------|
| 缓存ID | id | string | Y | 主键 |
| 活动ID | activity_id | string | Y | 关联活动 |
| 推广位ID | promotion_slot_id | string | Y | 关联推广位 |
| 平台 | platform | enum | Y | meituan / eleme |
| 淘宝口令(短) | tb_watchword | string | N | 饿了么字段 |
| 淘宝口令(建议版) | tb_watchword_suggest | string | N | 饿了么字段 |
| 唤起协议 | scheme_url | string | N | 饿了么字段 |
| 团口令 | group_token | string | N | 美团字段 (referralLinkMap["5"]) |
| 刷新时间 | refreshed_at | datetime | Y | 最近一次更新的时间 |
| 过期时间 | expire_at | datetime | Y | 预计过期时间(约30天) |

### ⚠️ 此实体混用了两种命名风格！
- activity_id / promotion_slot_id / refreshed_at / expire_at → **snake_case**
- tb_watchword / tb_watchword_suggest / scheme_url / group_token → **snake_case**

---

## 实体5：活动预设标记 (ActivityPresetFlag)

来源：B05-C §2

作用于 B02 的 Activity 实体，新增字段：

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 |
|-----------|-----------|------|------|--------|------|
| 是否预设活动 | isPreset | boolean | Y | false | true时商户创建推广位自动入列 |

> **⚠️ 命名冲突**：B04 中 ThirdPartyActivity 也有 isPreset，含义相同（全商户可见），但 B05-C 的 isPreset 作用于联盟活动。两个不同实体用相同字段名，需区分实体前缀。

---

## 实体6：H5模板 (H5Template)

来源：B05-B §2-3

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 |
|-----------|-----------|------|------|------|
| 模板ID | id | string | Y | 系统生成 |
| 模板编号 | templateCode | string | Y | 由开发提供，对应代码中的模板 |
| 模板名称 | name | string | Y | 运营可读的名称 |
| 模板描述 | description | string | N | 模板用途说明 |
| 状态 | status | enum | Y | enabled / disabled |
| 创建时间 | createdAt | datetime | Y | - |
| 更新时间 | updatedAt | datetime | Y | - |

---

## 实体7：活动-H5模板关联 (ActivityH5Binding)

来源：B05-B §2.1 路径B

作用于 B02 Activity，新增字段：

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 |
|-----------|-----------|------|------|--------|------|
| H5模板ID | h5TemplateId | string | N | null | 关联的H5模板，null=不关联 |
| 自动更新口令 | autoRefreshToken | boolean | Y | false | 是否纳入口令自动更新 |

> **⚠️ 命名**：B02 文档中记为 autoUpdateToken，B05-B 中记为 autoRefreshToken，不一致！

---

## 实体8：取链清单 (LinkInventory)

来源：B05-C §4（商户端推广位页中的"取链清单"列入口）

具体字段待文档后续补充，当前仅定义了入口。B05-C 文档在 limit=100 行内未展开取链清单的字段定义。

---

## 🔴 发现的命名冲突

| 冲突编号 | 描述 |
|---------|------|
| CON-009 | B02 用 `autoUpdateToken`，B05-B 用 `autoRefreshToken`，同一字段两个名 |
| CON-010 | TokenCache 用 snake_case (activity_id)，与其来源的 B03 camelCase 不一致 |
| CON-011 | B04 isPreset (第三方活动) vs B05-C isPreset (联盟活动) — 同字段名但不同实体，需写清楚上下文 |
