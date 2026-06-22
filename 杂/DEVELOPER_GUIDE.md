# 视界探索者教团 — 开发者完整指南

> 面向 AI 开发者的项目全貌文档。涵盖架构、数据结构、所有系统、关键常量和修改注意事项。

---

## 一、项目概览

| 维度 | 详情 |
|------|------|
| 名称 | 视界探索者教团（苏格拉底式 AI 教学 RPG） |
| 类型 | 纯前端单页应用 |
| 入口 | `index.html` → 加载 KaTeX + `app.js` |
| 主逻辑 | `app.js`（~4600 行，`const App = { ... }` 全局对象） |
| 样式 | `style.css`（~37KB，CSS 自定义属性主题） |
| AI | DeepSeek Chat API（`/v1/chat/completions`），模型 `deepseek-chat` |
| 存储 | 浏览器 localStorage，键前缀 `order_` |
| 数学渲染 | 本地 KaTeX（`lib/katex/`） |
| 运行方式 | Python `http.server` 或 Node.js `serve` |

---

## 二、完整文件结构

```
6.13 rpg/
├── index.html                # 单页应用入口（欢迎向导卡片 → 主界面）
├── style.css                 # 全部样式（CSS 变量主题，响应式）
├── app.js                    # 全部逻辑（~4600 行，App 全局对象，非模块）
├── CLAUDE.md                 # 项目架构文档（面向开发）
├── README.md                 # 用户向说明
├── 数学符号面板.html          # LaTeX 符号输入面板（独立窗口）
├── 教材阅读器.html            # 教材 MD 渲染器（独立窗口，含 KaTeX）
│
├── 教材/                      # 课程教材（Markdown .md 文件）
│   ├── 高等数学上册/           # 47 文件，第 1-7 章
│   ├── GEB/                   # 42 文件，第 1-21 章（对话+论述）
│   ├── C++ Primer Plus/       # 199 文件，第 1-28 章 + 附录
│   └── 生命进化的跃升/         # 40 文件，第 1-10 章
│
├── 老师/                      # 教师角色
│   ├── roster.json            # 显示元数据（名/身份/颜色/角色等级）
│   ├── ganyu.md               # 甘雨 · 津梁（使徒 🌱）
│   ├── gregor.md              # 格里高尔 · 觉醒者（守护导师 🌳）
│   ├── ishmael_v2.md          # 以实玛丽 · 航行者（守护导师 🌳）
│   ├── keqing.md              # 刻晴 · 锐刃（使徒 🌱）
│   ├── march7.md              # 三月七 · 微光（使徒 🌱）
│   └── sonetto.md             # 十四行诗 · 炼金术士（守护导师 🌳）
│
├── system/                    # 系统提示词
│   ├── world_setting.md       # RPG 世界观（含 {{PROGRESS_SUMMARY}} 等占位符）
│   ├── homework_prompt.md     # 作业批改模板
│   └── feynman_pet_prompt.md  # 费曼萌宠提示词
│
├── teacher/                   # 教师系统文件（教学系统种子数据）
├── 习题集/                     # 战斗题库（.txt 文件）
├── homework/待批改/            # 作业批改
├── lib/katex/                 # 本地 KaTeX 库
├── fonts/                     # 自定义字体
│   └── custom-font.css        # @font-face 声明 + --font 变量
├── backup/                    # 历史备份
└── notes/                     # 课堂笔记模板
```

---

## 三、App.state 核心数据结构

