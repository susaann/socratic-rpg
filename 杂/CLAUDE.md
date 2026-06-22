# 视界探索者教团 — 项目架构文档

> 苏格拉底式 AI 教学 RPG。纯前端 (HTML + CSS + JS + KaTeX)，通过 DeepSeek API 驱动多位教师角色进行一对一教学、群聊讨论、答题打怪、费曼萌宠等玩法。本地 Python http.server 运行。

## 项目概览

| 维度 | 详情 |
|------|------|
| 入口 | `index.html` → 加载 KaTeX + `app.js` |
| 主逻辑 | `app.js` (~4500 行，单文件，`const App = { ... }` 全局对象) |
| 样式 | `style.css` (~37KB) |
| AI | DeepSeek Chat API (`/v1/chat/completions`)，模型 `deepseek-chat` |
| 存储 | 浏览器 localStorage，键前缀 `order_` |
| 数学渲染 | 本地 KaTeX (`lib/katex/`) |
| 教材 | `教材/{课程名}/第N章_N.N_{标题}.md`，支持多级分节 (`1.1.1`) |

---

## 文件结构

```
6.13 rpg/
├── index.html              # 单页应用入口
├── style.css               # 全部样式
├── app.js                  # 全部逻辑 (~4500行)
├── CLAUDE.md               # 本文档
├── 数学符号面板.html        # LaTeX 符号输入面板
│
├── 教材/                    # 课程教材 (.md)
│   ├── 高等数学上册/         # 47 文件，第1-7章
│   ├── GEB/                 # 42 文件，第1-21章（对话+论述）
│   ├── C++ Primer Plus/     # 199 文件，第1-28章 + 附录
│   └── 生命进化的跃升/       # 40 文件，第1-10章
│
├── 老师/                    # 教师角色
│   ├── roster.json          # 显示元数据（名/身份/颜色）
│   ├── ganyu.md             # 甘雨 · 津梁（使徒）
│   ├── gregor.md            # 格里高尔 · 觉醒者（守护导师）
│   ├── ishmael_v2.md        # 以实玛丽 · 航行者（守护导师）
│   ├── keqing.md            # 刻晴 · 锐刃（使徒）
│   ├── march7.md            # 三月七 · 微光（使徒）
│   └── sonetto.md           # 十四行诗 · 炼金术士（守护导师）
│
├── system/                  # 系统提示词
│   ├── world_setting.md     # RPG 世界观
│   ├── homework_prompt.md   # 作业批改模板
│   └── feynman_pet_prompt.md # 萌宠提示词
│
├── teacher/                 # 教师系统文件（教学系统数据）
├── 习题集/                   # 战斗题库 (.txt)
├── homework/待批改/          # 作业批改
├── lib/katex/               # 本地 KaTeX 库
├── backup/                  # 历史备份
└── notes/                   # 课堂笔记模板
```

---

## App.state 核心数据结构

```js
App.state = {
  // ── 教学核心 ──
  apiKey: '',                    // DeepSeek API Key
  textbookCourses: [],           // [{courseName, coursePath, chapters, domainHint}]
  textbookOutline: [],           // 当前课程的章节大纲
  selectedCourse: '',            // 当前课程名
  selectedSection: null,         // {chapterNum, num, title, filename}
  textbookSections: {},          // 教材内容缓存 {filename: content}
  teachers: [],                  // [{id, name, namePure, role, personaBrief, ...}]
  selectedTeacherId: null,       // 当前教师 ID
  isClassActive: false,          // 上课中
  chatHistory: [],               // [{role, content}]
  classTokenUsage: { promptCacheHit, promptCacheMiss, completionTokens },
  activeItem: null,              // 激活的教学道具 key

  // ── 学习进度 ──
  progress: {
    completedLessons: 0,
    courseMastery: {},           // {[courseName]: string[]} 按课程分知识点
    masteredPoints: [],          // 旧版兼容
    lessonRecords: [],           // [{date, teacher, courseName, masteredConcepts, ...}]
    weakPoints: []
  },

  // ── 教师记忆 ──
  teacherNotes: {},              // {[teacherId]: [{date, lesson, note}]}

  // ── RPG 系统 ──
  trees: { oak, willow, laurel }, // 三棵知识树
  bonds: { '格里高尔': {value, level}, ... },
  gameDay: 1,
  gameTime: '晨间',              // 晨间→午后→黄昏→夜间→次日

  // ── 答题打怪 ──
  player: { level, xp, lives, maxLives, attack, defense, gold, inventory, equipment },
  combat: {
    isInBattle, isJudging, currentEnemy, questionPool,
    currentDifficulty, companion, bossDefeated, invincible, shielded, livesLostThisRound
  },
  exerciseBooks: [],             // [{filename, displayName}]

  // ── 萌宠系统 ──
  pet: { unlocked, name, appearance, personality, level, goldenEggs,
         evolutionStage, isTeaching, teachingMessages, learnedWords, ... },

  // ── 其他 ──
  wechatUnread: [],              // 群聊未读
  wechatArchive: [],             // 群聊归档
  diary: [],                     // 探索日志
  conversationArchives: [],      // 课堂归档
  homeworkActive, homeworkMessages, homeworkFiles, // 作业系统
  settings: { theme, fontSize }
};
```

