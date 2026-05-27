# Step 1 进度表：文档实体提取

## 进度总览

| 文档 | 状态 | 处理时间 | 提取实体数 | 缓存文件 |
|------|------|---------|-----------|---------|
| B01_用户登录注册 | ✅ 已完成 | 2026-05-27 | 3 | step1_batch_B01.md |
| B02_活动管理-联盟 | ✅ 已完成 | 2026-05-27 | 1 | step1_batch_B02.md |
| B03_推广位管理 | ✅ 已完成 | 2026-05-27 | 3 | step1_batch_B03.md |
| B03-A_推广路径与取链 | ✅ 已完成 | 2026-05-27 | 3 (E10/E11 + 镜像表) | 合并至主字典 |
| B03-B_收入归因规则 | ✅ 已完成 | 2026-05-27 | 3 (E25/E26/E27) | 合并至主字典 |
| B04_活动管理-第三方 | ✅ 已完成 | 2026-05-27 | 2 | step1_batch_B04.md |
| B05_自动取链 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B05.md |
| B05-A_口令自动更新 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B05.md |
| B05-B_口令内嵌H5功能 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B05.md |
| B05-C_活动清单+预设活动 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B05.md |
| B06_权益页功能 | ✅ 已完成 | 2026-05-27 | 2 | step1_batch_B06.md |
| B07_新人指引 | ✅ 已完成 | 2026-05-27 | 0 (无新实体) | step1_batch_B07.md |
| B08_小程序管理 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B08.md |
| B08-A_试用小程序 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B08.md |
| B08-B_快速注册 | ✅ 已完成 | 2026-05-27 | 见合并文件 | step1_batch_B08.md |

## 已发现的跨文档冲突

| 冲突编号 | 冲突描述 | 涉及文档 | 严重程度 |
|---------|---------|---------|---------|
| CON-001 | 命名风格不统一：B01 camelCase，B02 snake_case | B01, B02 | 🔴 高 |
| CON-002 | 状态值不统一：accountStatus(normal/disabled/pending) vs status(online/offline) | B01, B02 | 🟡 中 |
| CON-003 | 推广位ID：客户端 id vs 总后台 slotId | B03自身 | 🔴 高 |
| CON-004 | 推广位名称：客户端 name vs 总后台 slotName | B03自身 | 🔴 高 |
| CON-005 | 命名风格：B03 camelCase vs B02 snake_case | B02, B03 | 🔴 高 |
| CON-006 | 活动名称：B04 name vs B02 activity_name | B02, B04 | 🔴 高 |
| CON-007 | 排序字段：B04 sortOrder vs B02 sort_order | B02, B04 | 🔴 高 |
| CON-008 | 活动ID：B04 id vs B02 activity_id | B02, B04 | 🔴 高 |
| CON-009 | 自动更新口令：B02 autoUpdateToken vs B05-B autoRefreshToken | B02, B05-B | 🔴 高 |
| CON-010 | TokenCache用snake_case，B03推广位用camelCase | B05-A, B03 | 🟡 中 |
| CON-011 | isPreset同时用于第三方活动和联盟活动，含义略不同 | B04, B05-C | 🟡 中 |

## 已发现的跨文档冲突

| 冲突编号 | 冲突描述 | 涉及文档 | 严重程度 |
|---------|---------|---------|---------|
| CON-001 | 命名风格不统一：B01 用 camelCase (merchantId)，B02 用 snake_case (activity_id) | B01, B02 | 🔴 高 |
| CON-002 | 状态值不统一：B01 accountStatus 用 normal/disabled/pending，B02 status 用 online/offline | B01, B02 | 🟡 中（不同业务对象，但模式不统一） |

## Step 1 最终产出

`003AI矫正/001_数据字典.md` 已生成，包含：
- 27个实体完整字段表（含源文档旧名对照）
- 15个跨文档命名冲突裁决
- B06权益页镜像数据（3个Tab表字段）
- 归因规则速查
- 命名风格统一对照表

## 下次继续

Step 1 已完成，下次从 **Step 2 术语表** 开始。