```js
App.state = {
  // ── 教学核心 ──
  apiKey: '',                    // DeepSeek API Key
  textbookCourses: [],           // [{courseName, coursePath, chapters, domainHint}]
  textbookOutline: [],           // 当前课程的章节大纲
  selectedCourse: '',            // 当前课程名
  selectedSection: null,         // 单选章节 {chapterNum, num, title, filename}
  selectedSections: [],          // 多选章节数组 [{chapterNum, num, title, filename, charCount}]
  textbookSections: {},          // 教材内容缓存 {filename: content}
  teachers: [],                  // [{id, name, namePure, role, personaBrief, avatarColor, orderRole, ...}]
  selectedTeacherId: null,       // 当前教师 ID
  isClassActive: false,          // 上课中标志
  chatHistory: [],               // [{role, content}]
  classTokenUsage: { promptCacheHit, promptCacheMiss, completionTokens },
  activeItem: null,              // 激活的教学道具 key

  // ── 学习进度 ──
  progress: {
    completedLessons: 0,
    courseMastery: {},           // {[courseName]: string[]} 按课程分知识点
    masteredPoints: [],          // 旧版兼容（扁平数组）
    lessonRecords: [],           // [{date, teacher, courseName, masteredConcepts, ...}]
    weakPoints: []
  },

  // ── 教师记忆 ──
  teacherNotes: {},              // {[teacherId]: [{date, lesson, chapterNum, sectionNum, note}]}

  // ── RPG 系统 ──
  trees: { oak: {...}, willow: {...}, laurel: {...} },
  bonds: { '格里高尔': {value, level}, '十四行诗': {...}, ... },
  gameDay: 1,
  gameTime: '晨间',              // 晨间 → 午后 → 黄昏 → 夜间 → 次日

  // ── 答题打怪 ──
  player: { level, xp, lives, maxLives, attack, defense, gold, inventory, equipment },
  combat: {
    isInBattle, isJudging, currentEnemy, questionPool,
    currentDifficulty, companion, bossDefeated,
    invincible, shielded, livesLostThisRound
  },
  exerciseBooks: [],             // [{filename, displayName}]

  // ── 萌宠系统 ──
  pet: {
    unlocked, name, appearance, personality, level, goldenEggs,
    evolutionStage, isTeaching, teachingMessages, learnedWords, ...
  },

  // ── 其他 ──
  wechatUnread: [],              // 群聊未读 [{sender, content, time}]
  wechatArchive: [],             // 群聊已读归档
  diary: [],                     // 探索日志 [{date, content}]
  conversationArchives: [],      // 课堂归档 [{type, date, teacher, messages, ...}]
  homeworkActive: false,         // 作业系统中
  homeworkMessages: [],          // 作业对话
  homeworkFiles: [],             // 待批改文件列表
  settings: { theme: 'light', fontSize: 'medium' }
};
```

---

## 四、核心系统架构

### 4.1 启动流程

```
DOMContentLoaded → App.init()
  → loadSettings()（从 LS 读主题/字号）
  → 检查 apiKey
    ├─ 无 Key → 显示步骤 1（输入 Key）
    └─ 有 Key → 跳到步骤 2
  → 用户点击"加载资源" → loadResources()
      → scanTeachers()      # fetch 老师/ 目录，解析 roster.json + .md 人设
      → scanTextbooks()     # fetch 教材/ 目录，构建章节树
  → 用户点击"进入" → enterMain()
      → 初始化 LS 默认值（首次使用时）
      → loadPersistentData()  # 从 LS 恢复全部 state
      → 自动扫描教材（如 LS 无数据）
      → 扫描习题集、作业文件
      → 注册 window.beforeunload → saveAllState()
```

**欢迎页**采用卡片向导模式（3 步卡片切换，带动画过渡）：
1. 输入 API Key
2. 加载资源
3. 进入系统

### 4.2 上课流程（教学核心）

```
选择课程 → switchCourse()
  → fetch 该课程全部章节内容
  → 构建 textbookOutline（树形结构）

选择章节 → selectSection() 或 toggleMultiSection()
  → 单选：selectedSection = {...}
  → 多选：selectedSections.push({...})（限制连续、总字数 ≤ 2000）
  → _updateStartBtn()（检查是否满足开始条件）

选择教师 → selectTeacher()
  → 更新顶部教师信息显示
  → _updateStartBtn()

点击开始上课 → startClass()
  → 重置 chatHistory、token 统计
  → advanceGameTime()  # 推进游戏时间
  → buildSystemPrompt()  # 构建完整系统提示词（见 4.3）
  → sendToAI(initUserMsg)  # 第一次 API 调用
    → AI 提问 → 学生回答 → sendMessage() → sendToAI(null) → 循环
  → 结束 → endClass()
      → addTreeBranch()     # 知识树长出新枝，收获树产物
      → addBond()           # 羁绊值增长（守护导师 +5，使徒 +3）
      → postClassUpdate()   # AI 生成课后总结（见 4.4）
      → saveConversationArchive()
      → showTokenStats()
```