---

## 核心系统架构

### 1. 启动流程

```
DOMContentLoaded → App.init()
  → loadSettings(), 检查 apiKey
  → 用户输入 Key → saveApiKey()
  → 用户点击加载 → loadResources()
      → scanTeachers()    (老师/ 目录)
      → scanTextbooks()   (教材/ 目录)
  → 用户点击进入 → enterMain()
      → 初始化 LS 默认值
      → loadPersistentData()   (读取全部 LS 到 state)
      → 自动扫描教材（如 LS 无数据）
      → 扫描习题集、作业文件
      → 注册 beforeunload → saveAllState()
```

### 2. 上课流程 (教学核心)

```
选择课程 → switchCourse()
选择章节 → selectSection()  →  启用按钮
选择教师 → selectTeacher()  →  启用按钮
点击上课 → startClass()
  → buildSystemPrompt()      # 构建完整系统提示词
      ├── 9条重要指令（教学优先）
      ├── 当前章节教材内容
      ├── 本节教学要点（4步路线图）
      ├── 苏格拉底规则 + 系统细节
      ├── 教师人设 + 记忆段落
      ├── 学习者档案（动态生成）
      └── 世界观
  → sendToAI()               # 调用 DeepSeek API
  → AI 提问 → 学生回答 → sendMessage() → sendToAI() → 循环
  → 结束 → endClass()
      ├── addTreeBranch()    # 知识树长枝
      ├── addBond()          # 羁绊增长
      ├── postClassUpdate()  # AI 生成：总结/日记/群聊/教师记忆
      ├── saveConversationArchive()
      └── showTokenStats()
```

### 3. System Prompt 结构 (buildSystemPrompt)

当前顺序（教学优先）：
1. **重要指令** (9条) — 教学优先、苏格拉底法、格式、氛围限制
2. **道具效果**（如有激活）
3. **教材内容** — 当前章节全文
4. **教学要点** — 4步路线图
5. **苏格拉底规则** (SEED_DATA.systemMd)
6. **系统细节** (SEED_DATA.systemDetailMd)
7. **教师人设** + 角色对话示例 + 记忆段落
8. **学习者档案** — 动态生成（_buildLearnerProfile）
9. **世界观** — RPG 氛围（最后）

### 4. 课后总结 (postClassUpdate)

一次 API 调用，返回 JSON（`response_format: json_object`）：
```json
{
  "summary": "掌握/薄弱/学习特点",
  "masteredConcepts": ["概念1", "概念2"],
  "teacherNote": "授课教师 150字教学笔记",
  "participantNotes": [{"teacherName": "...", "note": "100字内"}],
  "diary": "旅者第一人称 300-500字日志",
  "wechat": [{"sender": "教师名", "content": "发言"}]
}
```
- `teacherNote` → `teacherNotes[teacherId]`，下节课注入系统提示
- `participantNotes` → 群聊参与教师的观察也存入各自记忆
- `wechat` → `wechatUnread`，群聊视图展示
- `diary` → `diary` 数组

