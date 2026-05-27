# Step 1 合并：全量实体清单 & 跨文档命名冲突

> 从14份业务文档中提取的所有实体汇总
> 生成时间：2026-05-27

---

## 一、实体总表

| 序号 | 实体中文名 | 建议英文名 | 核心字段数 | 来源文档 | 备注 |
|------|-----------|-----------|-----------|---------|------|
| E01 | 商户 | Merchant | 13 | B01 | 含企业信息字段 |
| E02 | 用户登录凭证 | UserCredential | 6 | B01 | Token/验证码等 |
| E03 | 登录二维码 | LoginQrcode | 2 | B01 | |
| E04 | 联盟活动 | AllianceActivity | 16 | B02 | supplier=meituan/eleme |
| E05 | 第三方活动分组 | ThirdPartyGroup | 5 | B04 | 预置：京东/打车/其他 |
| E06 | 第三方活动 | ThirdPartyActivity | 10 | B04 | 含预设+自定义 |
| E07 | 推广分组 | PromotionGroup | 6 | B03 | |
| E08 | 推广位 | PromotionSlot | 6(+8) | B03 | +8个platformConfig字段 |
| E09 | 推广位平台参数 | PlatformConfig | 8 | B03 | 仅总后台可见 |
| E10 | 取链请求 | GenerateLinkRequest | 2 | B05 | |
| E11 | 美团取链结果 | MeituanLinkResult | 6 | B05 | referralLinkMap["1"~"6"] |
| E12 | 饿了么取链结果 | ElemeLinkResult | 10+ | B05 | 嵌套分组结构 |
| E13 | 口令缓存 | TokenCache | 10 | B05-A | snake_case 命名 |
| E14 | H5模板 | H5Template | 7 | B05-B | |
| E15 | 活动-H5关联 | ActivityH5Binding | 2 | B05-B | 附加字段在 Activity 上 |
| E16 | 活动预设标记 | ActivityPresetFlag | 1 | B05-C | isPreset 附加字段 |
| E17 | 组件模板 | Component | 7 | B06 | type=title/link |
| E18 | 权益页配置 | BenefitPageConfig | 3 | B06 | 字段待补充(limit未覆盖完) |
| E19 | 新人指引进度 | OnboardingProgress | (派生) | B07 | 无独立实体，状态派生自其他模块 |
| E20 | 小程序 | MiniProgram | 10 | B08 | 13个状态枚举值 |
| E21 | 快速注册任务 | FastRegisterTask | 11 | B08-B | |
| E22 | 试用创建请求 | TrialCreateRequest | 5 | B08-A | |
| E23 | 推广位路径 | PromotionPath | 5 | B03-A | miniPath/h5Path/missingCount |
| E24 | 关联小程序卡片 | LinkedMiniProgram | 6 | B03-A | 小程序清单弹窗展示 |
| E25 | 收入归因记录 | AttributionRecord | 18 | B03-B | 归因明细+概览 |
| E26 | 用户归因标签 | UserAttributionTag | 4 | B03-B | 小程序端持久化标签 |
| E27 | 归因概览 | AttributionSummary | 8 | B03-B | 推广位归因汇总 |

---

## 二、命名风格分布

| 文档 | 风格 | 示例 |
|------|------|------|
| B01 | camelCase | merchantId, companyName, accountStatus, createdAt |
| B02 | **snake_case** | activity_id, activity_name, sort_order, created_at |
| B03 | camelCase | id, slotId, slotName, isDefault, groupId, createdAt |
| B04 | camelCase | id, sortOrder, appId, isPreset, defaultPath |
| B05-A | **snake_case** | activity_id, promotion_slot_id, refreshed_at, expire_at |
| B05-B/C | camelCase | templateCode, isPreset, autoRefreshToken |
| B06 | camelCase | enabled, targetActivityId |
| B08 系列 | camelCase | appId, authStatus, expireAt, createdAt |

### 🔴 结论：B02 和 B05-A 使用 snake_case，其余文档使用 camelCase。统一为 camelCase。

---

## 三、所有跨文档命名冲突（11项）

| 编号 | 严重度 | 描述 | 涉及文档 |
|------|--------|------|---------|
| CON-001 | 🔴 | 命名风格：B01 camelCase vs B02 snake_case | B01, B02 |
| CON-002 | 🟡 | 状态值风格：accountStatus(normal/disabled/pending) vs status(online/offline) | B01, B02 |
| CON-003 | 🔴 | 推广位ID：客户端 `id` vs 总后台 `slotId` (同一实体) | B03自身 |
| CON-004 | 🔴 | 推广位名称：客户端 `name` vs 总后台 `slotName` (同一实体) | B03自身 |
| CON-005 | 🔴 | 活动名称：B04 `name` vs B02 `activity_name` | B02, B04 |
| CON-006 | 🔴 | 排序：B04 `sortOrder` vs B02 `sort_order` | B02, B04 |
| CON-007 | 🔴 | 活动ID：B04 `id` vs B02 `activity_id` | B02, B04 |
| CON-008 | 🔴 | 自动更新口令：B02 `autoUpdateToken` vs B05-B `autoRefreshToken` | B02, B05-B |
| CON-009 | 🟡 | TokenCache用snake_case，其源实体(B03)用camelCase | B05-A, B03 |
| CON-010 | 🟡 | isPreset 同时用于联盟活动和第三方活动，含义相近但实体不同 | B04, B05-C |
| CON-011 | 🟡 | B08 companyName/uscc 与 B01 Merchant 同名字段可能指不同实体 | B01, B08-B |

---

## 四、核心命名问题清单

以下是需要在 Step 3（命名规范）中逐一裁决的命名决策：

1. **ID字段**：统一用 `xxxId` 还是 `xxx_id`？→ 建议 `xxxId`（camelCase）
2. **活动实体前缀**：联盟活动 vs 第三方活动 如何区分？→ 建议 `AllianceActivity` / `ThirdPartyActivity`
3. **同一实体不同视图**：推广位在客户端叫 `Promotion`(id/name)，总后台叫 `PromotionSlot`(slotId/slotName) → 建议统一实体名 `PromotionSlot`，字段统一 `slotId` / `slotName`
4. **状态字段**：布尔用 `isXxx` / `enabled`，枚举用 `xxxStatus` → 建议统一
5. **时间字段**：`createdAt` vs `created_at` vs `createTime` → 建议统一 `createdAt` / `updatedAt`
6. **排序字段**：`sortOrder` vs `sort_order` → 建议统一 `sortOrder`
7. **autoUpdateToken vs autoRefreshToken** → 建议统一为 `autoRefreshToken`

---

## 五、下次会话接续

- Step 1 提取+合并+产出全部完成
- 最终输出：`003AI矫正/001_数据字典.md`
- 下次从 **Step 2 术语表** 开始
- 读 `cache/step1_batch_merge.md`（本文件）了解实体全貌
- 读 `cache/step1_progress.md` 了解每份文档的缓存位置