### 4.3 System Prompt 结构（buildSystemPrompt）

组装顺序（**教学优先**原则）：

| 顺序 | 段落 | 来源 | 方法/位置 |
|------|------|------|-----------|
| 1 | 9 条重要指令 | 硬编码 | ~2841-2850 |
| 2 | 已激活道具效果 | `ITEM_EFFECTS` → `state.activeItem` | app.js:277 |
| 3 | 教材内容 | `fetchSection(filename)` → MD 原文 | app.js:893-908 |
| 4 | 教学要点（4 步路线图） | 硬编码 | ~2856-2862 |
| 5 | 苏格拉底规则 | `SEED_DATA.systemMd` | app.js:26-47 |
| 6 | 系统操作细节 | `SEED_DATA.systemDetailMd` | app.js:49-72 |
| 7 | 教师人设 | `parseTeacherMd()` → personaBrief | app.js:1008-1093 |
| 8 | 角色对话示例 | 人设文件中 `<example_dialogue>` 块 | 可选 |
| 9 | 导师记忆 | `state.teacherNotes[teacherId]` | 最近 5 条 |
| 10 | 学习者档案 | `_buildLearnerProfile()` 动态生成 | app.js:2740-2758 |
| 11 | 世界观 | `fetchWorldSetting()` → `system/world_setting.md` | app.js:910-924 |

### 4.4 课后总结（postClassUpdate）

一次 API 调用（`response_format: json_object`），返回 JSON：

```json
{
  "summary": "掌握/薄弱/学习特点",
  "masteredConcepts": ["概念1", "概念2"],
  "teacherNote": "授课教师 150 字教学笔记（第一人称）",
  "participantNotes": [
    {"teacherName": "格里高尔", "note": "100 字内观察"}
  ],
  "diary": "旅者第一人称 300-500 字日志",
  "wechat": [
    {"sender": "教师名", "content": "群聊发言"}
  ]
}
```

数据流向：
- `teacherNote` → `teacherNotes[teacherId]`，下节课注入系统提示
- `participantNotes` → 按 teacherName 匹配 ID，存入对应教师记忆
- `wechat` → `wechatUnread[]`，群聊视图展示
- `diary` → `diary[]`，探索日志视图展示
- `masteredConcepts` → `courseMastery[courseName]`，知识点去重存储

### 4.5 教师记忆系统

```
teacherNotes: { [teacherId]: Note[] }
Note = { date, lesson, chapterNum, sectionNum, note }
```

- 每次上完课自动保存：授课教师 + 群聊参与教师
- 下节课注入 `buildSystemPrompt`：显示最近 5 条（倒序）
- 每人最多存 20 条（超出裁剪最早）
- 首次上课显示"你还没有教过这位学生，这是你们第一次见面"
- 持久化：LS `order_teacher_notes`

### 4.6 答题打怪系统

```
pickDifficulty（选择难度 1-5）
  → [选择同伴]（可选，消耗树产物道具）
  → generateQuestions（AI 出 10 题）
    → 返回 JSON 题目池
  → startBattle（初始化战斗 HUD）
    → 学生答题 → submitBattleAnswer()
      → 本地快速比对（去空格/C/小写/数值容差）
      → 匹配失败 → AI 判卷（一次调用：判断 + 反馈 + 同伴台词）
      → 正确：奖励 + startNextBattle()
      → 错误：无敌/护符/扣命
      → 10 题全对 + 满命 → BOSS 战
```

- 题目池 `combat.questionPool` 持久化到 LS（刷新不丢进度）
- 同伴消耗树产物道具（稀有道具附带无敌效果）
- AI 判卷一次调用完成判断 + 反馈 + 同伴台词
- 战斗死亡后清理：清空 questionPool、currentDifficulty、bossDefeated 等全部状态
- `pickDifficulty()` 先重置 `bossDefeated` 再检查池，避免 BOSS 标志残留