### 5. 教师记忆系统

```
teacherNotes: { [teacherId]: Note[] }
Note = { date, lesson, chapterNum, sectionNum, note }
```
- 每次上完课保存（授课教师 + 群聊参与者）
- 下节课注入 `buildSystemPrompt`：显示最近 5 条
- 每人最多存 20 条
- 持久化：LS `teacher_notes`

### 6. 知识点存储 (courseMastery)

```
progress.courseMastery = {
  "高等数学": ["极限定义", "夹逼定理", ...],
  "GEB": ["自指", "同构", ...],
  ...
}
```
- 每次 `postClassUpdate` 从 `masteredConcepts` 提取并写入
- 系统提示词的学习者档案和学习进度均从真实数据动态生成
- 兼容旧版 `masteredPoints` 扁平数组

### 7. 答题打怪系统

```
pickDifficulty → [选同伴] → generateQuestions (AI出10题)
  → startBattle → submitBattleAnswer
    → 本地快速比对（去空格/去+C/小写/数值容差）
    → 失败则 AI 判卷（同时让陪同老师说一句）
    → 正确：奖励 + startNextBattle
    → 错误：无敌/护符/扣命
    → 10题全对 + 满命 → BOSS战
```
- 题目池 `combat.questionPool` 持久化到 LS
- 同伴消耗树产物道具，稀有道具附带无敌
- AI 判卷一次调用完成判断+反馈+同伴台词

### 8. 费曼萌宠系统

```
解锁 → 选蛋孵化 → 取名字 → 反转课堂（主人教萌宠）
  → sendPetToAI()（萌宠提问，主人讲解）
  → endPetTeaching() → AI 生成金蛋 + 提取学会的词
  → 金蛋积累 → 进化
```
- 萌宠提示词来自 `system/feynman_pet_prompt.md`
- 词库 `pet.learnedWords`：`[{word, definition, learnedAt}]`
- 进化阶段：蛋→幼雏→少年→成年→智者

### 9. 持久化系统

| 操作 | 触发时机 | 方法 |
|------|---------|------|
| 加载 | 启动时 | `loadPersistentData()` |
| 保存 | 页面关闭、关键操作后 | `saveAllState()` / 各处 `LS.set()` |
| 备份 | 用户手动 | `backupAllData()` → 下载 JSON |
| 恢复 | 用户手动 | `restoreAllData()` → 上传 JSON → `handleRestoreFile()` |

所有 LS 键以 `order_` 为前缀：
`order_progress`, `order_teacher_notes`, `order_rpg_trees`, `order_rpg_bonds`,
`order_battle_player`, `order_battle_combat`, `order_pet_data`,
`order_textbook_courses`, `order_conversation_archives`, 等

---

## 关键常量位置

| 常量 | 行号 | 说明 |
|------|------|------|
| `MODEL_CONFIG` | 4 | deepseek-chat 定价 |
| `SEED_DATA` | 25 | 所有内置提示词模板 |
| `LS` | 338 | localStorage 封装 |
| `INITIAL_TREES` | 349 | 三棵树初始状态 |
| `INITIAL_BONDS` | 355 | 初始羁绊值 |
| `COMPANION_MAP` | 395 | 道具→导师映射 |
| `LEVEL_TABLE` | 405 | 10级数值表 |
| `SHOP_ITEMS` | 418 | 商店物品 |
| `DIFFICULTY_CONFIG` | 426 | 战斗难度配置 |
| `ITEM_EFFECTS` | 277 | 教学道具效果文本 |
| `PET_APPEARANCES` | 433 | 萌宠外观 |
| `PET_PERSONALITIES` | 439 | 萌宠性格 |
| `PET_EVOLUTION_STAGES` | 445 | 萌宠进化阶段 |

---

## App 方法分组索引

### 初始化 (536-638)
`init`, `activateStep`, `saveApiKey`, `loadResources`, `enterMain`

### 教材扫描 (641-956)
`scanDirectory`, `scanTextbooks`, `_parseChapterFiles`, `rescanTextbooks`,
`switchCourse`, `fetchSection`, `fetchWorldSetting`, `fetchFeynmanPetPrompt`,
`_aiGenerateDomainHint`, `_fetchCourseDomainMd`

