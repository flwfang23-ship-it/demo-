# Step 1 缓存：B08 系列 — 小程序管理 实体与字段提取

> 源文件：B08/B08-A/B08-B
> 提取时间：2026-05-27

---

## 实体1：小程序 (MiniProgram)

来源：B08 §3, B08-A §2, B08-B §2

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源 |
|-----------|-----------|------|------|--------|------|------|
| 小程序AppID | appId | string | Y | - | 微信分配的唯一标识 | B08 |
| 小程序名称 | name | string | Y | - | 商户填写 | B08 |
| 头像 | avatar | string | N | - | 小程序头像URL | B08 |
| 主体名称 | subjectName | string | Y | - | 企业名称 | B08 |
| 认证状态 | authStatus | enum | Y | - | 已认证/未认证 | B08 |
| 来源类型 | source | enum | Y | - | 正式注册 / 试用 | B08 |
| 状态 | status | enum | Y | - | 见下方状态表 | B08 |
| 到期时间 | expireAt | datetime | N | null | 试用小程序14天到期时间 | B08-A |
| 创建时间 | createdAt | datetime | Y | 系统生成 | - | B08 |
| 代码版本 | codeVersion | string | N | - | 当前线上代码版本号 | B08 |

### source 枚举值

| 枚举值 | 显示文案 | 说明 |
|--------|---------|------|
| official | 正式注册 | 通过快速注册通道获得 |
| trial | 试用 | 通过试用小程序通道获得 |

### status 枚举值（全生命周期）

| 枚举值 | 含义 | 来源通道 |
|--------|------|---------|
| DRAFT | 草稿，未提交 | B08-B 快速注册 |
| SUBMITTED | 已提交微信 | B08-B |
| VERIFYING | 法人核验中 | B08-B |
| SUCCESS | 注册成功 | B08-B |
| FAIL | 注册失败 | B08-B |
| CREATING | 试用创建中 | B08-A |
| WAIT_ADMIN_AUTH | 等待管理员确认 | B08-A |
| TRIAL_READY | 体验期(14天) | B08-A |
| TRIAL_EXPIRING_SOON | 即将到期(≤3天) | B08-A |
| UPGRADING | 转正中 | B08-A |
| UPGRADE_FAILED | 转正失败 | B08-A |
| OFFICIAL | 正式小程序 | B08-A/B08-B |
| TRIAL_EXPIRED | 试用已过期 | B08-A |

---

## 实体2：快速注册任务 (FastRegisterTask)

来源：B08-B §2

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 |
|-----------|-----------|------|------|------|
| 任务ID | id | string | Y | - |
| 企业名称 | companyName | string | Y | 与工商登记一致 |
| 统一社会信用代码 | uscc | string | Y | 18位 |
| 法人姓名 | legalPersonName | string | Y | - |
| 法人微信号 | legalPersonWx | string | Y | 非手机号/QQ号 |
| 联系电话 | contactPhone | string | N | - |
| 状态 | status | enum | Y | DRAFT/SUBMITTED/VERIFYING/SUCCESS/FAIL |
| 微信返回错误码 | wxErrorCode | string | N | - |
| 微信返回错误信息 | wxErrorMessage | string | N | - |
| 成功后AppID | appId | string | N | 注册成功后写入 |
| 提交时间 | submittedAt | datetime | N | - |

### ⚠️ 命名冲突

- B08-B `companyName` 与 B01 Merchant `companyName` 同名 — 但一个是注册任务中的企业名，一个是SaaS商户的企业名，可能不是同一实体
- B08-B `uscc` 与 B01 Merchant `uscc` 同名 — 同上

---

## 实体3：试用小程序创建请求 (TrialCreateRequest)

来源：B08-A §2.2 Step A

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 |
|-----------|-----------|------|------|------|
| 小程序名称 | name | string | Y | 期望展示名 |
| 头像 | avatar | string | N | 小程序头像 |
| 授权确认页URL | authUrl | string | R | 微信返回，用于生成二维码 |
| 二维码ticket | ticket | string | R | 24h有效期 |
| 过期时间 | expireAt | datetime | R | ticket过期时间 |

---

## 本模块接口命名风格

**待确认** — B08 文档 limit=200 行内未包含完整的接口字段定义，命名风格需从文档后续部分提取（留给后续会话）。

---

## 🔴 发现的命名冲突

| 冲突编号 | 描述 |
|---------|------|
| CON-013 | B08 status 枚举值达13个，与其他模块的 status(online/offline 或 enabled/disabled) 风格完全不同 |
| CON-014 | B08-B companyName/uscc 与 B01 Merchant 中的同名字段可能指不同实体 |