### 4.7 费曼萌宠系统

```
解锁条件 → 选蛋孵化 → 取名字
  → 反转课堂（主人教萌宠）
  → sendPetToAI()（萌宠用童趣语言提问，主人讲解）
  → endPetTeaching()
    → AI 生成 goldenEggs（金蛋数）
    → AI 提取 learnedWords（萌宠学会的词汇）
    → 金蛋累积 → 进化（蛋 → 幼雏 → 少年 → 成年 → 智者）
```

- 萌宠提示词来自 `system/feynman_pet_prompt.md`
- `pet.learnedWords`：`[{word, definition, learnedAt}]`
- 进化阶段阈值由 `PET_EVOLUTION_STAGES` 常量定义

### 4.8 群聊系统

- 课后 `postClassUpdate` 生成群聊消息 → `wechatUnread[]`
- 仿微信气泡 UI，左侧教师头像 + 气泡
- 支持单条删除 → 移入 `wechatArchive[]`
- 未读消息数在侧边栏红点显示

### 4.9 教材阅读器（独立页面）

`教材阅读器.html` — 独立 MD 渲染器：
- 侧边栏：课程树形目录（自动扫描 `教材/` 目录）
- 主区域：Markdown → HTML 渲染 + KaTeX 数学公式
- 中文章节标题自动识别（`一、` → h3，`【` → h4）
- 字数/行数统计
- 主题联动（读 LS `order_settings` 同步亮暗色）
- URL 参数自动加载（`?file=课程/第X章_X.X_标题.md`）
- 关键实现细节：**必须在渲染前规范化换行符** → `md.replace(/\r\n/g, '\n')`，否则 CRLF 文件段落不分割

---

## 五、持久化系统

### 5.1 存储键映射

所有 LS 键以 `order_` 为前缀：

| LS 键 | state 字段 | 说明 |
|-------|-----------|------|
| `order_api_key` | `apiKey` | DeepSeek API Key |
| `order_textbook_courses` | `textbookCourses` | 课程列表 |
| `order_textbook_outline` | `textbookOutline` | 当前大纲 |
| `order_textbook_sections` | `textbookSections` | 教材内容缓存 |
| `order_selected_course` | `selectedCourse` | 当前课程 |
| `order_teachers` | `teachers` | 教师列表 |
| `order_progress` | `progress` | 学习进度 |
| `order_teacher_notes` | `teacherNotes` | 教师记忆 |
| `order_rpg_trees` | `trees` | 三棵知识树 |
| `order_rpg_bonds` | `bonds` | 羁绊值 |
| `order_game_day` | `gameDay` | 游戏天数 |
| `order_game_time` | `gameTime` | 游戏时间 |
| `order_battle_player` | `player` | 玩家数值 |
| `order_battle_combat` | `combat` | 战斗状态 |
| `order_pet_data` | `pet` | 萌宠数据 |
| `order_wechat_unread` | `wechatUnread` | 群聊未读 |
| `order_wechat_archive` | `wechatArchive` | 群聊归档 |
| `order_diary` | `diary` | 探索日志 |
| `order_conversation_archives` | `conversationArchives` | 课堂归档 |
| `order_settings` | `settings` | 主题/字号 |

### 5.2 持久化方法

| 操作 | 触发时机 | 方法 |
|------|---------|------|
| 加载 | 启动时 `enterMain()` | `loadPersistentData()` |
| 保存 | 页面关闭（`beforeunload`）、关键操作后 | `saveAllState()` / 各处 `LS.set()` |
| 备份 | 用户手动点击 | `backupAllData()` → 下载 JSON 文件 |
| 恢复 | 用户上传 JSON | `restoreAllData()` → `handleRestoreFile()` |

### 5.3 新增持久化字段 checklist

修改 `app.js` 中以下 **4 处**：
1. `loadPersistentData()` — 添加 `LS.get('order_xxx', 默认值)`
2. `saveAllState()` — 添加 `LS.set('order_xxx', this.state.xxx)`
3. `backupAllData()` — 添加 `order_xxx: LS.get('order_xxx', {})`
4. `handleRestoreFile()` — keys 数组添加 `'order_xxx'`

