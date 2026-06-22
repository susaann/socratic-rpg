# 苏格拉底式高数教学系统 — 网页版

> 基于 DeepSeek API 的苏格拉底式一对一教学网页应用。六位风格各异的虚拟教师，以全程问题引导的方式，让你自己推理出知识的全貌。

---

## 快速启动

### 1. 准备 API Key

前往 [DeepSeek 开放平台](https://platform.deepseek.com/) 获取 API Key。

### 2. 启动本地服务器

由于浏览器同源策略限制，需要通过 HTTP 服务器打开（不能直接双击 HTML 文件）。

**Windows / macOS / Linux（推荐）：**

```bash
# 在项目根目录下执行
python -m http.server 8000
```

**或使用 Node.js：**

```bash
npx serve .
```

### 3. 打开浏览器

访问 **[http://localhost:8000](http://localhost:8000)**

### 4. 初始化

1. 在欢迎页输入你的 DeepSeek API Key
2. 点击「加载资源」自动扫描 `教材/` 和 `老师/` 目录
3. 点击「进入系统」开始学习

---

## 文件结构

```
苏格拉底学习高数 - 网页3/
├── index.html          ← 主页面
├── style.css           ← 样式文件
├── app.js              ← 全部前端逻辑
├── 教材/                ← 教材 .md 文件（可自由添加/替换）
├── 老师/                ← 教师人设 .md 文件（6位，可自由添加）
├── teacher/             ← 系统文件（已内嵌为种子数据）
└── README.md            ← 本文件
```

## 动态扫描机制

- **教材**：启动时自动 fetch `教材/` 目录 HTML 列表，解析所有 `.txt` 文件名生成章-节树形大纲
  - 文件命名格式：`第X章_X.Y_标题.txt`
  - 放入新教材 → 刷新页面 → 自动出现在大纲中
- **教师**：启动时自动 fetch `老师/` 目录 HTML 列表，加载所有 `.md` 人设文件
  - 放入新人设 → 刷新页面 → 自动出现在教师列表中
  - 也可通过 UI「导入新教师」按钮手动添加（存储在 localStorage）

## 功能模块

| 模块 | 说明 |
|------|------|
| 课程大纲 | 动态扫描 `教材/` 生成，树形可折叠，含进度标记 |
| 教师管理 | 动态扫描 `老师/` 加载，支持自定义导入 |
| 苏格拉底对话 | 核心教学模块，调用 DeepSeek API，每次只提一个问题 |
| 做题批改 | 独立面板，支持选择/填空/计算/证明四种题型 |
| 微信群聊 | 仿微信风格气泡，课后自动生成教师讨论 |
| 学习日记 | AI 自动生成 + 手动撰写，按日期倒序展示 |
| 主题切换 | 亮色/暗色模式切换 |

## 技术栈

- 纯前端（HTML + CSS + JS）
- DeepSeek Chat Completions API
- KaTeX 数学公式渲染（CDN）
- localStorage 数据持久化
- 响应式设计（桌面 + 移动端）

## 数据存储

所有数据存储在浏览器 localStorage，Key 前缀为 `socratic_`：

| 键名 | 内容 |
|------|------|
| `api_key` | DeepSeek API Key |
| `textbook_outline` | 教材章节树 JSON（从 `教材/` 扫描） |
| `textbook_sections` | 教材正文缓存 |
| `teacher_profiles` | 教师人设 JSON（从 `老师/` 扫描） |
| `custom_teachers` | 用户导入的自定义教师 |
| `progress` | 学习进度 |
| `chat_history` | 当前对话记录 |
| `exercise_history` | 批改历史 |
| `wechat_unread` | 群聊未读消息 |
| `wechat_archive` | 群聊已读归档 |
| `diary` | 学习日记 |
| `settings` | 主题等设置 |

## 使用提示

- 发送消息按 `Enter`，换行按 `Shift+Enter`
- 卡住时点「我卡住了」按钮，AI 会降低难度或给提示
- 每节课结束后 AI 会自动生成：学习总结、课后日记、微信群聊
- 对话过程中可以随时切换到做题批改、日记、群聊面板

---

*—— 祝你学习愉快 ——*
