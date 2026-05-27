# Step 1 缓存：B01 用户登录注册 — 实体与字段提取

> 源文件：`001功能文档/B01_用户登录注册（0526）.md`
> 提取时间：2026-05-27

---

## 实体1：商户 (Merchant)

来源：§3.1 客户列表页 G01-g, §3.2 客户详情抽屉 G01-h, §4.4 账号信息页 G01-d

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 商户ID | merchantId | string | Y | 系统生成 | 系统唯一标识 | G01-g, G01-h, API-G01-009 |
| 公司名称 | companyName | string | Y | - | 注册时填写 | G01-g, G01-h |
| 联系人 | contactName | string | N | - | - | G01-g |
| 手机号 | phone | string | Y | - | 11位，可脱敏展示 | G01-g, G01-h |
| 注册时间 | createdAt | datetime | Y | 系统生成 | yyyy-MM-dd HH:mm | G01-g, API-G01-009 |
| 账号状态 | accountStatus | enum | Y | pending | normal / disabled / pending | G01-g, G01-h |
| 最后登录时间 | lastLoginTime | datetime | N | - | yyyy-MM-dd HH:mm | G01-g, API-G01-009 |
| 商户名称 | name | string | Y | - | G01-h详情中使用name字段 | G01-h, API-G01-001 |
| 账号角色 | role | enum | N | 商户管理员 | 商户管理员/操作员/只读 | G01-d, API-G01-001 |
| 头像 | avatar | string | N | - | 取商户名称首字 | G01-d |
| 法定代表人 | legalPerson | string | N | - | 营业执照OCR识别 | G01-f, G01-h |
| 统一社会信用代码 | uscc | string | N | - | 营业执照OCR识别 | G01-f, G01-h |
| 联系电话 | contactPhone | string | N | - | 区别于注册手机号 | G01-h |

### accountStatus 枚举值

| 枚举值 | 显示文案 | 视觉 | 说明 |
|--------|---------|------|------|
| normal | 正常 | 🟢 绿色标签 | 可正常使用 |
| disabled | 已禁用 | 🔴 红色标签 | 无法登录 |
| pending | 待审核 | 🟡 黄色标签 | 等待运营审核 |

---

## 实体2：用户登录凭证 (UserCredential)

来源：§4.1 PC端登录页 G01-a, §5.2 接口规格

| 字段中文名 | 字段英文名 | 类型 | 必填 | 默认值 | 说明 | 来源位置 |
|-----------|-----------|------|------|--------|------|---------|
| 手机号 | phone | string | Y | - | 11位中国大陆手机号 | G01-a, API-G01-001 |
| 密码 | password | string | Y | - | 6-20位，含字母+数字 | G01-a, API-G01-001 |
| 短信验证码 | smsCode | string | Y(注册) | - | 6位数字 | G01-a, API-G01-006 |
| 微信openid | openid | string | N | - | 扫码注册时传入 | API-G01-006 |
| JWT Token | token | string | Y | - | 7天有效期 | API-G01-001 |
| Token过期时间 | expiresIn | number | Y | - | 秒 | API-G01-001 |

---

## 实体3：登录二维码 (LoginQrcode)

来源：§4.1 PC端登录页, §5.1 数据流

| 字段中文名 | 字段英文名 | 类型 | 必填 | 说明 | 来源位置 |
|-----------|-----------|------|------|------|---------|
| 二维码Ticket | ticket | string | Y | 用于轮询扫码状态 | §5.1 |
| 扫码状态 | status | enum | Y | pending/scanned/confirmed/expired | §4.1 |

---

## 本模块接口中的字段命名风格

**风格：camelCase**
- merchantId, companyName, contactName, accountStatus, lastLoginTime, createdAt
- smsCode, expiresIn

## 注意事项

- B01 文档中"商户"概念同时出现在总后台（客户管理）和客户端（账号信息），是否统一叫 Merchant 还是分 PlatformMerchant / ClientUser 待定
- G01-g 列的字段英文名在表格中有明确定义，但 G01-h 详情的字段表中未给出英文名（中文名也不完全一致：如G01-g用"公司名称"、G01-h用"商户名称"）