---

## 六、关键常量位置（app.js 行号）

| 常量 | 行号 | 说明 |
|------|------|------|
| `MODEL_CONFIG` | 4 | `{name:'deepseek-chat', pricing:{input,output,cachedInput}, usdToCny:7.25}` |
| `SEED_DATA` | 25 | 所有内置提示词模板（systemMd, systemDetailMd, worldSettingMd 等） |
| `ITEM_EFFECTS` | 277 | 教学道具效果文本 |
| `LS` | 338 | localStorage 封装（get/set/remove，自动加 `order_` 前缀） |
| `INITIAL_TREES` | 349 | 三棵树初始状态 |
| `INITIAL_BONDS` | 355 | 初始羁绊值 |
| `COMPANION_MAP` | 395 | 道具 → 导师映射 |
| `LEVEL_TABLE` | 405 | 10 级玩家数值表 |
| `SHOP_ITEMS` | 418 | 商店物品 |
| `DIFFICULTY_CONFIG` | 426 | 战斗难度配置（1-5 级） |
| `PET_APPEARANCES` | 433 | 萌宠外观选项 |
| `PET_PERSONALITIES` | 439 | 萌宠性格选项 |
| `PET_EVOLUTION_STAGES` | 445 | 萌宠进化阶段阈值 |

---

## 七、App 方法分组索引

### 初始化
- `init()` — DOMContentLoaded 入口
- `activateStep(n)` — 欢迎向导步骤切换
- `saveApiKey()` / `loadResources()` / `enterMain()`

### 教材扫描与课程管理
- `scanDirectory(dirUrl)` — fetch 目录列表 HTML 并解析文件名
- `scanTextbooks()` — 扫描 `教材/` 下所有课程
- `_parseChapterFiles(files, coursePath)` — 文件名 → 章节大纲
- `rescanTextbooks()` — 手动重新扫描
- `switchCourse(courseName)` — 切换当前课程
- `fetchSection(filename)` — 获取单节教材内容（含缓存）
- `fetchWorldSetting()` — 获取世界观文件
- `getMaxSectionChars()` — 返回 2000（多选字数上限）

### 章节选择
- `selectSection(chNum, secNum, title, filename)` — 单选章节
- `toggleMultiSection(chNum, secNum, title, filename)` — 多选切换（含连续性检查）
- `_getFlatSections()` — 平铺章节列表（用于连续性检查）
- `_getPrimarySection()` — 获取首选章节（多选第一个或单选）
- `_updateStartBtn()` — 更新开始按钮状态
- `_showReadyState()` — 重置聊天空状态为"准备上课"

### 教师系统
- `scanTeachers()` — 扫描 `老师/` 目录 + 加载 `roster.json`
- `parseTeacherMd(md)` — 解析人设 Markdown
- `getCurrentTeacher()` — 获取当前选中教师
- `selectTeacher(id)` — 选择教师
- `renderTeacherSelect()` — 渲染教师卡片列表

### 持久化
- `parseProgressSeed()` — 解析进度种子数据
- `loadPersistentData()` — 从 LS 恢复全部 state
- `saveAllState()` — 保存全部 state 到 LS
- `backupAllData()` — 导出 JSON 备份文件
- `restoreAllData()` / `handleRestoreFile(file)` — 导入备份

### 教学核心
- `startClass()` — 开始上课
- `sendToAI(userMsg)` — 调用 DeepSeek API
- `buildSystemPrompt()` — 构建完整系统提示词
- `_buildLearnerProfile(knowledgeText)` — 动态生成学习者档案
- `sendMessage()` — 发送用户消息
- `endClass()` — 结束课程
- `postClassUpdate()` — AI 生成课后总结
- `showTokenStats()` — 显示 Token 统计

### RPG 系统
- `addTreeBranch(teacherName, topic)` — 知识树长枝
- `addBond(name, amount)` — 羁绊值增长
- `advanceGameTime()` — 推进游戏时间

