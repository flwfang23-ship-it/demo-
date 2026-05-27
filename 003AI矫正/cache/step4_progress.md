# Step 4 进度表：回改业务文档

## 进度总览

| 文档 | 状态 | 处理时间 | 主要改动 | 备注 |
|------|------|---------|---------|------|
| B01_用户登录注册 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 | 源文档已是 camelCase，改动小 |
| B02_活动管理-联盟 | ✅ 已完成 | 2026-05-27 | snake_case→camelCase 全量迁移 + 添加引用节 | autoUpdateToken→autoRefreshToken |
| B03_推广位管理 | ✅ 已完成 | 2026-05-27 | id→slotId, name→slotName, createTime→createdAt + 添加引用节 | CON-003/CON-004 裁决落地 |
| B03-A_推广路径与取链 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 | 源文档已是 camelCase，改动小 |
| B03-B_收入归因规则 | ✅ 已完成 | 2026-05-27 | 添加引用节 + promotion_link→promotionLink / h5_direct→h5Direct | 枚举值与数据字典对齐 |
| B04_活动管理-第三方 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 | 源文档已是标准命名，改动小 |
| B05_自动取链 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 | 源文档已是 camelCase，改动小 |
| B05-A_口令自动更新 | ✅ 已完成 | 2026-05-27 | snake_case→camelCase 迁移 + 添加引用节 | auto_refresh_token→autoRefreshToken, group_token→groupToken, tb_watchword→tbWatchword 等 |
| B05-B_口令内嵌H5功能 | ✅ 已完成 | 2026-05-27 | snake_case→camelCase 迁移 + 添加引用节 | auto_refresh_token→autoRefreshToken, activity_id→activityId, h5_template_code→h5TemplateId 等 |
| B05-C_活动清单+预设活动 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 + activity_id→activityId | 取链清单为E28待补充实体 |
| B06_权益页功能 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 + auto_refresh_token→autoRefreshToken + activity_type=third_party→activityType=thirdParty（非SQL） | SQL DDL保留snake_case |
| B07_新人指引 | ✅ 已完成 | 2026-05-27 | 添加引用数据字典节 | 源文档已是camelCase，无待确认事项节，追加到文末 |
| B08_小程序管理 | ⏳ 待处理 | - | 添加引用数据字典节 | - |
| B08-A_试用小程序 | ⏳ 待处理 | - | 添加引用数据字典节 | - |
| B08-B_快速注册 | ⏳ 待处理 | - | 添加引用数据字典节 | - |

## 每文档回改清单

处理每份文档时执行以下操作：

1. **添加"引用数据字典"节**（在"待确认事项"之前），列出本模块涉及的实体和字段
2. **替换旧术语**为标准术语（参见 `002_术语表.md` 废弃术语清单）
3. **替换旧英文名**为标准英文名（参见 `001_数据字典.md` 字段详情中的"旧英文名"列）
4. **对照数据字典校验**：确保文档中的字段名与数据字典一致

## 主要命名迁移规则

| 源文档写法 | 标准写法 | 适用文档 |
|-----------|---------|---------|
| snake_case（如 activity_id） | camelCase（activityId） | B02 ✅, B05-A |
| 客户端 id（推广位） | slotId | B03 ✅ |
| 客户端 name（推广位） | slotName | B03 ✅ |
| createTime | createdAt | B03 ✅ |
| autoUpdateToken | autoRefreshToken | B02 ✅ |
| promotionCount（分组） | promotionCount（保持不变） | 全文 |

## 下次继续

从 **B08_小程序管理** 开始处理（每次3份，下一批：B08, B08-A, B08-B）。