### 教师系统 (1008-1093)
`scanTeachers`, `parseTeacherMd`, `getCurrentTeacher`, `selectTeacher`, `renderTeacherSelect`

### 持久化 (1096-1158, 3310-3411)
`parseProgressSeed`, `loadPersistentData`, `saveAllState`, `backupAllData`, `restoreAllData`, `handleRestoreFile`

### RPG 系统 (1162-1191)
`addTreeBranch`, `addBond`, `advanceGameTime`

### 战斗系统 (1204-2278)
`saveBattleData`, `getAvailableCompanions`, `selectCompanion`, `pickDifficulty`,
`generateQuestions`, `startBattle`, `submitBattleAnswer`, `startNextBattle`,
`checkLevelUp`, `buyItem`, `useItem`, `equipItem`, `unequipItem`

### 教学核心 (2506-3134)
`startClass`, `sendToAI`, `buildSystemPrompt`, `_buildLearnerProfile`,
`sendMessage`, `endClass`, `postClassUpdate`, `showTokenStats`

### 会话归档 (3059-3290)
`saveConversationArchive`, `renderHistoryView`, `viewArchiveDetail`, `deleteArchive`, `downloadArchive`

### 侧边栏渲染 (1944-2461)
`renderSidebar`, `renderTreesPanel`, `renderItemsPanel`, `renderBattleSidebar`,
`renderOutlineTree`, `updateStats`, `updateWechatBadge`

### 战斗视图渲染 (1334-2181)
`renderBattleView`, `renderHudHtml`, `renderBattleLogHtml`, `renderShopHtml`, `renderBattleInventoryHtml`

### 作业系统 (3475-3702)
`startHomework`, `sendHomeworkToAI`, `sendHomeworkMessage`, `endHomework`, `renderHomeworkView`

### 萌宠系统 (3707-4320)
`renderPetView`, `hatchPet`, `startPetTeaching`, `sendPetToAI`, `endPetTeaching`,
`showPetWords`, `showTeacherNotes`, `renderLearnedWordsPanel`,
`renderGoldenEggs`, `checkPetEvolution`, `parseLearnedWords`

### 群聊与日志 (4335-4430)
`renderWechatView`, `deleteWechatMsg`, `addDiary`, `deleteDiary`, `renderDiaryView`

### 工具函数 (323, 4433)
`$`, `$$`, `formatDate`, `escapeHtml`

---

## 修改注意事项

1. **单文件架构** — `app.js` 是全部逻辑，`App` 是全局对象（非模块）。所有方法通过 `App.methodName()` 调用，HTML onclick 也直接引用 `App.xxx()`。

2. **LS 键前缀** — 所有 localStorage 键都以 `order_` 为前缀。新增持久化字段需要同时修改 `loadPersistentData()`、`saveAllState()`、`backupAllData()`、`handleRestoreFile()` 四处。

3. **模板字面量** — `buildSystemPrompt()` 和多个 AI 提示词使用大量嵌套模板字面量。编辑时注意 `${}` 和反引号的配对。建议用 Node.js 脚本做批量替换。

4. **批量编辑** — 项目历史中多次遇到 Edit 工具因空格/换行符不匹配失败。对于复杂替换，写 `_fix_*.js` 脚本用 `fs.readFileSync` + 字符串替换 + `fs.writeFileSync` 是可靠方案。

5. **教师 ID** — 教师 ID 来自文件名去 `.md`（如 `sonetto`、`gregor`），与 `roster.json` 中的 `id` 字段对应。`namePure` 是去括号的中文名，用于 RPG 系统匹配；`name` 含英文名用于显示。

6. **API 调用** — 全部走 DeepSeek Chat API。`sendToAI` 用于教学、`generateQuestions` 用于出题、`submitBattleAnswer` 用于 AI 判卷。判卷和陪同老师提示已合并为一个调用。

7. **文件路径编码** — 教材文件名含中文，fetch 时必须 `encodeURIComponent()`。

8. **section.num** — 是字符串（如 `"1.1"`, `"1.1.1"`），不是数字。排序时需按点分拆后逐段比较。