### 战斗系统
- `saveBattleData()` — 保存战斗数据
- `getAvailableCompanions()` — 获取可用同伴
- `selectCompanion(itemKey)` — 选择同伴
- `pickDifficulty(level)` — 选择难度（含 BOSS 重置逻辑）
- `generateQuestions()` — AI 生成题目
- `startBattle()` — 开始战斗
- `submitBattleAnswer(answer)` — 提交答案（本地比对 + AI 判卷）
- `startNextBattle()` — 下一题
- `checkLevelUp()` — 检查升级
- `buyItem(itemId)` / `useItem(itemId)` / `equipItem(itemId)` / `unequipItem(slot)`

### 萌宠系统
- `renderPetView()` / `hatchPet()` / `startPetTeaching()`
- `sendPetToAI()` / `endPetTeaching()`
- `showPetWords()` / `showTeacherNotes()`
- `renderLearnedWordsPanel()` / `renderGoldenEggs()`
- `checkPetEvolution()` / `parseLearnedWords(text)`

### 群聊与日志
- `renderWechatView()` / `deleteWechatMsg(index)`
- `addDiary(content)` / `deleteDiary(index)` / `renderDiaryView()`

### 会话归档
- `saveConversationArchive()` — 保存当前对话
- `renderHistoryView()` — 渲染归档列表
- `viewArchiveDetail(index)` — 查看归档详情
- `deleteArchive(index)` — 删除归档
- `downloadArchive(index)` — 下载归档

### 侧边栏渲染
- `renderSidebar()` — 总渲染入口
- `renderTreesPanel()` — 知识树面板
- `renderItemsPanel()` — 道具背包面板
- `renderBattleSidebar()` — 战斗侧边栏
- `renderOutlineTree()` — 课程大纲树
- `updateStats()` — 更新角色数值
- `updateWechatBadge()` — 更新群聊未读标记

### 作业系统
- `startHomework()` / `sendHomeworkToAI()` / `sendHomeworkMessage()` / `endHomework()`
- `renderHomeworkView()`

### 工具函数
- `$(selector)` — `document.querySelector` 快捷方式
- `$$(selector)` — `document.querySelectorAll` 快捷方式
- `formatDate(date)` — 日期格式化
- `escapeHtml(str)` — HTML 转义

---

## 八、API 调用汇总

所有调用走 DeepSeek Chat API（`/v1/chat/completions`）：

| 方法 | system prompt | user prompt | response_format | 说明 |
|------|--------------|-------------|-----------------|------|
| `sendToAI()` | `buildSystemPrompt()` | 用户消息或初始提示 | 文本流 | 核心教学对话 |
| `postClassUpdate()` | 课后总结专用提示词 | 对话摘要 | `json_object` | 生成总结/群聊/日记/记忆 |
| `generateQuestions()` | 出题提示词 | 章节内容 | `json_object` | 生成 10 道战斗题目 |
| `submitBattleAnswer()` | 判卷提示词 | 题目+答案+同伴 | `json_object` | AI 判卷+反馈+同伴台词 |
| `sendPetToAI()` | 萌宠提示词 | 用户讲解 | 文本流 | 反转课堂 |
| `sendHomeworkToAI()` | 作业批改提示词 | 作业内容 | 文本流 | 作业批改 |

---

## 九、修改注意事项

### 9.1 架构约束

1. **单文件架构**：`app.js` 是全部逻辑，`App` 是全局对象（非模块）。所有方法通过 `App.methodName()` 调用，HTML onclick 也直接引用 `App.xxx()`。**不要尝试引入 ES 模块或拆分文件**（除非明确要求重构）。

2. **模板字面量**：`buildSystemPrompt()` 和多个 AI 提示词使用大量嵌套模板字面量，编辑时注意 `${}` 和反引号的配对。

3. **LS 键前缀**：所有 localStorage 键严格以 `order_` 为前缀。新增持久化字段必须同步修改 4 处（见 5.3）。

4. **中文文件名**：教材文件名含中文，`fetch` 时必须 `encodeURIComponent()`。

