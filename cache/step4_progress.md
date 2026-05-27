# Step 4 回改进度

> 最后更新：2026-05-27
> 状态：✅ 全部完成（15/15）

## 总进度：15/15

| 批次 | 文档 | 状态 | 完成时间 | 备注 |
|------|------|------|---------|------|
| 1 | B01_用户登录注册 | ✅ 已完成 | 2026-05-27 | |
| 1 | B02_联盟活动管理 | ✅ 已完成 | 2026-05-27 | snake_case → camelCase |
| 1 | B03_推广位管理 | ✅ 已完成 | 2026-05-27 | |
| 2 | B03-A_推广路径与取链 | ✅ 已完成 | 2026-05-27 | |
| 2 | B03-B_收入归因规则 | ✅ 已完成 | 2026-05-27 | |
| 2 | B04_活动管理-第三方 | ✅ 已完成 | 2026-05-27 | 格式参照文档 |
| 3 | B05_自动取链 | ✅ 已完成 | 2026-05-27 | |
| 3 | B05-A_口令自动更新 | ✅ 已完成 | 2026-05-27 | snake_case → camelCase |
| 3 | B05-B_口令内嵌H5 | ✅ 已完成 | 2026-05-27 | |
| 4 | B08_小程序管理 | ✅ 已完成 | 2026-05-27 | 新增引用数据字典节，snake_case → camelCase（SQL DDL除外） |
| 4 | B08-A_试用小程序 | ✅ 已完成 | 2026-05-27 | 新增引用数据字典节，snake_case → camelCase |
| 4 | B08-B_快速注册 | ✅ 已完成 | 2026-05-27 | 新增引用数据字典节，snake_case → camelCase（SQL DDL除外） |
| 5 | B05-C_活动清单+预设活动 | ✅ 已完成 | 2026-05-27 | 另一会话完成 |
| 5 | B06_权益页功能 | ✅ 已完成 | 2026-05-27 | 另一会话完成 |
| 5 | B07_新人指引 | ✅ 已完成 | 2026-05-27 | 另一会话完成 |

## 第4批改动摘要

### B08_小程序管理
- 插入 `## 引用数据字典` 节（引用 E22 MiniProgram / E23 FastRegisterTask / E24 TrialCreateRequest）
- 引用术语表 4.4 节（小程序生命周期状态）、三节（平台标识 source 枚举）
- 引用数据字典 CON-014 裁决
- snake_case → camelCase：tenantName, sourceType, official, trialExpireAt, lastDeployVersion, auditStatus, createdAt, trialStatus, tenantId, startDate, endDate, subjectName, name
- SQL DDL 区块保留不变

### B08-A_试用小程序
- 插入 `## 引用数据字典` 节（引用 E22 MiniProgram / E24 TrialCreateRequest）
- 引用术语表 4.4 节（9个试用相关状态枚举）、六节（转正）、五节（法人）
- snake_case → camelCase：trialExpireAt, trialStatus, upgradeTaskId, adminWechat, taskId, authUrl, authQrcode, expireAt, miniappId, companyName, uscc, legalPersonName, legalPersonWx, contactPhone, verifyUrl, sourceType, authUrlExpireAt

### B08-B_快速注册
- 插入 `## 引用数据字典` 节（引用 E23 FastRegisterTask / E22 MiniProgram）
- 引用术语表 4.4 节（5个快速注册状态）、五节（法人）、六节（入驻）
- 引用数据字典 CON-014 裁决
- snake_case → camelCase：tenantName, sourceType, official, taskId, legalPersonName, wxErrorCode, wxErrorMessage, createdAt, updatedAt, codeType, legalPersonWx, componentPhone, userTips, legalPersonWxMasked
- SQL DDL 区块保留不变