5. **section.num 是字符串**：如 `"1.1"`, `"1.1.1"`，不是数字。排序时需按点分拆后逐段用 `Number()` 比较。

### 9.2 常见陷阱

| 陷阱 | 说明 |
|------|------|
| Edit 工具匹配失败 | 代码含 tab/空格混用，Edit 工具对空白敏感。复杂替换用 Node.js 脚本 `fs.readFileSync` + 字符串替换 + `fs.writeFileSync` |
| 重复声明 | 插入代码前检查是否已有同名变量声明（如 `const allTeachers`） |
| async 遗漏 | `submitBattleAnswer()` 内部有 `await`，方法声明必须带 `async` |
| 作用域问题 | 变量在方法 A 声明但在方法 B 使用 → 改在方法 B 内部重新计算 |
| CRLF 换行符 | `教材阅读器.html` 的 `renderMD()` 必须先 `md.replace(/\r\n/g, '\n')` |
| innerHTML 覆盖 | `showTokenStats()` 写 `#chat-empty` 的 innerHTML 会销毁其中的按钮，应写 `#chat-empty-content` |
| 对象字面量逗号 | 在对象末尾加方法后再加方法，前面必须加逗号 |

### 9.3 教师系统关键字段

- 教师 ID = 文件名去 `.md`（如 `sonetto`, `gregor`）
- `namePure` = 去括号的中文名（用于 RPG 系统匹配）
- `name` = 含英文名（用于显示）
- `orderRole` = `'守护导师'` 或 `'使徒'`（影响羁绊增长量和 RPG 归属）
- `roster.json` 提供显示元数据（身份、颜色、角色等级），人设 `.md` 提供人格描述

### 9.4 主题系统

- CSS 变量定义在 `:root`（亮色）和 `[data-theme="dark"]`（暗色）
- 字体变量 `--font` 由 `fonts/custom-font.css` 覆盖
- 切换主题时同步更新 `document.documentElement` 属性和 LS `order_settings`

---

## 十、教师信息速查

| ID | 名称 | 角色等级 | 颜色 | 身份 |
|----|------|---------|------|------|
| `ganyu` | 甘雨 · 津梁（Ganyu） | 🌱 使徒 | `#5b8c5a` | 清华大学计算机系大一新生 |
| `gregor` | 格里高尔 · 觉醒者（Gregor） | 🌳 守护导师 | `#ad6741` | 明辨者，唤醒求知者的守护者 |
| `ishmael_v2` | 以实玛丽 · 航行者（Ishmael） | 🌳 守护导师 | `#3a5a7c` | 航海士，引领穿越知识风暴 |
| `keqing` | 刻晴 · 锐刃（Keqing） | 🌱 使徒 | `#9b6b9e` | 鞭策者，追求极致的精英剑士 |
| `march7` | 三月七 · 微光（March 7th） | 🌱 使徒 | `#d4879a` | 摄影师，用镜头捕捉知识之光 |
| `sonetto` | 十四行诗 · 炼金术士（Sonetto） | 🌳 守护导师 | `#c9a55e` | 文字炼金术师，将思想淬炼为真理 |

---

## 十一、调试命令速查

在浏览器控制台可用：

```js
// 查看当前状态
App.state.selectedCourse          // 当前课程
App.state.selectedSection         // 单选章节
App.state.selectedSections        // 多选章节列表
App.state.selectedTeacherId       // 当前教师 ID

// 查看学习者档案生成输入
App._buildLearnerProfile('')

// 查看 RPG 进度
JSON.stringify(App.state.progress.courseMastery, null, 2)

// 查看树状态
JSON.stringify(App.state.trees, null, 2)

// 查看羁绊状态
JSON.stringify(App.state.bonds, null, 2)

// 查看教师记忆
App.state.teacherNotes
App.showTeacherNotes('sonetto')   // 查看特定教师记忆

// 查看萌宠状态
App.state.pet
App.state.pet.learnedWords        // 学会的词汇

// 查看群聊
App.state.wechatUnread
```

---

*最后更新：2026-06-18 · 面向 Claude / DeepSeek 等 AI 开发者*
