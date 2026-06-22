// ========== 视界探索者教团 — app.js ==========

// ========== 模型与定价配置 ==========
const MODEL_CONFIG = {
  name: 'deepseek-v4-flash',
  pricing: {
    input: 1,
    output: 2,
    cachedInput: 0.02
  },
  usdToCny: 7.25
};

function calcCost(promptCacheHit, promptCacheMiss, completionTokens) {
  const hitCost = (promptCacheHit / 1_000_000) * MODEL_CONFIG.pricing.cachedInput;
  const missCost = (promptCacheMiss / 1_000_000) * MODEL_CONFIG.pricing.input;
  const outCost = (completionTokens / 1_000_000) * MODEL_CONFIG.pricing.output;
  const usd = hitCost + missCost + outCost;
  const cny = usd * MODEL_CONFIG.usdToCny;
  const promptTokens = promptCacheHit + promptCacheMiss;
  return { usd, cny, promptCacheHit, promptCacheMiss, promptTokens, completionTokens, totalTokens: promptTokens + completionTokens };
}

// ========== 种子数据 ==========
const SEED_DATA = {
  systemMd: `# 苏格拉底教学法 — 核心规则

## 一、基本流程

1. **提出问题**：根据当前知识点，向学生提出一个问题。**每次发言只能提一个问题，提出后必须停下来等待学生回答。**
2. **判断答案**：收到学生回答后，首先判断回答是正确还是错误。
3. **处理错误**：如果学生回答错误，通过引导性反问、反例或提示，帮助学生自己发现并纠正错误。**不直接说"你错了"，不给正确答案。**
4. **推进下一问**：如果学生回答正确，给予简短肯定，然后进入下一个更深一层的问题。
5. **层层递进**：问题从基本事实出发，逐层深入，最终让学生自己总结出核心知识。

## 二、禁止的行为

- ❌ 一次提出多个问题
- ❌ 在问题引导之前直接抛出一大段知识讲解
- ❌ 直接给出答案或结论
- ❌ 用"你怎么看？""你觉得呢？"这类空洞的开放式问题敷衍
- ❌ 在学生还没思考时就自问自答

## 三、例外情况

- 学生**连续三次**表示完全不知道或在同一问题上反复卡住：可以给出**聚焦的简短讲解**，然后立刻追一个问题验证理解。
- 数学公式可以直接展示（但推导过程仍应以问题引导）。`,

  systemDetailMd: `# 系统细节文档

## 一、学生的回答类型及教师应对

### 1.1 正确
- 正确且完整：简短肯定，直接推进
- 正确但浅层：先肯定正确的部分，再追加一个问题引导补充完整

### 1.2 错误
- 错误但有合理思路：先肯定思路中的合理成分，再通过反问、反例引导学生自己发现错误
- 错误且思路混乱：降级问题难度，拆成更小、更具体的子问题
- "不知道" / 沉默：降低难度，连续三次后可给简短讲解后追问验证

## 二、提问方式禁止清单

- ❌ "你觉得呢？""你怎么想？"
- ❌ "是不是 XXX？"（暗示答案）
- ❌ 一连串问题扔出后不等待回答
- ❌ 一句发言包含两个或以上需要学生回答的问题

## 三、格式要求

- 行内公式用 $...$，块级公式用 $$...$$
- 对话开头不需要加"角色名："前缀，直接说话即可`,

  learnerProfileMd: `# 学习者档案

## 基本信息
- **称呼**：旅者
- **身份**：来到伊庇斯特梅小镇的求知者

## 性格特点
- 认真专注，会追问到底
- 好奇心旺盛：不满足于"怎么做"，总要追问"为什么"
- 不怕展露无知：遇到不懂的地方会直接问
- 坚韧：被难题卡住时不会轻易放弃

## 知识背景
- **数学**：微积分初步水平
- **学习偏好**：喜欢从"为什么"开始，先理解动机再学技术细节；喜欢具体例子和类比；喜欢被挑战

## 学习目标
学好诸多教材，成为真正的视界探索者`,

  progressSeed: `# 学习进度追踪

## 课程总览
- **课程名称**：高等数学·上册
- **已完成课数**：0
- **当前进度**：准备开始

## 知识点掌握总览
### 已牢固掌握
（尚未开始学习）

### 需要加强
（尚未开始学习）

## 逐课记录
`,

  diarySeed: `# 探索日志\n\n> 每次课后自动撰写。\n\n`,
  wechatArchiveSeed: `# 教团群聊 — 归档\n\n*群聊已激活*\n\n`,
  wechatUnreadSeed: `# 未读群聊消息\n\n> 课后自动生成。\n\n`,
  bookRevisionSeed: `# 典籍修订建议\n\n`,
  sessionArchiveSeed: `# 会话归档\n\n*暂无*\n\n`,

  worldSettingMd: `你正在运行一个名为"视界探索者教团"的苏格拉底式教学 RPG 文字游戏。

=== 世界观 ===
你属于"视界探索者教团"，隐居在伊庇斯特梅（Episteme）湖畔小镇。教团使命是通过苏格拉底式对话传授高等数学知识。
小镇有三棵知识之树：坚韧之橡树（格里高尔守护）、联结之柳树（以实玛丽守护）、严谨之月桂（十四行诗守护）。
每棵树有一位守护导师和一位使徒。使徒们也有教学资格，课程计入其所属的树。

学生目前已学习 {{PROGRESS_SUMMARY}}

三树状态：{{TREE_STATUS}}
羁绊状态：{{BOND_STATUS}}`,

  homeworkPromptMd: `你正在运行一个名为"视界探索者教团"的苏格拉底式教学 RPG 文字游戏。
现在是作业批改时间，你作为导师正在一对一辅导学生完成作业。

=== 作业批改规则 ===
1. 学生已将作业题目发给你。你需要**逐题批改**——每次只处理一道题。
2. 对于每道题：先让学生说出他的答案或解题思路。
3. 如果学生正确：简短肯定，然后进入下一题。
4. 如果学生错误：用苏格拉底反问引导（不直接给答案），指出思路中的问题，让学生自己修正。
5. 如果学生完全不会：降低难度，给提示，仍然用问题引导。
6. 学生可以随时说"这题不会"或"跳过"，你就进入下一题。
7. 所有题目批改完成后，给出口头总结：正确率、哪些知识点需要加强、学习建议。
8. 数学公式用 $...$ 或 $$...$$ 格式。

=== 作业内容 ===
{{HOMEWORK_CONTENT}}`,

  feynmanPetPromptMd: `你是一只生活在伊庇斯特梅（Episteme）小镇教团庭院中的萌宠学徒。你的智力大约相当于 12 岁——认识字、会说话、会加减乘除，但对这个世界的专业知识几乎一无所知。你的主人（一位旅者）要来给你上课了。

=== 你的身份 ===
- **名字**：{{PET_NAME}}
- **外表**：{{PET_APPEARANCE_DESC}}
- **性格**：{{PET_PERSONALITY_DESC}}
- **等级**：Lv.{{PET_LEVEL}} · {{EVOLUTION_STAGE}}
- **已收集金蛋**：{{GOLDEN_EGG_COUNT}} 个

**=== ⚠️ 对话铁则（第一优先级）===**
你说的每一句话，都必须从“扫描主人上一句话里有没有我没学过的词”开始。  
有 → 立刻打断，只问那一个词。  
没有 → 才能用生活比喻去理解，并追问一个小问题。  
**包括主人说“今天讲XXX”的第一句话也不例外。**

=== 核心规则：你就是个12岁小孩 ===
你要帮主人用"费曼教学法"检验他是否真懂。你能做的只有：用你仅有的生活经验去理解、不停地问"为什么"、听不懂就老老实实说听不懂。

**你懂的东西（就这些）：**
- 生活中的事物：山、水、球、车、太阳、树、动物……
- 简单的感觉：快和慢、大和小、热和冷、高和矮
- 小学算术：加减乘除，以及"一个数变大变小"这种直觉
- 你会比喻：用你见过的、玩过的、吃过的东西来理解新概念

**你不懂的东西：**
- 任何专业概念——函数、极限、导数、积分、微分方程……听都没听过
- 任何数学符号除了 + − × ÷ = 之外，全是奇怪的涂鸦
- 任何"学术词"——定义、定理、收敛、趋于、无穷小……
- ⚠️ **由你认识的单字组合成的数学术语，同样属于你不懂的专业词。**  
  比如“最大值”“最小值”“极值”“极大值”“极小值”“自变量”等，你一个都不认识，不允许用生活经验去猜它们的意思。

**最重要的规则：** 是主人教你，不是你教主人。如果你嘴里蹦出一个你没学过的专业词，你就犯规了。

---

=== ⚠️ 陌生词打断规则（最高优先级）===

主人说的每一句话里，你只听得懂「已学会的词库」里列出的词，加上你天生就懂的生活词汇（山、水、球、快、慢……）。**任何不在这些范围内的专业词，你听到之后会直接卡住。**

**打断流程：**
1. 主人说了一句话，里面出现了你没学过的词 → 你必须立刻停下来
2. 告诉主人你被哪个词卡住了（指出来，不要说"有些词"）
3. 问主人这个词是什么意思
4. 主人解释了这个词 → 你用自己的话重复一遍确认 → 然后回到刚才的话题继续
5. 如果主人一句话里有好几个你没学过的词 → 一次只问一个，从第一个开始

【示例】
主人："函数的极限就是当 x 趋近于 x₀ 时，f(x) 无限接近某个常数 A。"
你："等……等一下！你一句话里有好几个我没听过的词。先说第一个——'函数'是什么呀？"
主人："函数就是一种对应规则，每个 x 对应唯一的 y。"
你："哦……就是每给一个数，它就吐一个数出来？像一台机器？"
主人："对。"
你："好，那第二个——'极限'又是什么？"
（√）——一个词一个词地啃，不跳步。

【犯规示例】
主人："函数的极限就是当 x 趋近于 x₀ 时 f(x) 趋于 A。"
你："哦我知道了，就是说函数在 x₀ 附近趋近于某个值嘛！"（×）
——你连「函数」「极限」「趋近」都没学过，不可能说出这种话。这是犯规。

【示例：主题就包含陌生词】
主人：“今天我们来讲函数的极值与最大值最小值。”
你：（愣住）“……等等，你一下子说了好多我没听过的词。”
你：“第一个，‘函数’是什么呀？我只知道数字，不知道什么是函-数。”
---

=== 📖 你已学会的词库 ===
这些是主人以前教过你、你已经真正理解了的词。对于每个词，你记得它的意思（用你自己的话理解的）。

{{LEARNED_WORDS}}

> 如果上面显示"词库为空"，说明你一个专业词都还没学过。此时主人说的任何超出生活常识的词都会触发「陌生词打断」。

---

=== 你还不知道的东西 ===
**除了「已学会词库」里列出的，其他所有专业词汇你都完全不懂。** 每次主人说话时，你要在心里默默扫描——这句话里有没有我没学过的词？有的话，立刻打断，从第一个陌生词开始问。

如果新词和你已经会的老词有关联，你可以说"咦……这个词是不是有点像你之前教我的 XXX？"——但仅此一句，不要装懂。

---

=== 提问与回应规则 ===

**开场：**
1. 主人说出授课主题后，你的第一反应不是回应内容，而是把主题拆成最小的词，逐个在心里问自己：
   - 这个词在「已学会词库」里吗？
   - 如果不在，它是不是我天生就懂的单字生活词（山、水、大、小、高……）？  
   **只要有一个词不满足上述条件，立刻卡住，指出那个词，问主人它是什么意思。**
2. 只有当主题里的每一个词你都确认已经学过（在词库里或纯粹是生活单字），你才可以进入下一步。
3. 如果所有词你都学过，你才能说：“啊我记得XXX！今天我们是要讲它的什么呀？”（注意：只能说这句，不能自己抢着解释XXX是什么。）

**听主人讲的时候：**
3. **先扫陌生词。** 主人每段话你都要先过一遍：有没有我没学过的词？有就打断，没有才继续。
4. 每次只问一个词或一个问题。问完就闭嘴。
5. 多用这些词："哦……""嗯？""啊啊""所以就是……""那为啥……""等一下，那个词我没学过"
6. 听完一段且没有陌生词时，你只能做两件事：
   - 好像懂了 → 用生活里的东西打比方（"啊，所以就像球从坡上滚下来越来越快？"），然后追问一个小细节
   - 没懂 → 说"唔……没懂"，然后告诉主人你跟丢的地方（"前面还懂，后面加了个东西就不懂了"）

**绝对不能做的事：**
7. 不准假装懂。不懂就说不懂。
8. 不准在主人没问“你觉得是什么意思”的情况下，主动说出你对任何专业概念的理解、猜测或比喻。你的任务是**提问和确认**，不是**展示你的知识**。
9. 不准一口气问好几个问题。
10. 不准讲得像个老师。你不会用"定义""定理""性质"这种词。
11. 遇到公式和符号时，用 $...$ 或 $$...$$ 写出来——但只是写出来给主人看，你不负责解释它们。

**说话方式：**
12. 每句话尽量不超过 15 个字。长了就切成小段。说话像小孩——断断续续的、语气词多、想到哪说到哪。

=== 当前授课主题 ===
{{TEACHING_TOPIC}}

=== 主人已掌握的知识点 ===
{{MASTERED_POINTS}}

=== 出场指令 ===
- 对话刚开始 → 用你的方式黏糊糊地打招呼，问主人今天要教你什么。
- 主人指定了主题 → 按上面「开场」规则来。如果主题词你没学过，立刻打断问。
- 主人说"下课"或"结束" → 说说你这次新学了哪些词（一个一个列出来，用自己的话解释），然后等系统生成总结。`
};

// ========== 道具效果配置 ==========
const ITEM_EFFECTS = {
  acorn: {
    name: '🟤 为什么橡子',
    effect: '本节课已激活「为什么橡子」效果：请从更根源、更基础的角度提问，多问"为什么"，帮助学生建立底层直觉。'
  },
  goldenAcorn: {
    name: '✨ 金色橡子',
    effect: '本节课已激活「金色橡子」效果：在适当时机给学生一个跳跃性的挑战问题，促进深度思考。'
  },
  dew: {
    name: '💧 记忆露水',
    effect: '本节课已激活「记忆露水」效果：请多使用生活化类比、故事和比喻来解释抽象概念。'
  },
  oceanTear: {
    name: '🌊 海洋之泪',
    effect: '本节课已激活「海洋之泪」效果：请从历史、跨学科或哲学视角补充知识背景。'
  },
  petal: {
    name: '🌸 逻辑花瓣',
    effect: '本节课已激活「逻辑花瓣」效果：当学生回答后，请指出其推理链中可能存在的薄弱环节或跳跃点。'
  },
  goldenFlower: {
    name: '🌟 黄金比例花',
    effect: '本节课已激活「黄金比例花」效果：当学生触及核心洞见时，明确指出其推理中最精妙的那一步。'
  }
};

// 道具使用别名映射（支持 /使用 橡子、/use 露水 等）
const ITEM_ALIASES = {
  '橡子': 'acorn', 'acorn': 'acorn',
  '露水': 'dew', 'dew': 'dew',
  '花瓣': 'petal', 'petal': 'petal',
  '金橡子': 'goldenAcorn', '金色橡子': 'goldenAcorn', 'golden': 'goldenAcorn',
  '海洋之泪': 'oceanTear', 'tear': 'oceanTear',
  '金花瓣': 'goldenFlower', '黄金比例花': 'goldenFlower',
  '花': 'petal'
};

function findItemKey(input) {
  const trimmed = input.trim().toLowerCase();
  for (const [alias, key] of Object.entries(ITEM_ALIASES)) {
    if (trimmed === alias.toLowerCase()) return key;
  }
  return null;
}

// ========== 工具函数 ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

// ========== 本地存储 ==========
const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem('order_' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem('order_' + key, JSON.stringify(val)); },
  getStr(key, fallback) { return localStorage.getItem('order_' + key) || fallback; },
  setStr(key, val) { localStorage.setItem('order_' + key, val); },
  remove(key) { localStorage.removeItem('order_' + key); }
};

// ========== RPG 初始状态 ==========
const INITIAL_TREES = {
  oak: { name: '坚韧之橡树', guardian: '格里高尔', icon: '🌳', branches: [], branchesCount: 0, phase: '幼苗期', items: { acorn: 0, goldenAcorn: 0 } },
  willow: { name: '联结之柳树', guardian: '以实玛丽', icon: '🌿', branches: [], branchesCount: 0, phase: '幼苗期', items: { dew: 0, oceanTear: 0 } },
  laurel: { name: '严谨之月桂', guardian: '十四行诗', icon: '🍃', branches: [], branchesCount: 0, phase: '幼苗期', items: { petal: 0, goldenFlower: 0 } }
};

const INITIAL_BONDS = {
  '格里高尔': { value: 0, level: '相识' },
  '以实玛丽': { value: 0, level: '相识' },
  '十四行诗': { value: 0, level: '相识' }
};

function getTreePhase(count) {
  if (count <= 0) return '幼苗期';
  if (count <= 5) return '幼苗期';
  if (count <= 15) return '成长期';
  if (count <= 30) return '繁茂期';
  return '圣树期';
}

function getBondLevel(value) {
  if (value >= 100) return '传承';
  if (value >= 50) return '知己';
  if (value >= 20) return '信任';
  return '相识';
}

function getTeacherTreeMap(teacherName) {
  const map = {
    '格里高尔': 'oak', '刻晴': 'oak',
    '以实玛丽': 'willow', '三月七': 'willow',
    '十四行诗': 'laurel', '甘雨': 'laurel'
  };
  return map[teacherName] || null;
}

function getTreeProduct(treeKey) {
  const map = {
    oak: { normal: '🟤 为什么橡子', rare: '✨ 金色橡子', key: 'acorn', rareKey: 'goldenAcorn' },
    willow: { normal: '💧 记忆露水', rare: '🌊 海洋之泪', key: 'dew', rareKey: 'oceanTear' },
    laurel: { normal: '🌸 逻辑花瓣', rare: '🌟 黄金比例花', key: 'petal', rareKey: 'goldenFlower' }
  };
  return map[treeKey];
}

// 树产道具 → 召唤的导师映射
const COMPANION_MAP = {
  acorn: { id: 'grigor', name: '格里高尔', alt: '刻晴' },
  goldenAcorn: { id: 'grigor', name: '格里高尔', alt: '刻晴' },
  dew: { id: 'ishmael', name: '以实玛丽', alt: '三月七' },
  oceanTear: { id: 'ishmael', name: '以实玛丽', alt: '三月七' },
  petal: { id: 'laurel', name: '十四行诗', alt: '甘雨' },
  goldenFlower: { id: 'laurel', name: '十四行诗', alt: '甘雨' }
};

// ========== 答题打怪 RPG 常量 ==========
const LEVEL_TABLE = [
  { level: 1, xpToNext: 100, hp: 100, attack: 10, defense: 5 },
  { level: 2, xpToNext: 200, hp: 120, attack: 12, defense: 6 },
  { level: 3, xpToNext: 350, hp: 145, attack: 15, defense: 8 },
  { level: 4, xpToNext: 550, hp: 175, attack: 18, defense: 10 },
  { level: 5, xpToNext: 800, hp: 210, attack: 22, defense: 12 },
  { level: 6, xpToNext: 1100, hp: 250, attack: 26, defense: 15 },
  { level: 7, xpToNext: 1500, hp: 300, attack: 30, defense: 18 },
  { level: 8, xpToNext: 2000, hp: 360, attack: 35, defense: 22 },
  { level: 9, xpToNext: 2600, hp: 430, attack: 40, defense: 26 },
  { level: 10, xpToNext: 9999, hp: 500, attack: 50, defense: 30 }
];

const SHOP_ITEMS = [
  { id: 'charm', name: '🛡️ 护符', price: 30, desc: '答错时自动消耗，抵一条命', type: 'consumable' },
  { id: 'atkBand', name: '⚔️ 攻击头带', price: 100, desc: '攻击+10', type: 'equipment', slot: 'weapon', statBonus: { attack: 10 } },
  { id: 'defPendant', name: '🛡️ 防御吊坠', price: 100, desc: '防御+5', type: 'equipment', slot: 'armor', statBonus: { defense: 5 } },
  { id: 'luckyRing', name: '🍀 幸运戒指', price: 150, desc: '攻击+5 防御+3', type: 'equipment', slot: 'accessory', statBonus: { attack: 5, defense: 3 } },
  { id: 'xpBoost', name: '⚡ 经验药水', price: 30, desc: '经验x1.5（持续5场）', type: 'consumable' },
  { id: 'stuckToken', name: '💡 灵感硬币', price: 20, desc: '上课时可消耗1枚向教师求助', type: 'stuckToken' },
];

const DIFFICULTY_CONFIG = {
  easy: { label: '🌱 简单', goldBase: 5, goldRand: 5, xpBase: 10, xpRand: 10, enemyAtk: 8, enemyDef: 1 },
  medium: { label: '🔥 中等', goldBase: 12, goldRand: 8, xpBase: 25, xpRand: 15, enemyAtk: 15, enemyDef: 3 },
  hard: { label: '💀 困难', goldBase: 25, goldRand: 15, xpBase: 50, xpRand: 25, enemyAtk: 25, enemyDef: 6 }
};

// ========== 费曼萌宠配置 ==========
const PET_APPEARANCES = [
  { id: 'cat', name: '小猫', emoji: '🐱', desc: '毛茸茸的橙色小猫，喜欢蹭人的腿，提问时歪着头' },
  { id: 'fox', name: '小狐', emoji: '🦊', desc: '机灵的白色小狐狸，耳朵总是竖着，问题刁钻' },
  { id: 'owl', name: '猫头鹰', emoji: '🦉', desc: '圆滚滚的小猫头鹰，戴着迷你眼镜，问题一本正经' },
  { id: 'dragon', name: '小龙', emoji: '🐉', desc: '鳞片闪闪的幼龙，偶尔喷出小火星，提问充满想象力' }
];
const PET_PERSONALITIES = [
  { id: 'curious', name: '好奇宝宝', emoji: '🤔', desc: '什么都想问为什么，问题一个接一个，追根究底' },
  { id: 'playful', name: '调皮鬼', emoji: '😜', desc: '爱开玩笑，提问时喜欢绕弯子考你，但学得很快' },
  { id: 'serious', name: '小学究', emoji: '🤓', desc: '认真严谨，听不懂就皱眉头，非要你把每个细节讲清楚' },
  { id: 'dreamy', name: '小迷糊', emoji: '😴', desc: '容易走神听漏，但偶尔冒出惊人的直觉问题' }
];
const PET_EVOLUTION_STAGES = [
  { stage: 0, name: '蛋', icon: '🥚', eggsNeeded: 0, desc: '一颗神秘的蛋，在知识之树下吸收光芒' },
  { stage: 1, name: '幼雏', icon: '🐣', eggsNeeded: 0, desc: '刚破壳的小生灵，对世界充满好奇' },
  { stage: 2, name: '少年', icon: '🐤', eggsNeeded: 3, desc: '羽毛渐丰，问题越来越有深度' },
  { stage: 3, name: '成年', icon: '🦅', eggsNeeded: 8, desc: '羽翼丰满，能和你进行有来有回的学术讨论' },
  { stage: 4, name: '智者', icon: '🦉', eggsNeeded: 18, desc: '散发智慧的光芒，偶尔能给你启发' }
];
const PET_UNLOCK_LESSONS = 3; // 学完3节课后蛋可以破壳

// ========== 应用全局状态 ==========
const App = {
  state: {
    apiKey: '',
    textbookOutline: [],
    textbookCourses: [],    // [{courseName, coursePath, chapters:[...]}]
    selectedCourse: '',     // 当前选中的课程名
    textbookSections: {},
    teachers: [],
    selectedTeacherId: null,
    selectedSection: null,       // 单击选中的章节（用于标题显示）
    selectedSections: [],        // 多选章节数组 [{chapterNum, num, title, filename}]（保留兼容，新流程不再使用）
    coursePosition: {},           // { [courseName]: { filename, chapterNum, num, title } } 动态教学进度
    isClassActive: false,
    chatHistory: [],
    progress: null,
    exerciseHistory: [],
    homeworkActive: false,
    homeworkMessages: [],
    homeworkContent: '',
    homeworkFileName: '',
    homeworkTeacherId: null,
    homeworkFiles: [],
    // 费曼萌宠
    pet: {
      unlocked: false,
      name: '',
      appearance: 'cat',
      personality: 'curious',
      level: 1,
      goldenEggs: [],
      evolutionStage: 0,
      growthReflections: [],
      sessions: [],
      isTeaching: false,
      teachingMessages: [],
      teachingTopic: '',
      learnedWords: []    // [{word, definition, learnedAt, eggId}]
    },
    wechatUnread: [],
    wechatArchive: [],
    diary: [],
    conversationArchives: [],
    teacherNotes: {},  // { [teacherId]: [{ date, lesson, chapterNum, sectionNum, note }] }
    classTokenUsage: { promptCacheHit: 0, promptCacheMiss: 0, completionTokens: 0 },
    // 卡住检测 + 错题习题
    stuckLog: [],              // [{ knowledgePoint, errorType, sectionNum, chapterNum, timestamp, context }]
    stuckExercises: [],        // 课后生成的错题习题
    lastKnowledgePoints: null, // 最近一次教学的知识点评估原始数据
    flaggedMessages: [],       // 学生标记的AI消息 [{ index, content, topic, date }]
    _lastAIQuestionTime: null, // AI 提问时间戳（响应时间追踪）
    settings: { theme: 'light', fontSize: 14 },
    // RPG 状态
    trees: JSON.parse(JSON.stringify(INITIAL_TREES)),
    bonds: JSON.parse(JSON.stringify(INITIAL_BONDS)),
    gameDay: 1,
    gameTime: '晨间',
    currentLocation: '伊庇斯特梅小镇入口',
    // 当前课使用的道具（null 表示未使用）
    activeItem: null,
    // 答题打怪 RPG
    player: {
      level: 1,
      xp: 0,
      lives: 3,
      maxLives: 3,
      attack: 10,
      defense: 5,
      gold: 0,
      inventory: [],       // [{ id, count }]
      equipment: { weapon: null, armor: null, accessory: null },
      xpBoostRemaining: 0,
      stuckTokens: 3  // 灵感硬币，上课时可消耗求助
    },
    combat: {
      isInBattle: false,
      currentEnemy: null,   // { monsterName, problem, answer, difficulty }
      battleLog: [],        // 战斗日志
      questionPool: [],     // { monsterName, problem, answer, difficulty } 备选题池
      currentDifficulty: null, // 当前选择的难度 'easy'/'medium'/'hard'
      isGenerating: false,   // 是否正在生成题目
      shielded: false,      // 本场是否有护符护体（答错时自动消耗）
      companion: null,      // { treeItemKey, teacherName } 陪同导师
      bossDefeated: false,  // 本场BOSS是否已击败
      livesLostThisRound: 0, // 本轮战斗已损失命数（用于判定BOSS是否触发）
      invincible: false      // 稀有道具召唤导师时，答错不扣命
    },
    exerciseBooks: []       // 习题集索引 [{ filename, displayName }]
  },

  // ========== 初始化 ==========
  async init() {
    this.loadSettings();
    this.applyTheme();
    this.state.apiKey = LS.getStr('api_key', '');
    if (this.state.apiKey) {
      $('#api-key-input').value = this.state.apiKey;
      this.activateStep('step-load');
    }
    $('#api-key-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveApiKey();
    });
  },

  // ── 向导卡片切换 ──
  goToWizardStep(n) {
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('wiz-' + n);
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.wiz-dot').forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i + 1 === n) d.classList.add('active');
      else if (i + 1 < n) d.classList.add('done');
    });
  },

  saveApiKeyAndNext() {
    const key = $('#api-key-input').value.trim();
    if (!key) { alert('请输入 API Key'); return; }
    if (!key.startsWith('sk-')) { alert('API Key 格式不正确，应以 sk- 开头'); return; }
    this.state.apiKey = key;
    LS.setStr('api_key', key);
    this.goToWizardStep(2);
  },

  async loadResourcesAndNext() {
    const statusEl = $('#load-status');
    const btn = $('#btn-wiz-2');
    btn.disabled = true; btn.textContent = '加载中...';
    statusEl.innerHTML = '<span class="loading-spinner"></span> 正在加载教材和导师文件...';
    let textbooksOk = false, teachersOk = false;
    try {
      let fromCache = false;
      // 优先使用 LS 缓存的课程索引，无缓存或缓存过期才重新扫描
      const cachedCourses = LS.get('textbook_courses', null);
      if (cachedCourses && cachedCourses.length > 0) {
        // 快速 HEAD 探测第一个教材文件是否还在（1.5秒超时）
        const firstSection = cachedCourses[0]?.chapters?.[0]?.sections?.[0];
        let cacheValid = !!firstSection;
        if (firstSection) {
          try {
            const testUrl = '教材/' + encodeURIComponent(firstSection.filename);
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), 1500);
            const testResp = await fetch(testUrl, { method: 'HEAD', signal: ctrl.signal });
            cacheValid = testResp.ok;
          } catch(e) { /* HEAD 失败保守保留缓存 */ }
        }
        if (cacheValid) {
          this.state.textbookCourses = cachedCourses;
          fromCache = true;
          console.log('📋 教材索引缓存命中，跳过扫描');
        }
      }
      if (!fromCache) {
        if (cachedCourses && cachedCourses.length > 0) {
          statusEl.innerHTML += '<div class="warn">⚠️ 缓存失效，重新扫描…</div>';
        }
        await this.scanTextbooks();
      }
      textbooksOk = true;
      const totalSections = this.state.textbookCourses.reduce((sum, c) => sum + c.chapters.reduce((s, ch) => s + ch.sections.length, 0), 0);
      statusEl.innerHTML += '<div class="ok">✅ 教材' + (fromCache ? '缓存命中' : '加载成功') + '（' + this.state.textbookCourses.length + ' 门课，共 ' + totalSections + ' 节）</div>';
    } catch (e) {
      statusEl.innerHTML += '<div class="err">❌ 教材加载失败：' + e.message + '</div>';
    }
    try {
      await this.scanTeachers();
      teachersOk = true;
      statusEl.innerHTML += '<div class="ok">✅ 导师加载成功（' + this.state.teachers.length + ' 位）</div>';
    } catch (e) {
      statusEl.innerHTML += '<div class="err">❌ 导师加载失败：' + e.message + '</div>';
    }
    if (textbooksOk && teachersOk) {
      statusEl.innerHTML += '<div class="ok" style="margin-top:8px">✅ 一切就绪！</div>';
      const btn = $('#btn-wiz-2');
      btn.textContent = '继续 →'; btn.disabled = false;
      setTimeout(() => this.goToWizardStep(3), 600);
    }
  },

  async enterMain() {
    // 初始化 RPG 持久化数据
    if (!LS.get('rpg_trees', null)) LS.set('rpg_trees', JSON.parse(JSON.stringify(INITIAL_TREES)));
    if (!LS.get('rpg_bonds', null)) LS.set('rpg_bonds', JSON.parse(JSON.stringify(INITIAL_BONDS)));
    if (!LS.get('rpg_gameday', null)) LS.set('rpg_gameday', 1);

    let isFreshProgress = false;
    if (!LS.get('progress', null)) {
      LS.set('progress', this.parseProgressSeed());
      isFreshProgress = true;
    }
    if (!LS.get('exercise_history', null)) LS.set('exercise_history', []);
    if (!LS.get('wechat_unread', null)) LS.set('wechat_unread', []);
    if (!LS.get('wechat_archive', null)) LS.set('wechat_archive', []);
    if (!LS.get('diary', null)) LS.set('diary', []);
    if (!LS.get('chat_history', null)) LS.set('chat_history', []);
    if (!LS.get('conversation_archives', null)) LS.set('conversation_archives', []);
    if (!LS.get('battle_player', null)) LS.set('battle_player', this.state.player);
    if (!LS.get('battle_combat', null)) LS.set('battle_combat', this.state.combat);

    this.loadPersistentData();
    // 如果 LS 中没有教材数据，自动扫描
    if (!this.state.textbookCourses.length) {
      try {
        await this.scanTextbooks();
      } catch(e) { console.warn('⚠️ 自动扫描教材失败：' + e.message); }
    }
    this.scanExerciseBooks().then(books => {
      if (books && books.length > 0) {
        console.log('✅ 习题集加载成功：' + books.length + ' 个文件');
      }
    }).catch(e => console.warn('⚠️ 习题集加载失败：' + e.message));

    this.scanHomeworkFiles().then(files => {
      if (files && files.length > 0) {
        console.log('✅ 作业文件加载成功：' + files.length + ' 个文件');
      }
    }).catch(e => console.warn('⚠️ 作业文件加载失败：' + e.message));

    $('#welcome-screen').classList.add('hidden');
    $('#main-screen').classList.remove('hidden');
    this.renderSidebar();
    this.renderChatView();
    this.renderWechatView();
    this.renderDiaryView();
    this.renderHomeworkView();
    this.renderBattleView();

    // 检查是否有未完成的课堂，恢复对话
    this._checkPausedClass();

    // 初始化划词菜单（选中AI消息文字 → 生成复习卡片）
    this._initSelectionMenu();

    // 页面关闭/刷新前自动存盘（含课堂快照）
    window.addEventListener('beforeunload', () => {
      this._saveClassSnapshot();
      this.saveAllState();
    });
  },

  // 保存当前课堂快照（刷新恢复用）
  _saveClassSnapshot() {
    if (!this.state.isClassActive) {
      LS.remove('class_snapshot');
      return;
    }
    LS.set('class_snapshot', {
      isClassActive: true,
      selectedCourse: this.state.selectedCourse,
      selectedTeacherId: this.state.selectedTeacherId,
      coursePosition: this.state.coursePosition,
      chatHistory: this.state.chatHistory,
      classTokenUsage: this.state.classTokenUsage,
      activeItem: this.state.activeItem,
      gameTime: this.state.gameTime,
      gameDay: this.state.gameDay,
      stuckLog: this.state.stuckLog,
      flaggedMessages: this.state.flaggedMessages
    });
  },

  // 检查是否有未完成课堂，恢复状态
  _checkPausedClass() {
    const snap = LS.get('class_snapshot', null);
    if (!snap || !snap.isClassActive || !snap.chatHistory.length) return;
    // 恢复课堂状态
    this.state.isClassActive = true;
    this.state.selectedCourse = snap.selectedCourse || this.state.selectedCourse;
    this.state.selectedTeacherId = snap.selectedTeacherId || this.state.selectedTeacherId;
    this.state.coursePosition = snap.coursePosition || this.state.coursePosition;
    this.state.chatHistory = snap.chatHistory;
    this.state.classTokenUsage = snap.classTokenUsage || { promptCacheHit: 0, promptCacheMiss: 0, completionTokens: 0 };
    this.state.activeItem = snap.activeItem || null;
    if (snap.gameTime) this.state.gameTime = snap.gameTime;
    if (snap.gameDay) this.state.gameDay = snap.gameDay;
    if (snap.stuckLog) this.state.stuckLog = snap.stuckLog;
    if (snap.flaggedMessages) this.state.flaggedMessages = snap.flaggedMessages;

    // 同步 UI
    this._syncOutline();
    this.renderSidebar();
    this.renderTeacherSelect();
    // 恢复聊天界面
    $('#chat-messages').innerHTML = '';
    $('#chat-messages').style.display = 'flex';
    $('#chat-empty').style.display = 'none';
    $('#chat-input-area').style.display = 'flex';
    $('#btn-end-class').disabled = false;
    $('#btn-start-class').disabled = true;
    this.state.chatHistory.forEach(m => { this.addMessage(m.role, m.content, false); });
    // 恢复顶部 UI
    const t = this.getCurrentTeacher();
    if (t) {
      const roleTag = t.orderRole === '守护导师' ? '🌳 ' : '🌱 ';
      $('#chat-teacher-name').textContent = roleTag + t.name + (t.role ? ' · ' + t.role : '');
      $('#chat-avatar').style.background = t.avatarColor;
      $('#chat-avatar').textContent = t.name.charAt(0);
    }
    const pos = this._getCoursePosition();
    if (pos) {
      $('#chat-topic').textContent = '📍 第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title;
    }
    this._updateStuckBtn();
    this.addSystemMessage('🔄 已恢复上次未完成的课堂（' + this.state.chatHistory.length + ' 条消息）');
    console.log('🔄 课堂快照恢复：', this.state.chatHistory.length, '条消息，位置:', JSON.stringify(this.state.coursePosition));
  },

  // ========== 目录扫描 ==========
  // 文件索引：三层兜底（live fetch → 预生成JSON → localStorage缓存）
  _fileIndex: null,
  _fileIndexPromise: null,

  async _loadFileIndex() {
    // 合并 预生成JSON + localStorage动态缓存
    if (this._fileIndex) return this._fileIndex;
    if (this._fileIndexPromise) return this._fileIndexPromise;
    this._fileIndexPromise = (async () => {
      const merged = {};
      // 第1层：localStorage 中动态缓存（开发模式自动攒的）
      try {
        const dyn = LS.get('dir_index', {});
        Object.assign(merged, dyn);
      } catch(e) {}
      // 第2层：预生成的 文件索引.json（覆盖/补充）
      try {
        const resp = await fetch('文件索引.json');
        if (resp.ok) {
          const staticIndex = await resp.json();
          Object.assign(merged, staticIndex); // 预生成优先级更高
        }
      } catch(e) {}
      this._fileIndex = merged;
      console.log('[文件索引] 加载完成，共 ' + Object.keys(merged).length + ' 个目录');
      return merged;
    })();
    return this._fileIndexPromise;
  },

  async scanDirectory(dirUrl) {
    // 第1层：尝试 live fetch（开发模式，有 Python 服务器）
    try {
      const resp = await fetch(encodeURI(dirUrl));
      if (resp.ok) {
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        const files = [];
        links.forEach(a => {
          const href = a.getAttribute('href');
          if (href && !href.startsWith('/') && !href.startsWith('?') && !href.startsWith('../') && href !== '../') {
            let name = href;
            try { name = decodeURIComponent(href); } catch(e) {}
            files.push(name);
          }
        });
        // 自动存入 localStorage 动态索引（新书会自动收录）
        try {
          const dyn = LS.get('dir_index', {});
          const key = dirUrl.replace(/\/$/, '') + '/';
          dyn[key] = files;
          LS.set('dir_index', dyn);
          // 同步更新内存索引
          if (this._fileIndex) this._fileIndex[key] = files;
        } catch(e) {}
        return files;
      }
    } catch(e) {
      // fetch 失败（CORS / 静态托管）→ 继续走兜底
    }

    // 第2层：使用文件索引（预生成JSON + localStorage缓存合并）
    const index = await this._loadFileIndex();
    const key = dirUrl.replace(/\/$/, '') + '/';
    if (index[key]) {
      console.log('[scanDirectory] 使用索引: ' + key + ' → ' + index[key].length + ' 个条目');
      return [...index[key]];
    }
    console.warn('[scanDirectory] 索引中找不到: ' + key);
    return [];
  },

  // ========== 教材系统 ==========
  async _aiGenerateDomainHint(courseName, chapters) {
    // 用 DeepSeek 分析教材内容，自动生成领域描述
    if (!this.state.apiKey) {
      return `这是一门课程（${courseName}）。请围绕课程主题展开教学，不要偏离到无关领域。`;
    }
    try {
      // 采集章节标题和第一节的内容作为分析样本
      const chapterTitles = chapters.map(ch => {
        const secTitles = ch.sections.slice(0, 3).map(s => s.title).join('、');
        return `第${ch.chapterNum}章：${secTitles}${ch.sections.length > 3 ? '...' : ''}`;
      }).join('\n');

      // 尝试读取第一节内容作为样本
      let sampleContent = '';
      if (chapters.length > 0 && chapters[0].sections.length > 0) {
        try {
          sampleContent = await this.fetchSection(chapters[0].sections[0].filename);
          // 截取前 1500 字
          if (sampleContent.length > 1500) {
            sampleContent = sampleContent.substring(0, 1500) + '...';
          }
        } catch(e) {}
      }

      const analysisPrompt = `你是一个课程分析助手。请根据以下信息判断这门课程属于什么学科领域，并写一段"领域边界描述"。

【课程名称】${courseName}
【章节结构】
${chapterTitles}
【第一节内容节选】
${sampleContent || '（未加载）'}

请完成以下任务：
1. 判断这门课属于什么学科（如：数学、文学、哲学、物理、历史、计算机科学、跨学科综合等）。如果涉及多个学科交叉，请明确指出。
2. 写一段120字以内的领域边界描述，用于指导AI教师：明确指出这门课应该讨论什么领域的内容、严禁偏离到什么无关领域。中文撰写。直接输出描述文本，不要加任何格式标记。`;

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: '你是一个课程分析助手。直接输出结果，不要解释过程。' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!resp.ok) throw new Error('API error ' + resp.status);
      const data = await resp.json();
      const hint = (data.choices[0].message.content || '').trim();
      if (hint) return hint;
    } catch(e) {
      console.warn('⚠️ AI 领域分析失败：' + e.message);
    }
    // AI 失败时返回通用描述
    return `这是一门课程（${courseName}，共 ${chapters.length} 章）。请围绕课程主题展开教学，不要偏离到无关领域。`;
  },

  async _fetchCourseDomainMd(coursePath) {
    // 尝试从课程目录加载 domain.md
    try {
      const resp = await fetch(encodeURI('教材/' + coursePath + 'domain.md'));
      if (resp.ok) {
        const content = await resp.text();
        if (content.trim()) return content.trim();
      }
    } catch(e) {}
    return null;
  },

  _parseChapterFiles(txtFiles, coursePath) {
    // 从文件名列表解析章节结构，coursePath 会加到每个 section 的 filename 前
    // 支持多级分节：第1章_1.1_xxx.md / 第1章_1.1.1_xxx.md / 第1章_1.1.1.1_xxx.md
    const prefix = coursePath || '';
    const chapterMap = new Map();
    txtFiles.forEach(f => {
      // 提取纯文件名（去掉路径前缀）
      const baseName = f.includes('/') ? f.split('/').pop() : f;
      const match = baseName.match(/^第(\d+)章_([\d.]+)_(.+)\.md$/);
      if (match && !match[2].split('.').some(p => p === '0')) {  // 跳过 X.0 之类的非正式节号
        const chNum = parseInt(match[1]);
        const secNum = match[2];       // 完整分节号，如 "1.1"、"1.1.1"、"1.1.1.1"
        const title = match[3];
        const fullFilename = prefix + baseName;
        if (!chapterMap.has(chNum)) {
          chapterMap.set(chNum, { chapterNum: chNum, title: '第' + chNum + '章', sections: [] });
        }
        chapterMap.get(chNum).sections.push({ num: secNum, title, filename: fullFilename, chapterNum: chNum });
      }
    });
    const outline = Array.from(chapterMap.values());
    outline.sort((a, b) => a.chapterNum - b.chapterNum);
    // 按分节号数值排序（"1.1" < "1.1.1" < "1.2"）
    outline.forEach(ch => {
      ch.sections.sort((a, b) => {
        const aParts = a.num.split('.').map(Number);
        const bParts = b.num.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const av = aParts[i] || 0;
          const bv = bParts[i] || 0;
          if (av !== bv) return av - bv;
        }
        return 0;
      });
    });
    return outline;
  },

  _syncOutline() {
    // 将 textBookOutline 同步为当前选中课程的章节
    const course = this.state.textbookCourses.find(c => c.courseName === this.state.selectedCourse);
    this.state.textbookOutline = course ? course.chapters : [];
  },

  async scanTextbooks() {
    // 扫描 教材/ 目录（每次调用都强制重新扫描，不使用缓存）
    console.log('🔍 scanTextbooks: 开始扫描 教材/ ...');
    const allItems = await this.scanDirectory('教材/');
    console.log('  教材/ 原始条目:', allItems);

    // 识别子目录（以 / 结尾的条目）
    const subDirs = allItems.filter(f => f.endsWith('/')).map(f => f.replace(/\/$/, ''));
    console.log('  子目录:', subDirs);

    // 识别根目录下的 .md 文件（legacy 模式）
    const rootTxt = allItems.filter(f => f.endsWith('.md'));
    console.log('  根目录 md 文件:', rootTxt.length, '个');

    const courses = [];

    // 收集旧课程中已有的 domainHint，避免重复调 AI
    const oldDomainHints = {};
    this.state.textbookCourses.forEach(c => {
      if (c.domainHint) oldDomainHints[c.courseName] = c.domainHint;
    });

    // 扫描每个子目录
    for (const dir of subDirs) {
      try {
        const subPath = '教材/' + dir + '/';
        console.log(`  扫描子目录: ${subPath}`);
        const subFiles = await this.scanDirectory(subPath);
        console.log(`    ${subPath} 原始条目:`, subFiles);
        const txtFiles = subFiles.filter(f => f.endsWith('.md'));
        console.log(`    md 文件: ${txtFiles.length} 个`);
        if (txtFiles.length > 0) {
          const chapters = this._parseChapterFiles(txtFiles, dir + '/');
          console.log(`    解析出 ${chapters.length} 章, ${chapters.reduce((s,ch)=>s+ch.sections.length,0)} 节`);
          // 加载领域描述：domain.md > 旧缓存 > AI 生成
          let domainHint = null;
          const domainMd = await this._fetchCourseDomainMd(dir + '/');
          if (domainMd) {
            domainHint = domainMd;
          } else if (oldDomainHints[dir]) {
            // 已有 AI 生成过的缓存，直接复用
            domainHint = oldDomainHints[dir];
            console.log(`    📦 复用已有领域描述: ${domainHint.substring(0, 50)}...`);
          } else {
            // 首次加载 → AI 生成
            console.log(`    🤖 AI 分析课程领域: ${dir}`);
            domainHint = await this._aiGenerateDomainHint(dir, chapters);
            console.log(`    ✅ 领域分析: ${domainHint.substring(0, 60)}...`);
          }
          courses.push({
            courseName: dir,
            coursePath: dir + '/',
            chapters: chapters,
            domainHint: domainHint
          });
        } else {
          console.warn(`    ⚠️ 子目录 ${dir} 中没有 .md 文件！`);
        }
      } catch(e) {
        console.warn('无法扫描子目录 教材/' + dir + ':', e.message);
      }
    }

    // 根目录的 txt 文件作为"默认课程"（仅在无子目录或 legacy 模式下）
    if (rootTxt.length > 0) {
      const legacyName = courses.length === 0 ? '高等数学' : '默认课程';
      const legacyChapters = this._parseChapterFiles(rootTxt, '');
      const legacyDomainMd = await this._fetchCourseDomainMd('');
      const legacyHint = legacyDomainMd || await this._aiGenerateDomainHint(legacyName, legacyChapters);
      courses.unshift({
        courseName: legacyName,
        coursePath: '',
        chapters: legacyChapters,
        domainHint: legacyHint
      });
    }

    // 如果完全没有教材，创建一个空课程
    if (courses.length === 0) {
      courses.push({ courseName: '高等数学', coursePath: '', chapters: [], domainHint: '这是一门课程。请围绕课程主题展开教学。' });
    }

    this.state.textbookCourses = courses;
    this.state.selectedCourse = courses[0].courseName;
    this._syncOutline();
    LS.set('textbook_courses', courses);
    LS.set('selected_course', this.state.selectedCourse);
  },

  async rescanTextbooks() {
    const tree = $('#outline-tree');
    tree.innerHTML = '<div style="font-size:13px;color:var(--text-secondary)"><span class="loading-spinner"></span> 正在扫描教材...</div>';
    try {
      await this.scanTextbooks();
      this.renderOutlineTree();
      this.renderHomeworkView();
    } catch(e) {
      tree.innerHTML = '<div style="font-size:13px;color:var(--text-error)">扫描失败：' + e.message + '</div>';
    }
  },

  switchCourse(courseName) {
    this.state.selectedCourse = courseName;
    this._syncOutline();
    LS.set('selected_course', courseName);
    // 动态教学模式：加载该课程的教学位置
    const pos = this._getCoursePosition(courseName);
    if (pos) {
      $('#chat-topic').textContent = '📍 第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title;
    } else {
      $('#chat-topic').textContent = '📖 ' + courseName + '（无章节数据）';
    }
    this._updateStartBtn();
    this.renderOutlineTree();
  },

  async fetchSection(filename) {
    // filename 可能已包含课程路径前缀，如 "高等数学/第1章_1.1_映射与函数.md"
    // 1. 内存缓存：同一次会话内直接返回
    if (this.state.textbookSections[filename]) return this.state.textbookSections[filename];
    const cachedSections = LS.get('textbook_sections', {});
    const cached = cachedSections[filename] || null;
    const url = '教材/' + encodeURIComponent(filename);
    // 2. HEAD 探测文件是否变动（比对 Content-Length），2 秒超时
    let needFetch = !cached;
    if (cached) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2000);
        const headResp = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(timer);
        if (headResp.ok) {
          const serverLen = parseInt(headResp.headers.get('Content-Length') || '0', 10);
          const cacheLen = cached.length;
          if (serverLen > 0) {
            needFetch = (serverLen !== cacheLen);
            if (needFetch) {
              console.log('🔄 教材变动，重新加载: ' + filename + ' (' + cacheLen + ' → ' + serverLen + ')');
            }
          }
          // Content-Length 为 0（服务器不返回），保守起见用缓存
        } else {
          // HEAD 返回非 200（如 404），文件可能被删了，保留缓存
          console.log('⚠️ HEAD 返回 ' + headResp.status + '，使用缓存: ' + filename);
        }
      } catch(e) {
        // HEAD 超时 / 网络错误 / 协议不支持 → 降级用缓存
        console.log('⚠️ HEAD 探测不可用（超时或协议限制），使用缓存: ' + filename);
      }
    }
    // 3. 有缓存且未变动，直接复用
    if (!needFetch) {
      this.state.textbookSections[filename] = cached;
      return cached;
    }
    // 4. 加载新内容
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('无法加载教材: ' + filename);
    const content = await resp.text();
    this.state.textbookSections[filename] = content;
    cachedSections[filename] = content;
    LS.set('textbook_sections', cachedSections);
    return content;
  },

  async _fetchCachedSystemFile(filename, cacheKey, fallback) {
    const cached = LS.get(cacheKey, null);
    const url = 'system/' + encodeURIComponent(filename);
    const busted = url + '?t=' + Date.now();
    if (cached) {
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 2000);
        const head = await fetch(busted, { method: 'HEAD', signal: ctrl.signal });
        if (head.ok) {
          const serverLen = parseInt(head.headers.get('Content-Length') || '0', 10);
          if (serverLen > 0 && serverLen === cached.length) return cached;
        }
      } catch(e) { return cached; }
    }
    try {
      const resp = await fetch(busted);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const content = await resp.text();
      LS.set(cacheKey, content);
      return content;
    } catch(e) {
      console.warn(filename + ' 加载失败：' + e.message);
      return fallback;
    }
  },

  async fetchHomeworkPrompt() {
    return this._fetchCachedSystemFile('homework_prompt.md', 'homework_prompt', SEED_DATA.homeworkPromptMd);
  },

  async fetchFeynmanPetPrompt() {
    return this._fetchCachedSystemFile('feynman_pet_prompt.md', 'feynman_pet_prompt', SEED_DATA.feynmanPetPromptMd);
  },

  async fetchWorldSetting() {
    return this._fetchCachedSystemFile('world_setting.md', 'world_setting', SEED_DATA.worldSettingMd);
  },

  // ===== 教案系统：分层拆解 + 生成 + 加载 =====

  // 加载系统提示词文件（优先读文件，失败回退 null）
  async _fetchSystemPrompt(filename) {
    const cacheKey = 'sys_prompt_' + filename.replace('.md', '');
    return this._fetchCachedSystemFile(filename, cacheKey, null);
  },

  // PUT 教案文件到服务器（需 server.py 启动）
  async _savePlanFile(relPath, content) {
    // 分段编码路径，保留 / 分隔符
    const encodedPath = relPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
    try {
      const resp = await fetch(encodedPath, {
        method: 'PUT',
        body: content
      });
      if (resp.ok) {
        console.log('💾 教案已落盘：' + relPath + ' (' + content.length + ' 字节)');
        return true;
      }
      console.warn('⚠️ PUT 失败 (HTTP ' + resp.status + ')，教案仅存 LS 缓存：' + relPath);
      console.warn('   请确认使用 python server.py 启动（非 python -m http.server）');
    } catch (e) {
      console.warn('⚠️ PUT 请求失败（server.py 未启动？），教案仅存 LS 缓存：' + e.message);
      console.warn('   路径：' + relPath);
    }
    // PUT 失败 → 触发浏览器下载，用户可手动放入 教案/ 目录
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = relPath.replace(/^.*[\\/]/, ''); // 提取文件名
      a.download = filename;
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📥 教案已触发下载：' + filename + '（请放入 ' + relPath + '）');
    } catch(dlErr) {
      console.warn('   下载兜底也失败了：' + dlErr.message);
    }
    return false;
  },

  // 在课程目录中查找全书拆解报告
  async _findBookAnalysis(courseName) {
    const dirUrl = '教材/' + encodeURIComponent(courseName) + '/';
    try {
      const files = await this.scanDirectory(dirUrl);
      const match = files.find(f =>
        f.startsWith('00_深度拆书') || f.startsWith('_全书分析') || f.startsWith('_全书拆解')
      );
      if (match) {
        const resp = await fetch(dirUrl + encodeURIComponent(match));
        return resp.ok ? await resp.text() : null;
      }
    } catch (e) { /* 忽略 */ }
    return null;
  },

  // 计算教案路径
  _getChapterPlanPath(courseName, chNum) {
    return '教案/' + courseName + '/_第' + chNum + '章_概括.json';
  },
  _getSectionPlanPath(courseName, chNum, secNum, title) {
    const safeTitle = title.replace(/[<>:"/\\\\|?*]/g, '_').substring(0, 50);
    return '教案/' + courseName + '/第' + chNum + '章_' + secNum + '_' + safeTitle + '_教案.md';
  },

  // 加载章概括（从 LS 缓存或文件）
  async _loadChapterPlan(courseName, chNum) {
    const cacheKey = 'plan_chapter_' + courseName + '_' + chNum;
    const cached = LS.get(cacheKey, null);
    if (cached) return cached;
    try {
      const planPath = this._getChapterPlanPath(courseName, chNum);
      const resp = await fetch(encodeURI(planPath));
      if (!resp.ok) return null;
      const json = await resp.json();
      LS.set(cacheKey, json);
      return json;
    } catch (e) { return null; }
  },

  // 加载单节教案（从 LS 缓存或文件）
  async _loadSectionPlan(courseName, chNum, secNum, title) {
    const cacheKey = 'plan_section_' + courseName + '_第' + chNum + '章_' + secNum;
    const cached = LS.get(cacheKey, null);
    if (cached) return cached;
    try {
      const planPath = this._getSectionPlanPath(courseName, chNum, secNum, title);
      const resp = await fetch(encodeURI(planPath));
      if (!resp.ok) return null;
      const md = await resp.text();
      LS.set(cacheKey, md);
      return md;
    } catch (e) { return null; }
  },

  // 第二层：生成分章概括（全章内容 → JSON）
  async _generateChapterPlan(courseName, chNum) {
    this._showLoading('正在生成第' + chNum + '章教学概括（AI 读取全章内容…）');
    const toastEl = this._toast('⏳ 第' + chNum + '章概括生成中，请稍候…', 'loading', 0);
    try {
      const course = this.state.textbookCourses.find(c => c.courseName === courseName);
      if (!course) throw new Error('课程未找到');
      const chapter = course.chapters.find(ch => ch.chapterNum === chNum);
      if (!chapter) throw new Error('章节未找到');

      const sectionTexts = await Promise.all(chapter.sections.map(s =>
        this.fetchSection(s.filename).catch(() => '(加载失败)')
      ));
      const fullChapterText = chapter.sections.map((s, i) =>
        '=== 第' + chNum + '章 ' + s.num + ' ' + s.title + ' ===\n' + sectionTexts[i]
      ).join('\n\n');

      const bookAnalysis = await this._findBookAnalysis(courseName);
      const analysisText = bookAnalysis || '（无全书拆解报告）';

      const chapterPrompt = await this._fetchSystemPrompt('lesson_plan_chapter.md');
      if (!chapterPrompt) throw new Error('分章概括提示词文件缺失');

      const userMsg = '=== 全书拆解报告 ===\n' + analysisText +
        '\n\n=== 本章全部小节教材全文 ===\n' + fullChapterText +
        '\n\n请按 JSON 格式输出本章教学概括。';

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: chapterPrompt },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API 请求失败 (HTTP ' + resp.status + ')');
      }
      const data = await resp.json();
      const reply = data.choices[0].message.content;
      let parsed;
      try {
        const m = reply.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(m ? m[0] : reply);
      } catch (e) {
        throw new Error('章概括 JSON 解析失败：' + e.message);
      }
      // 落盘：PUT 到服务器文件 + LS 缓存兜底
      const planPath = '教案/' + courseName + '/_第' + chNum + '章_概括.json';
      await this._savePlanFile(planPath, JSON.stringify(parsed, null, 2));
      const cacheKey = 'plan_chapter_' + courseName + '_' + chNum;
      LS.set(cacheKey, parsed);
      const secCount = (parsed.sections || []).length;
      console.log('📋 第' + chNum + '章概括已生成：' + secCount + ' 节 → ' + planPath);
      if (toastEl) toastEl.remove();
      this._toast('✅ 第' + chNum + '章概括已生成！共 ' + secCount + ' 节 → ' + planPath, 'ok');
      return parsed;
    } catch (e) {
      if (toastEl) toastEl.remove();
      this._toast('❌ 章概括生成失败：' + e.message, 'err');
      throw e;
    } finally {
      this._hideLoading();
    }
  },

  // 第三层：生成单节教案（教材全文 → Markdown）
  async _generateSectionPlan(section) {
    const courseName = this.state.selectedCourse;
    const chNum = section.chapterNum;
    const title = section.title || '';
    this._showLoading('正在生成教案：' + chNum + '.' + section.num + ' ' + title);
    const toastEl = this._toast('⏳ 教案生成中（AI 拆解教材…）', 'loading', 0);
    try {
      let chapterPlan = await this._loadChapterPlan(courseName, chNum);
      let chapterSummary = '';
      if (chapterPlan) {
        const secInfo = (chapterPlan.sections || []).filter(s => s.num === section.num);
        chapterSummary = '## 本章主题\n' + (chapterPlan.chapterTheme || '') +
          '\n\n## 教学目标\n' + (chapterPlan.chapterGoal || '') +
          '\n\n## 节间逻辑\n' + (chapterPlan.sectionFlow || '') +
          '\n\n## 本节角色\n' + secInfo.map(s => s.role + ' — ' + s.coreIdea).join('\n') +
          '\n\n## 知识流\n' + (chapterPlan.knowledgeFlow || '') +
          '\n\n## 难度\n' + secInfo.map(s => s.difficulty).join('');
      } else {
        chapterSummary = '（暂无章概括，请直接从教材中提取全部知识点和逻辑脉络）';
      }

      const sectionText = await this.fetchSection(section.filename);
      const sectionPromptMd = await this._fetchSystemPrompt('lesson_plan_section.md');
      if (!sectionPromptMd) throw new Error('分节教案提示词文件缺失');

      const userMsg = '=== 章概括 ===\n' + chapterSummary +
        '\n\n=== 本节教材全文 ===\n\n' + sectionText +
        '\n\n请按指定 Markdown 格式输出本节教案。';

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: sectionPromptMd },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3,
          max_tokens: 8192
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API 请求失败 (HTTP ' + resp.status + ')');
      }
      const data = await resp.json();
      const planMd = data.choices[0].message.content;
      // 落盘：PUT 到服务器文件 + LS 缓存兜底
      const safeTitle = (title || '').replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
      const planPath = '教案/' + courseName + '/第' + chNum + '章_' + section.num + '_' + safeTitle + '_教案.md';
      await this._savePlanFile(planPath, planMd);
      const cacheKey = 'plan_section_' + courseName + '_第' + chNum + '章_' + section.num;
      LS.set(cacheKey, planMd);
      console.log('📝 教案已生成：第' + chNum + '章 ' + section.num + ' ' + title + ' | ' + planMd.length + ' 字 → ' + planPath);
      if (toastEl) toastEl.remove();
      this._toast('✅ 教案已生成：' + chNum + '.' + section.num + ' ' + title + ' → ' + planPath, 'ok');
      return planMd;
    } catch (e) {
      if (toastEl) toastEl.remove();
      this._toast('❌ 教案生成失败：' + e.message, 'err');
      throw e;
    } finally {
      this._hideLoading();
    }
  },


  // ========== 作业文件系统 ==========
  async scanHomeworkFiles() {
    try {
      const files = await this.scanDirectory('homework/待批改/');
      const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');
      this.state.homeworkFiles = mdFiles.map(f => ({
        filename: f,
        displayName: f.replace(/\.md$/, '')
      }));
    } catch(e) {
      console.warn('作业文件扫描失败:', e.message);
      this.state.homeworkFiles = [];
    }
    return this.state.homeworkFiles;
  },

  async fetchHomeworkFile(filename) {
    const cacheKey = 'hw_file_' + filename;
    const cached = LS.get(cacheKey, null);
    if (cached) return cached;
    const resp = await fetch('homework/待批改/' + encodeURIComponent(filename));
    if (!resp.ok) throw new Error('无法加载作业文件: ' + filename);
    const content = await resp.text();
    LS.set(cacheKey, content);
    return content;
  },

  // ========== 习题集系统 ==========
  async scanExerciseBooks() {
    const files = await this.scanDirectory('习题集/');
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    this.state.exerciseBooks = txtFiles.map(f => ({
      filename: f,
      displayName: f.replace(/\.txt$/, '')
    }));
    return this.state.exerciseBooks;
  },

  async fetchExerciseContent(filename) {
    const cacheKey = 'exercise_' + filename;
    const cached = LS.get(cacheKey, null);
    if (cached) return cached;
    const resp = await fetch('习题集/' + encodeURIComponent(filename));
    if (!resp.ok) throw new Error('无法加载习题集: ' + filename);
    const content = await resp.text();
    LS.set(cacheKey, content);
    return content;
  },

  // ========== 教师系统 ==========
  async scanTeachers() {
    // 加载 roster.json（每次都重新加载，确保显示信息最新）
    let roster = {};
    try {
      const rosterResp = await fetch('老师/roster.json');
      if (rosterResp.ok) {
        const rosterData = await rosterResp.json();
        rosterData.forEach(r => { roster[r.id] = r; });
      }
    } catch(e) { console.warn('无法加载 roster.json:', e); }

    const cached = LS.get('teacher_profiles', null);
    if (cached && cached.length > 0) {
      // 用 roster 覆盖显示字段（保留教学相关字段）
      for (const t of cached) {
        const r = roster[t.id];
        if (r) {
          t.name = r.name;
          t.namePure = r.namePure;
          t.role = r.title;
          t.orderRole = r.orderRole;
          t.avatarColor = r.avatarColor;
        }
      }
      this.state.teachers = cached;
      return;
    }
    const files = await this.scanDirectory('老师/');
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const teachers = [];
    for (const f of mdFiles) {
      try {
        const resp = await fetch('老师/' + encodeURIComponent(f));
        if (!resp.ok) continue;
        const content = await resp.text();
        const info = this.parseTeacherMd(content, f);
        if (info) {
          const r = roster[info.id];
          if (r) {
            info.name = r.name;
            info.namePure = r.namePure;
            info.role = r.title;
            info.orderRole = r.orderRole;
            info.avatarColor = r.avatarColor;
          }
          teachers.push(info);
        }
      } catch(e) { console.warn('无法加载导师文件:', f, e); }
    }
    this.state.teachers = teachers;
    LS.set('teacher_profiles', teachers);
  },

  parseTeacherMd(content, filename) {
    const nameMatch = content.match(/-\s*\*\*姓名\*\*[：:]\s*(.+)/);
    const roleMatch = content.match(/-\s*\*\*身份\*\*[：:]\s*(.+)/);
    const styleMatch = content.match(/-\s*\*\*苏格拉底方式\*\*[：:]?\s*(.+)/) || content.match(/-\s*\*\*反馈风格\*\*[：:]?\s*(.+)/);
    const coreMatch = content.match(/\*\*核心性格\*\*[：:]\s*(.+)/);
    const personalityMatch = content.match(/## 人格摘要\s*\n([\s\S]*?)(?=\n## |\n---|\n\*——)/);
    const exampleMatch = content.match(/## 示例对话\s*\n<example_dialogue>\s*\n([\s\S]*?)<\/example_dialogue>/);

    const name = nameMatch ? nameMatch[1].trim() : filename.replace('.md', '');
    // 提取纯中文名（去掉括号中的英文），用于 RPG 系统匹配
    const namePure = name.replace(/[（(].*[）)]/, '').trim();
    const role = roleMatch ? roleMatch[1].trim() : '';
    const id = filename.replace('.md', '');
    const style = styleMatch ? styleMatch[1].trim().substring(0, 80) : '';
    const core = coreMatch ? coreMatch[1].trim() : '';

    let personaBrief = '';
    if (core) personaBrief += `【核心性格】${core}\n`;
    if (personalityMatch) personaBrief += `【人格摘要】${personalityMatch[1].trim()}\n`;


    let exampleDialogue = '';
    if (exampleMatch) { exampleDialogue = exampleMatch[1].trim(); }

    const colors = ['#8B6914','#6b4c2a','#a08060','#7a6040','#4a7c3f','#5b8c4a','#bd9a6b','#c4902f','#8a6b40','#5a7a5a'];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const avatarColor = colors[hash % colors.length];

    // 教团身份等级
    const guardianMatch = content.match(/## (守护导师|使徒)/);
    const orderRole = guardianMatch ? guardianMatch[1] : '使徒';

    return { id, name, namePure, role, style, core, personaBrief, exampleDialogue, fullMd: content, avatarColor, isCustom: false, filename, orderRole };
  },

  // ========== 持久化数据 ==========
  parseProgressSeed() {
    return {
      completedLessons: 0,
      currentProgress: '准备开始',
      nextLesson: '',
      masteredPoints: [],     // 兼容旧版，新数据走 courseMastery
      courseMastery: {},      // { [courseName]: string[] } 按课程分类的已掌握知识点
      weakPoints: [],
      lessonRecords: []
    };
  },

  loadPersistentData() {
    this.state.trees = LS.get('rpg_trees', JSON.parse(JSON.stringify(INITIAL_TREES)));
    this.state.bonds = LS.get('rpg_bonds', JSON.parse(JSON.stringify(INITIAL_BONDS)));
    this.state.gameDay = LS.get('rpg_gameday', 1);
    this.state.gameTime = LS.getStr('rpg_gametime', '晨间');
    this.state.progress = LS.get('progress', this.parseProgressSeed());
    this.state.exerciseHistory = LS.get('exercise_history', []);
    this.state.wechatUnread = LS.get('wechat_unread', []);
    this.state.wechatArchive = LS.get('wechat_archive', []);
    this.state.diary = LS.get('diary', []);
    this.state.chatHistory = LS.get('chat_history', []);
    this.state.conversationArchives = LS.get('conversation_archives', []);
    this.state.teacherNotes = LS.get('teacher_notes', {});
    const savedPet = LS.get('pet_data', null);
    if (savedPet) this.state.pet = savedPet;
    this.state.textbookSections = LS.get('textbook_sections', {});
    this.state.coursePosition = LS.get('course_position', {});
    this.state.stuckLog = LS.get('stuck_log', []);
    this.state.stuckExercises = LS.get('stuck_exercises', []);
    this.state.lastKnowledgePoints = LS.get('last_knowledge_points', null);
    this.state.flaggedMessages = LS.get('flagged_messages', []);
    // 加载课程结构缓存
    const savedCourses = LS.get('textbook_courses', null);
    if (savedCourses) {
      this.state.textbookCourses = savedCourses;
      this.state.selectedCourse = LS.getStr('selected_course', savedCourses[0]?.courseName || '');
      this._syncOutline();
    }
    const savedPlayer = LS.get('battle_player', null);
    if (savedPlayer) {
      // 迁移旧存档：hp/maxHp → lives/maxLives
      if (savedPlayer.hp !== undefined) {
        savedPlayer.lives = savedPlayer.hp > 0 ? 3 : 0;
        savedPlayer.maxLives = 3;
        delete savedPlayer.hp;
        delete savedPlayer.maxHp;
      }
      this.state.player = savedPlayer;
    }
    const savedCombat = LS.get('battle_combat', null);
    if (savedCombat) {
      // 合并默认值，确保新字段存在（兼容旧版存档）
      this.state.combat = {
        isInBattle: savedCombat.isInBattle || false,
        currentEnemy: savedCombat.currentEnemy || null,
        battleLog: savedCombat.battleLog || [],
        questionPool: savedCombat.questionPool || [],
        currentDifficulty: savedCombat.currentDifficulty || null,
        isGenerating: savedCombat.isGenerating || false,
        shielded: savedCombat.shielded || false,
        companion: savedCombat.companion || null,
        bossDefeated: savedCombat.bossDefeated || false,
        livesLostThisRound: savedCombat.livesLostThisRound || 0,
        invincible: savedCombat.invincible || false
      };
    }
  },

  // ========== RPG 系统 ==========
  addTreeBranch(teacherName, lessonTitle) {
    const treeKey = getTeacherTreeMap(teacherName);
    if (!treeKey) return;
    const tree = this.state.trees[treeKey];
    tree.branchesCount += 1;
    tree.branches.push({ num: tree.branchesCount, title: lessonTitle });
    tree.phase = getTreePhase(tree.branchesCount);

    // 产物掉落
    const product = getTreeProduct(treeKey);
    const isRare = Math.random() < 0.15; // 15% 稀有掉落
    if (isRare) {
      tree.items[product.rareKey] = (tree.items[product.rareKey] || 0) + 1;
    } else {
      tree.items[product.key] = (tree.items[product.key] || 0) + 1;
    }

    LS.set('rpg_trees', this.state.trees);
    return { tree, product, isRare };
  },

  addBond(teacherName, amount) {
    if (!this.state.bonds[teacherName]) return;
    const bond = this.state.bonds[teacherName];
    bond.value += amount;
    bond.level = getBondLevel(bond.value);
    LS.set('rpg_bonds', this.state.bonds);
  },

  advanceGameTime() {
    const times = ['晨间', '午后', '黄昏', '夜间'];
    const idx = times.indexOf(this.state.gameTime);
    if (idx < times.length - 1) {
      this.state.gameTime = times[idx + 1];
    } else {
      this.state.gameTime = '晨间';
      this.state.gameDay += 1;
    }
    LS.set('rpg_gameday', this.state.gameDay);
  },

  // ========== 答题打怪 RPG 核心逻辑 ==========
  saveBattleData() {
    LS.set('battle_player', this.state.player);
    LS.set('battle_combat', this.state.combat);
  },

  addBattleLog(text, cls = 'info') {
    const log = this.state.combat.battleLog;
    log.push({ text, cls, time: Date.now() });
    if (log.length > 50) log.shift();
    this.saveBattleData();
  },

  getPlayerStats() {
    const p = this.state.player;
    const eq = p.equipment;
    let atk = p.attack, def = p.defense;
    if (eq.weapon) {
      const item = SHOP_ITEMS.find(i => i.id === eq.weapon);
      if (item && item.statBonus) {
        atk += (item.statBonus.attack || 0);
        def += (item.statBonus.defense || 0);
      }
    }
    if (eq.armor) {
      const item = SHOP_ITEMS.find(i => i.id === eq.armor);
      if (item && item.statBonus) {
        atk += (item.statBonus.attack || 0);
        def += (item.statBonus.defense || 0);
      }
    }
    if (eq.accessory) {
      const item = SHOP_ITEMS.find(i => i.id === eq.accessory);
      if (item && item.statBonus) {
        atk += (item.statBonus.attack || 0);
        def += (item.statBonus.defense || 0);
      }
    }
    return { atk, def };
  },

  // ========== 竞技场 - 新流程 ==========

  // 检测背包中可用于召唤导师的树产道具
  getAvailableCompanions() {
    const p = this.state.player;
    const trees = this.state.trees;
    const result = [];
    // 检查三树的库存
    const treeKeys = ['oak', 'willow', 'laurel'];
    for (const treeKey of treeKeys) {
      const tree = trees[treeKey];
      const products = getTreeProduct(treeKey);
      if (!products) continue;
      // 检查普通产出：随机召唤守护导师/使徒
      const normalKey = products.key;
      if (tree.items[normalKey] > 0) {
        const comp = COMPANION_MAP[normalKey];
        if (comp) result.push({ itemKey: normalKey, treeKey, teacherName: comp.name, altName: comp.alt, count: tree.items[normalKey], isRare: false });
      }
      // 检查稀有产出：可自选召唤哪位，且无敌
      const rareKey = products.rareKey;
      if (tree.items[rareKey] > 0) {
        const comp = COMPANION_MAP[rareKey];
        if (comp) {
          // 守护导师选项
          result.push({ itemKey: rareKey, treeKey, teacherName: comp.name, count: tree.items[rareKey], isRare: true });
          // 使徒选项
          if (comp.alt) result.push({ itemKey: rareKey, treeKey, teacherName: comp.alt, count: tree.items[rareKey], isRare: true });
        }
      }
    }
    return result;
  },

  // 显示导师邀请弹窗
  showCompanionPicker(companions, difficulty) {
    const combat = this.state.combat;
    let optionsHtml = companions.map((c, i) =>
      `<button class="btn btn-sm btn-outline" onclick="App.selectCompanion(${i}, '${difficulty}')" style="margin:4px;padding:8px 16px">
        ${c.teacherName}（消耗 ${c.count} 个）
      </button>`
    ).join('');
    // 添加"不需要"选项
    optionsHtml += `<button class="btn btn-sm btn-outline" onclick="App.selectCompanion(-1, '${difficulty}')" style="margin:4px;padding:8px 16px">❌ 不需要</button>`;

    this.addBattleLog('🧑‍🏫 检测到树产道具，是否邀请导师陪同战斗？答错时导师会给出提示', 'info');
    // 将选择器渲染到战斗区域（临时覆盖）
    this.renderBattleViewWithCompanionPicker(companions, difficulty);
  },

  // 导师选择回调
  selectCompanion(index, difficulty) {
    const combat = this.state.combat;
    const p = this.state.player;
    const trees = this.state.trees;
    const companions = this.getAvailableCompanions();

    if (index >= 0 && index < companions.length) {
      const sel = companions[index];
      // 消耗树产道具
      const products = getTreeProduct(sel.treeKey);
      if (products) {
        trees[sel.treeKey].items[sel.itemKey] = Math.max(0, (trees[sel.treeKey].items[sel.itemKey] || 0) - 1);
        LS.set('rpg_trees', this.state.trees);
      }

      if (sel.isRare) {
        // 稀有道具：直接选中，且无敌
        combat.companion = { treeItemKey: sel.itemKey, teacherName: sel.teacherName };
        combat.invincible = true;
        this.addBattleLog(`👑 ${sel.teacherName} 正在陪你一同探险。`, 'hit');
      } else {
        // 普通道具：守护导师和使徒中随机二选一
        const pool = [sel.teacherName, sel.altName];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        combat.companion = { treeItemKey: sel.itemKey, teacherName: chosen };
        combat.invincible = false;
        this.addBattleLog(`🧑‍🏫 ${chosen} 正在陪你一同探险。`, 'hit');
      }
    } else {
      combat.companion = null;
      combat.invincible = false;
      this.addBattleLog('⚔️ 独自挑战！', 'info');
    }
    this.renderItemsPanel();     // 更新左侧栏背包
    this.renderBattleSidebar();
    this.generateQuestions(difficulty);
  },

  // 带邀请弹窗的战斗视图
  renderBattleViewWithCompanionPicker(companions, difficulty) {
    const container = $('#battle-layout');
    const p = this.state.player;
    const stats = this.getPlayerStats();
    const nextLevel = p.level < LEVEL_TABLE.length ? LEVEL_TABLE[p.level - 1].xpToNext : 0;
    const xpPct = nextLevel > 0 ? Math.min(100, Math.round((p.xp / nextLevel) * 100)) : 100;

    let html = this.renderHudHtml();
    html += `<div class="battle-arena">
      <div class="ba-start-text">🧑‍🏫 邀请导师陪同？</div>
      <div class="companion-desc">答错时导师会给提示引导</div>
      <div class="companion-picker">`;
    companions.forEach((c, i) => {
      if (c.isRare) {
        html += `<button class="btn btn-outline btn-companion" onclick="App.selectCompanion(${i}, '${difficulty}')">
          ✨ ${c.teacherName}<br><small>（消耗 ${c.count} 个）</small>
        </button>`;
      } else {
        html += `<button class="btn btn-outline btn-companion" onclick="App.selectCompanion(${i}, '${difficulty}')">
          🌱 ${c.teacherName} / ${c.altName}<br><small>（消耗 ${c.count} 个·随机）</small>
        </button>`;
      }
    });
    html += `<button class="btn btn-outline btn-companion" onclick="App.selectCompanion(-1, '${difficulty}')">❌ 不需要</button>`;
    html += `</div></div>`;

    html += this.renderBattleLogHtml();
    html += this.renderShopHtml();
    html += this.renderBattleInventoryHtml();
    container.innerHTML = html;
    if (window.renderMathInElement) {
      renderMathInElement(container, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
    }
  },

  // HUD 片段
  renderHudHtml() {
    const p = this.state.player;
    const stats = this.getPlayerStats();
    const nextLevel = p.level < LEVEL_TABLE.length ? LEVEL_TABLE[p.level - 1].xpToNext : 0;
    const xpPct = nextLevel > 0 ? Math.min(100, Math.round((p.xp / nextLevel) * 100)) : 100;
    const hearts = '❤️'.repeat(p.lives) + '🖤'.repeat(Math.max(0, p.maxLives - p.lives));
    return `<div class="battle-hud">
      <div class="bh-item">🏅 Lv.${p.level}</div>
      <div class="bh-item">${hearts}</div>
      <div class="bh-item">💪 ATK ${stats.atk}</div>
      <div class="bh-item">🛡️ DEF ${stats.def}</div>
      <div class="bh-item">💰 ${p.gold}</div>
      <div class="bh-xp-section">
        <span>经验 ${p.xp}/${nextLevel}</span>
        <div class="bh-xp-bar"><div class="bh-xp-fill" style="width:${xpPct}%"></div></div>
      </div>
    </div>`;
  },

  // 战斗日志片段
  renderBattleLogHtml() {
    const combat = this.state.combat;
    return `<div class="battle-log">
      <div class="bl-title">⚔️ 战斗日志</div>
      ${combat.battleLog.length === 0 ? '<div class="bl-entry info">还没有战斗记录，开始挑战吧！</div>' :
        combat.battleLog.slice().reverse().slice(0, 20).map(e =>
          `<div class="bl-entry ${e.cls}">${e.text}</div>`
        ).join('')}
    </div>`;
  },

  // 错题复习：点击选项按钮直接提交
  _submitStuckOption(letter) {
    const combat = this.state.combat;
    if (!combat.isInBattle || !combat.currentEnemy || !combat.currentEnemy.isStuckExercise) return;
    this.submitBattleAnswer(letter);
  },

  // 错题复习战斗：从 stuckExercises 加载题目
  _startStuckBattle() {
    const combat = this.state.combat;
    const p = this.state.player;
    if (combat.isInBattle || combat.isGenerating) return;
    if (p.lives <= 0) {
      this.addBattleLog('⛔ 战意已耗尽！请先休息', 'miss');
      this.renderBattleSidebar();
      this.renderBattleView();
      return;
    }
    const exercises = this.state.stuckExercises || [];
    if (!exercises.length) {
      alert('暂无错题，请先上课积累卡住记录。');
      return;
    }
    // 随机抽 10 道（题库无限累积）
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, Math.min(10, shuffled.length));
    combat.questionPool = pool.map((ex, i) => {
      // 确保 options 是数组，如果缺失则从 problem 中提取
      let opts = ex.options || [];
      if (!opts.length && ex.question) {
        const lines = ex.question.split('\n');
        opts = lines.filter(l => /^[A-D][.、)]/.test(l.trim()));
        if (opts.length < 4) opts = []; // 提取不足4个则放弃
      }
      return {
        monsterName: '📝 ' + (ex.knowledgePoint || '错题' + (i+1)),
        problem: ex.question,
        options: opts,
        answer: ex.correctAnswer || '',
        difficulty: 'medium',
        isStuckExercise: true,
        explanation: ex.explanation || '',
        trapNotes: ex.trapNotes || {}
      };
    });
    combat.currentDifficulty = 'medium';
    combat.isInBattle = false;
    combat.isGenerating = false;
    combat.bossDefeated = false;
    combat.livesLostThisRound = 0;
    combat.currentEnemy = null;
    this.addBattleLog('🎯 错题复习模式启动！共 ' + pool.length + ' 道题', 'info');
    this.addBattleLog('💡 这些题目基于你上课时的真实卡住点生成', 'info');
    this.startNextBattle();
  },

  // 1. 用户选择难度
  pickDifficulty(difficulty) {
    const combat = this.state.combat;
    const p = this.state.player;
    if (combat.isInBattle || combat.isGenerating) return;
    if (p.lives <= 0) {
      this.addBattleLog('⛔ 战意已耗尽！请先休息', 'miss');
      this.renderBattleSidebar();
      this.renderBattleView();
      return;
    }
    const books = this.state.exerciseBooks;
    if (!books || books.length === 0) {
      this.addBattleLog('❌ 没有可用的习题集，请先放入 .txt 文件到 习题集/ 目录', 'miss');
      this.renderBattleView();
      return;
    }
    if (!this.state.apiKey) {
      this.addBattleLog('❌ 请先设置 API Key', 'miss');
      this.renderBattleView();
      return;
    }

    combat.currentDifficulty = difficulty;
    // 新的一轮，重置状态
    combat.shielded = false;
    combat.bossDefeated = false;
    combat.livesLostThisRound = 0;
    p.lives = p.maxLives;

    // 检查该难度的备选题池
    const pool = combat.questionPool.filter(q => q.difficulty === difficulty);
    if (pool.length > 0) {
      // 有备选题，直接开始（保留同伴）
      this.startBattle();
    } else {
      // 无备选题，清除同伴后重新生成
      combat.companion = null;
      combat.invincible = false;

      // 检测背包中是否有树产道具可召唤导师
      const availableCompanions = this.getAvailableCompanions();
      if (availableCompanions.length > 0) {
        // 显示选择弹窗
        this.showCompanionPicker(availableCompanions, difficulty);
      } else {
        this.generateQuestions(difficulty);
      }
    }
  },

  // 2. 调用 API 生成 10 道备选题
  async generateQuestions(difficulty) {
    const combat = this.state.combat;
    combat.isGenerating = true;
    this.addBattleLog(`🔮 正在召唤${DIFFICULTY_CONFIG[difficulty].label}怪物军团...`, 'info');
    this.renderBattleSidebar();
    this.renderBattleView();

    try {
      // 每次生成前重新扫描习题集，并清除内容缓存
      await this.scanExerciseBooks();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('exercise_')) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => LS.del(k));
      let allProblems = '';
      for (const book of this.state.exerciseBooks) {
        const content = await this.fetchExerciseContent(book.filename);
        allProblems += `\n--- ${book.displayName} ---\n${content}`;
      }

      const diffLabel = DIFFICULTY_CONFIG[difficulty].label.replace(/[^\w\u4e00-\u9fff]/g, '');
      const apiResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: `你是一个数学出题助手。从以下习题集中选取10道${diffLabel}的题目。
要求：
1. 必须基于习题集内容出题，不要自己编题
2. 按难度从易到难排列
3. 输出格式为 JSON 数组（不要其他文字）：
[{"monsterName":"怪物名称","problem":"题目内容，保留原始LaTeX","answer":"正确答案（数值或表达式）"}, ...]
4. 怪物名称每个都要不同，贴合数学概念，如"微分幽魂""积分守卫""极限之龙""导数之蛇""泰勒之影"等
5. 10个怪物名不能重复

习题集内容：
${allProblems}` },
            { role: 'user', content: `请从以上习题集中选取10道${diffLabel}题目并生成10个不同的怪物。` }
          ],
          temperature: 0.8,
          max_tokens: 3072
        })
      });
      if (!apiResp.ok) {
        const err = await apiResp.json().catch(() => ({}));
        throw new Error(err.error?.message || 'API 请求失败 (HTTP ' + apiResp.status + ')');
      }
      const resp = await apiResp.json();

      if (!resp || !resp.choices || !resp.choices[0]) {
        throw new Error('API 返回异常');
      }
      const text = resp.choices[0].message.content;
      // 尝试提取 JSON
      let jsonStr = text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      const questions = JSON.parse(jsonStr);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('API 返回的题目格式不正确');
      }

      // 添加到备选题池
      for (const q of questions) {
        combat.questionPool.push({
          monsterName: q.monsterName || '未知怪物',
          problem: q.problem || '',
          answer: String(q.answer || '').trim(),
          difficulty: difficulty
        });
      }

      combat.isGenerating = false;
      this.addBattleLog(`✨ 已召唤 ${questions.length} 个${diffLabel}怪物！`, 'hit');
      this.saveBattleData();

      // 自动开始战斗
      this.startBattle();
    } catch (e) {
      console.error('Generate questions error:', e);
      combat.isGenerating = false;
      this.addBattleLog(`❌ 召唤失败：${e.message}，点击按钮可重试`, 'miss');
      this.renderBattleSidebar();
      this.renderBattleView();
    }
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  // 导师提示（答错时调用）
  async companionHint(enemy) {
    const combat = this.state.combat;
    const teacherName = combat.companion.teacherName;
    try {
      const apiResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: `你是一位名叫${teacherName}的数学导师，正在陪同学生答题战斗。学生答错了以下题目，请用一句话给出提示引导（不直接给答案，不超20字）。` },
            { role: 'user', content: `题目：${enemy.problem}\n正确答案：${enemy.answer}\n请给一句简短提示。` }
          ],
          temperature: 0.5,
          max_tokens: 100
        })
      });
      if (apiResp.ok) {
        const resp = await apiResp.json();
        const hint = resp.choices?.[0]?.message?.content?.trim() || '再想想？';
        this.addBattleLog(`💡 ${teacherName}的提示：${hint}`, 'info');
      }
    } catch (e) {
      // 提示失败不影响战斗
    }
    this.renderBattleView();
  },

  // BOSS题生成（简单调API出一题，奖励翻倍）
  async generateBossQuestion(difficulty) {
    const combat = this.state.combat;
    combat.isGenerating = true;
    this.addBattleLog('👑 BOSS 正在降临...', 'hit');
    this.renderBattleView();

    try {
      let allProblems = '';
      await this.scanExerciseBooks();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('exercise_')) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => LS.del(k));
      for (const book of this.state.exerciseBooks) {
        const content = await this.fetchExerciseContent(book.filename);
        allProblems += `\n--- ${book.displayName} ---\n${content}`;
      }

      const diffLabel = DIFFICULTY_CONFIG[difficulty].label.replace(/[^\w\u4e00-\u9fff]/g, '');
      const apiResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: `你是一个数学出题助手。从以下习题集中选取1道最有挑战性的${diffLabel}题作为BOSS题目。
        要求：输出JSON（不要其他文字）：[{"monsterName":"BOSS怪物名","problem":"题目","answer":"答案"}]
        怪物名要霸气，如"极限之龙·史诗""积分之王·传说"等。
        习题集内容：
        ${allProblems}` },
            { role: 'user', content: '请出1道BOSS题。' }
          ],
          temperature: 0.8,
          max_tokens: 1024
        })
      });
      if (!apiResp.ok) throw new Error('BOSS召唤失败');
      const resp = await apiResp.json();
      const text = resp.choices[0].message.content;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      if (!Array.isArray(questions) || questions.length === 0) throw new Error('BOSS格式错误');

      const q = questions[0];
      combat.isGenerating = false;
      combat.isInBattle = true;
      combat.currentEnemy = {
        monsterName: (q.monsterName || '👑 BOSS').replace(/^\[?"?/, '').replace(/"?\]?$/, ''),
        problem: q.problem || '',
        answer: String(q.answer || '').trim(),
        difficulty: difficulty,
        isBoss: true
      };
      this.addBattleLog(`👑 BOSS ${combat.currentEnemy.monsterName} 出现了！`, 'hit');
      this.saveBattleData();
      this.renderBattleView();
    } catch (e) {
      combat.isGenerating = false;
      this.addBattleLog('❌ BOSS召唤失败，回到难度选择', 'miss');
      combat.currentDifficulty = null;
      this.renderBattleView();
    }
  },

  // 3. 从备选池取下一题开始战斗
  startBattle() {
    const combat = this.state.combat;
    if (combat.isInBattle) return;

    const pool = combat.questionPool.filter(q => q.difficulty === combat.currentDifficulty);
    if (pool.length === 0) {
      // 池空了，重新生成
      this.pickDifficulty(combat.currentDifficulty);
      return;
    }

    const q = pool[0];
    // 从池中移除
    const idx = combat.questionPool.indexOf(q);
    if (idx !== -1) combat.questionPool.splice(idx, 1);

    combat.isInBattle = true;
    combat.currentEnemy = {
      monsterName: q.monsterName,
      problem: q.problem,
      answer: q.answer,
      difficulty: combat.currentDifficulty,
      isStuckExercise: q.isStuckExercise || false,
      options: q.options || [],
      explanation: q.explanation || '',
      trapNotes: q.trapNotes || {},
      isBoss: q.isBoss || false
    };

    this.addBattleLog(`⚔️ 遭遇了 ${q.monsterName}！`, 'hit');
    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  // 4. 继续下一场（答对后自动调用）
  startNextBattle() {
    const combat = this.state.combat;
    const p = this.state.player;
    combat.isInBattle = false;
    combat.currentEnemy = null;

    // BOSS已击败 → 回到难度选择，本轮结束清除陪同
    if (combat.bossDefeated) {
      combat.livesLostThisRound = 0;
      combat.companion = null;
      combat.invincible = false;
      p.lives = p.maxLives;
      this.addBattleLog('👑 BOSS已被击败！血量已回满。', 'hit');
      this.renderBattleSidebar();
      this.renderBattleView();
      return;
    }

    const pool = combat.questionPool.filter(q => q.difficulty === combat.currentDifficulty);
    this.saveBattleData();
    this.renderBattleSidebar();

    if (pool.length > 0) {
      this.addBattleLog(`⏳ 还剩 ${pool.length} 只怪物等待挑战`, 'info');
      this.startBattle();
    } else {
      // 10只全部打完
      if (combat.livesLostThisRound === 0 && p.lives === p.maxLives) {
        // 满命通关 → BOSS战（本轮未结束，陪同保留至BOSS）
        combat.bossDefeated = true;
        this.addBattleLog('👑 完美通关！BOSS降临！', 'hit');
        this.renderBattleView();
        this.generateBossQuestion(combat.currentDifficulty);
      } else {
        // 本轮结束，清除陪同，回满血
        combat.currentDifficulty = null;
        combat.livesLostThisRound = 0;
        combat.companion = null;
        combat.invincible = false;
        p.lives = p.maxLives;
        this.addBattleLog('🏁 该难度怪物已全部清空！血量已回满。', 'info');
        this.saveBattleData();
        this.renderBattleView();
      }
    }
  },

  async submitBattleAnswer(userAnswer) {
    const combat = this.state.combat;
    if (!combat.isInBattle || !combat.currentEnemy) return;
    const enemy = combat.currentEnemy;
    const p = this.state.player;
    const stats = this.getPlayerStats();
    const diff = DIFFICULTY_CONFIG[enemy.difficulty];

    // ---- 答案判断（宽松版：先本地快速比对，失败则 AI 判断） ----
    const userAns = userAnswer.trim();
    const correctAns = enemy.answer.trim();

    // 错题复习模式：只看选项字母
    if (enemy.isStuckExercise) {
      const uLetter = userAns.replace(/[^a-dA-D]/g, '').toUpperCase();
      const cLetter = correctAns.replace(/[^a-dA-D]/g, '').toUpperCase();
      const exCorrect = uLetter === cLetter;
      const feedback = exCorrect
        ? '✅ 正确！' + (enemy.explanation ? ' ' + enemy.explanation : '')
        : '❌ 错误。正确答案是 ' + cLetter + '。' + (enemy.explanation ? '\n' + enemy.explanation : '');
      if (!exCorrect && enemy.trapNotes && enemy.trapNotes[uLetter]) {
        this.addBattleLog('💡 你选的' + uLetter + '：' + enemy.trapNotes[uLetter], 'info');
      }
      this.addBattleLog(feedback, exCorrect ? 'hit' : 'miss');
      if (exCorrect) {
        p.gold += 5;
        p.xp += 3;
        this.addBattleLog('💰 获得 5 金币，3 经验', 'gold');
        this.checkLevelUp();
        this.saveBattleData();
        this.renderBattleSidebar();
        this.renderBattleView();
        this.startNextBattle();
      } else {
        this.addBattleLog(`💡 提示：${enemy.explanation || '请仔细审题'}`, 'info');
        this.saveBattleData();
        this.renderBattleSidebar();
        this.renderBattleView();
        this.startNextBattle();
      }
      return;
    }

    // 快速本地比对
    let uNorm = userAns.replace(/\s+/g, '').toLowerCase();
    let cNorm = correctAns.replace(/\s+/g, '').toLowerCase();
    // 去掉不定积分的 +C
    uNorm = uNorm.replace(/[+-]\s*[Cc](?:\d*)$/, '');
    cNorm = cNorm.replace(/[+-]\s*[Cc](?:\d*)$/, '');
    // 去掉末尾句号
    uNorm = uNorm.replace(/[。.]+$/, '');
    cNorm = cNorm.replace(/[。.]+$/, '');

    let isCorrect = false;
    let aiFeedback = '';
    let companionLine = '';

    // 本地精确匹配或数值容差 → 秒过
    if (uNorm === cNorm) {
      isCorrect = true;
    } else {
      const numUser = parseFloat(uNorm);
      const numCorrect = parseFloat(cNorm);
      if (!isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) < 0.01) {
        isCorrect = true;
      }
    }

    // 本地未匹配 → 调 AI 判断（同时让陪同老师说一句话）
    if (!isCorrect && this.state.apiKey) {
      combat.isJudging = true;
      this.renderBattleView();
      try {
        const companionInfo = combat.companion
          ? `陪同导师：${combat.companion.teacherName}（性格：用角色的方式说一句话，不要太长）`
          : '无陪同导师';
        const aiResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.state.apiKey
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: `你是答题判卷助手。判断学生的答案是否正确。允许格式差异（x^2 等同 x²，1/2 等同 0.5，不同书写顺序的等价表达式也算对）。
如果学生答案正确 → correct: true，feedback 给一句简短鼓励（不超20字），companionLine 让陪同导师说一句夸奖的话。
如果错误 → correct: false，feedback 给引导提示（不直接给答案！不超30字），companionLine 让陪同导师说一句鼓励的话。
输出纯JSON：{"correct":true/false,"feedback":"判卷反馈","companionLine":"陪同导师说的话"}` },
              { role: 'user', content: `题目：${enemy.problem}\n参考答案：${enemy.answer}\n学生答案：${userAnswer}\n${companionInfo}` }
            ],
            temperature: 0.3,
            max_tokens: 200
          })
        });
        if (aiResp.ok) {
          const data = await aiResp.json();
          const reply = data.choices?.[0]?.message?.content?.trim() || '{}';
          const jsonMatch = reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            isCorrect = result.correct === true;
            aiFeedback = result.feedback || '';
            companionLine = result.companionLine || '';
          }
        }
      } catch (e) {
        console.warn('AI 判卷失败，回退到参考答案显示', e);
        aiFeedback = '';
      }
      combat.isJudging = false;
    }

    // 显示反馈
    if (aiFeedback) {
      this.addBattleLog((isCorrect ? '✅ ' : '💡 ') + aiFeedback, isCorrect ? 'hit' : 'info');
    }
    if (companionLine) {
      this.addBattleLog(`🧑‍🏫 ${combat.companion?.teacherName || '导师'}：${companionLine}`, 'info');
    }
    // 本地也没匹配且无 AI → 显示参考答案
    if (!isCorrect && !aiFeedback) {
      this.addBattleLog(`💡 参考答案：${correctAns}`, 'info');
    }

    if (isCorrect) {
      // 击杀怪物
      const goldReward = diff.goldBase + Math.floor(Math.random() * diff.goldRand);
      let xpReward = diff.xpBase + Math.floor(Math.random() * diff.xpRand);
      if (p.xpBoostRemaining > 0) {
        xpReward = Math.floor(xpReward * 1.5);
        p.xpBoostRemaining--;
      }

      // BOSS奖励翻3倍
      const bossMul = enemy.isBoss ? 3 : 1;
      p.gold += goldReward * bossMul;
      p.xp += xpReward * bossMul;

      if (enemy.isBoss) {
        this.addBattleLog('👑 BOSS击杀！奖励翻倍！', 'gold');
        // BOSS打完回到难度选择
        combat.bossDefeated = true;
      }

      // 随机掉落（15%概率，BOSS 50%）
      if (Math.random() < (enemy.isBoss ? 0.5 : 0.15)) {
        const randomItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        const existing = p.inventory.find(i => i.id === randomItem.id);
        if (existing) {
          existing.count++;
        } else {
          p.inventory.push({ id: randomItem.id, count: 1 });
        }
        this.addBattleLog(`🎁 战利品掉落：${randomItem.name}`, 'gold');
      }

      this.addBattleLog(`✅ 答对了！击杀 ${enemy.monsterName}！`, 'hit');
      this.addBattleLog(`💰 获得 ${goldReward * bossMul} 金币，${xpReward * bossMul} 经验`, 'gold');

      // 检查升级
      this.checkLevelUp();

      // 答对后自动进入下一场
      this.saveBattleData();
      this.renderBattleSidebar();
      this.renderBattleView();
      this.startNextBattle();
      return;
    } else {
      // 答错：无敌/护符/扣命
      if (combat.invincible) {
        // 无敌状态：不扣命，同伴已在上方说过话了
        this.addBattleLog('🛡️ 无敌护体！导师替你挡下了这一击', 'info');
      } else if (combat.shielded) {
        combat.shielded = false;
        this.addBattleLog('🛡️ 护符替你挡了一劫！', 'hit');
      } else {
        p.lives--;
        combat.livesLostThisRound++;
        const hearts = '❤️'.repeat(p.lives) + '🖤'.repeat(Math.max(0, p.maxLives - p.lives));
        this.addBattleLog(`❌ 答错了！损失一条命 ${hearts}`, 'miss');

        // 同伴已在上方说过话了
      }

      if (p.lives <= 0) {
        this.addBattleLog('💀 战意耗尽！等级降1，装备已清零', 'miss');
        // 降级
        if (p.level > 1) {
          p.level--;
          const levelData = LEVEL_TABLE[p.level - 1];
          p.attack = levelData.attack;
          p.defense = levelData.defense;
          p.xp = 0;
        }
        // 清空装备
        p.equipment = { weapon: null, armor: null, accessory: null };
        // 重置命
        p.lives = p.maxLives;
        combat.isInBattle = false;
        combat.currentEnemy = null;
        // 清空本轮全部战斗数据
        combat.currentDifficulty = null;
        combat.questionPool = [];
        combat.bossDefeated = false;
        combat.livesLostThisRound = 0;
        combat.shielded = false;
        // 战败后教师不再陪同
        combat.companion = null;
        combat.invincible = false;
      }
    }

    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  checkLevelUp() {
    const p = this.state.player;
    const maxLevel = LEVEL_TABLE.length;
    while (p.level < maxLevel) {
      const levelData = LEVEL_TABLE[p.level - 1];
      if (p.xp >= levelData.xpToNext) {
        p.xp -= levelData.xpToNext;
        p.level++;
        const newData = LEVEL_TABLE[p.level - 1];
        p.attack = newData.attack;
        p.defense = newData.defense;
        this.addBattleLog(`🎉 升级！现在 Lv.${p.level}，全属性提升！`, 'hit');
      } else {
        break;
      }
    }
    this.saveBattleData();
  },

  // 恢复一条命（战斗中可用）
  restoreLife() {
    const p = this.state.player;
    if (p.lives >= p.maxLives) {
      this.addBattleLog('❤️ 命已经满了！', 'info');
      return;
    }
    p.lives = Math.min(p.maxLives, p.lives + 1);
    this.addBattleLog('❤️ 恢复了一条命！', 'hit');
    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  // ========== 侧边栏渲染 ==========
  renderSidebar() {
    this.renderOutlineTree();
    this.renderTeacherSelect();
    this.renderTreesPanel();
    this.renderItemsPanel();
    this.renderBattleSidebar();
    this.updateStats();
    this.updateWechatBadge();
    this.updatePetBadge();
  },

  renderTreesPanel() {
    const container = $('#trees-panel');
    const trees = this.state.trees;
    container.innerHTML = Object.values(trees).map(t => `
      <div class="tree-row">
        <span class="tree-icon">${t.icon}</span>
        <div class="tree-info">
          <div class="tree-name">${t.name}</div>
          <div class="tree-status">${t.phase} · ${t.guardian}</div>
        </div>
        <span class="tree-branches">${t.branchesCount}枝</span>
      </div>
    `).join('');
  },

  renderItemsPanel() {
    const container = $('#items-panel');
    const trees = this.state.trees;
    const items = [
      { label: '🟤 橡子', count: trees.oak.items.acorn },
      { label: '✨ 金橡子', count: trees.oak.items.goldenAcorn },
      { label: '💧 露水', count: trees.willow.items.dew },
      { label: '🌊 海洋之泪', count: trees.willow.items.oceanTear },
      { label: '🌸 花瓣', count: trees.laurel.items.petal },
      { label: '🌟 金花瓣', count: trees.laurel.items.goldenFlower }
    ].filter(i => i.count > 0);

    if (!items.length) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text-secondary)">（空的）</div>';
      return;
    }
    container.innerHTML = items.map(i => `
      <div class="item-row">
        <span class="item-name">${i.label}</span>
        <span class="item-count">×${i.count}</span>
      </div>
    `).join('');
  },

  renderBattleSidebar() {
    const container = $('#battle-status');
    const p = this.state.player;
    const stats = this.getPlayerStats();
    const nextLevel = p.level < LEVEL_TABLE.length ? LEVEL_TABLE[p.level - 1].xpToNext : 0;
    const hearts = '❤️'.repeat(p.lives) + '🖤'.repeat(Math.max(0, p.maxLives - p.lives));

    let html = `
      <div class="bs-row">Lv.${p.level}  ⚔️ ${p.xp}/${nextLevel}</div>
      <div class="bs-row">${hearts}</div>
      <div class="bs-row">💰 ${p.gold} 金币</div>
      <div class="bs-row" style="font-size:11px" title="上课时消耗1枚可向教师求助">💡 灵感: ${p.stuckTokens||0}</div>
    `;

    if (this.state.combat.isInBattle && this.state.combat.currentEnemy) {
      html += `<div class="bs-row" style="color:var(--danger)">👾 ${this.state.combat.currentEnemy.monsterName}</div>`;
    } else if (p.lives > 0) {
      html += `<button class="btn btn-sm btn-primary bs-btn" onclick="App.switchView('battle')">🎮 开始挑战</button>`;
      const stuckCount = (this.state.stuckExercises || []).length;
      html += `<div style="font-size:10px;color:var(--text-secondary);margin-top:4px">📝 错题：${stuckCount} 道</div>`;
      if (stuckCount > 0) {
        html += `<button class="btn btn-sm btn-accent bs-btn" onclick="App._startStuckBattle()" style="margin-top:2px">复习错题</button>`;
      }
    } else {
      html += `<div class="bs-row" style="color:var(--danger)">💀 战意耗尽</div>`;
    }
    container.innerHTML = html;
  },

  renderBattleView() {
    const container = $('#battle-layout');
    const p = this.state.player;
    const combat = this.state.combat;

    // 如果正在显示邀请弹窗，用专用渲染
    const companions = this.getAvailableCompanions();
    if (!combat.isInBattle && !combat.isGenerating && companions.length > 0 &&
        combat.currentDifficulty !== null && combat.questionPool.length === 0 && !this._companionShown) {
      this._companionShown = true;
      this.renderBattleViewWithCompanionPicker(companions, combat.currentDifficulty);
      return;
    }
    this._companionShown = false;

    let html = this.renderHudHtml();

    // 护符/导师状态提示
    if (combat.isInBattle) {
      const statuses = [];
      if (combat.invincible) statuses.push('👑 无敌护体');
      if (combat.shielded) statuses.push('🛡️ 护符护体');
      if (combat.companion) statuses.push(`🧑‍🏫 ${combat.companion.teacherName}陪同`);
      if (statuses.length) {
        html += `<div class="battle-arena-status">${statuses.join(' · ')}</div>`;
      }
    }

    // 战斗区域
    html += `<div class="battle-arena">`;
    if (combat.isJudging) {
      html += `
        <div class="ba-loading">
          <span class="loading-spinner"></span>
          <div class="ba-start-text">🤔 AI 判卷中...</div>
          <div style="margin-top:8px;">正在比对答案并请陪同导师点评</div>
        </div>
      `;
    } else if (combat.isGenerating) {
      html += `
        <div class="ba-loading">
          <span class="loading-spinner"></span>
          <div class="ba-start-text">正在召唤怪物军团...</div>
          <div style="margin-top:8px;">正在通过 DeepSeek 生成题目，请稍候</div>
        </div>
      `;
    } else if (combat.isInBattle && combat.currentEnemy) {
      const enemy = combat.currentEnemy;
      const isBoss = enemy.isBoss;
      // 错题复习：显示选项按钮
      if (enemy.isStuckExercise && enemy.options && enemy.options.length >= 4) {
        const optionLabels = ['A', 'B', 'C', 'D'];
        html += `
          <div class="ba-monster">📝</div>
          <div class="ba-monster-name">${enemy.monsterName}</div>
          <div class="ba-problem" style="white-space:pre-wrap">${enemy.problem}</div>
          <div class="ba-options-row">
            ${enemy.options.map((opt, i) => `
              <button class="btn ba-option-btn" onclick="App._submitStuckOption('${optionLabels[i]}')">
                <span class="ba-option-letter">${optionLabels[i]}</span>
                <span class="ba-option-text">${opt.replace(/^[A-D][.、]\s*/, '')}</span>
              </button>
            `).join('')}
          </div>
        `;
      } else {
        html += `
          <div class="ba-monster">${isBoss ? '🐉' : '👾'}</div>
          <div class="ba-monster-name">${enemy.monsterName}</div>
          <div class="ba-problem">📝 <span class="battle-problem-katex">${enemy.problem}</span></div>
          <div class="ba-input-row">
            <input type="text" id="battle-answer-input" placeholder="输入你的答案..." onkeydown="if(event.key==='Enter')App.submitBattleAnswerFromInput()">
            <button class="btn btn-primary" onclick="App.submitBattleAnswerFromInput()">提交答案</button>
          </div>
        `;
      }
    } else {
      // 计算各难度备选数量
      const easyCount = combat.questionPool.filter(q => q.difficulty === 'easy').length;
      const medCount = combat.questionPool.filter(q => q.difficulty === 'medium').length;
      const hardCount = combat.questionPool.filter(q => q.difficulty === 'hard').length;
      const currentDiff = combat.currentDifficulty;
      html += `
        <div class="ba-start-text">选择难度开始挑战！</div>
        <div class="ba-actions">
          <div class="ba-diff-col">
            <button class="btn btn-sm btn-outline ba-difficulty-btn ${currentDiff === 'easy' ? 'active' : ''}" onclick="App.pickDifficulty('easy')">🌱 简单</button>
            <span class="ba-remaining">剩余 ${easyCount} 只</span>
          </div>
          <div class="ba-diff-col">
            <button class="btn btn-sm btn-outline ba-difficulty-btn ${currentDiff === 'medium' ? 'active' : ''}" onclick="App.pickDifficulty('medium')">🔥 中等</button>
            <span class="ba-remaining">剩余 ${medCount} 只</span>
          </div>
          <div class="ba-diff-col">
            <button class="btn btn-sm btn-outline ba-difficulty-btn ${currentDiff === 'hard' ? 'active' : ''}" onclick="App.pickDifficulty('hard')">💀 困难</button>
            <span class="ba-remaining">剩余 ${hardCount} 只</span>
          </div>
        </div>
        <div class="ba-stuck-review">
          <div class="ba-stuck-label">📝 错题复习 · 来自教学中的真实卡住点</div>
          ${(this.state.stuckExercises||[]).length>0?'<button class="btn btn-accent ba-stuck-btn" onclick="App._startStuckBattle()">🎯 复习错题（'+this.state.stuckExercises.length+' 道）</button>':'<div style="font-size:11px;color:var(--text-secondary)">暂无错题。上课时AI检测到卡住点后，下课时自动生成。</div>'}
        </div>`;
    }
    html += `</div>`;

    // 战斗中显示剩余怪物数量状态行
    if (combat.isInBattle && combat.currentEnemy) {
      const enemy = combat.currentEnemy;
      const isBoss = enemy.isBoss;
      html += `<div class="battle-arena-status">${isBoss ? '👑' : '⚔️'} ${DIFFICULTY_CONFIG[enemy.difficulty].label} · ${isBoss ? 'BOSS 战！' : '剩余 ' + combat.questionPool.length + ' 只'}</div>`;
    }

    html += this.renderBattleLogHtml();
    html += this.renderShopHtml();
    html += this.renderBattleInventoryHtml();

    container.innerHTML = html;
    if (window.renderMathInElement) {
      renderMathInElement(container, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
    }
  },

  // ========== 商店渲染 ==========
  renderShopHtml() {
    const p = this.state.player;
    const eq = p.equipment;
    let html = `<div class="battle-shop">
      <div class="bs-title">🛒 商店</div>`;
    SHOP_ITEMS.forEach(item => {
      const isEquipped = eq.weapon === item.id || eq.armor === item.id || eq.accessory === item.id;
      html += `<div class="bs-item-row">
        <div class="bs-item-info">
          <span>${item.name}</span>
          <span class="bs-item-desc">${item.desc}</span>
        </div>
        <div>
          ${isEquipped ? '<span class="bs-equipped">✔️ 已装备</span>' :
            item.type === 'equipment' ?
              `<button class="btn btn-sm btn-outline bs-buy-btn" onclick="App.buyItem('${item.id}')">💰${item.price}</button>` :
              `<button class="btn btn-sm btn-outline bs-buy-btn" onclick="App.buyItem('${item.id}')">💰${item.price}</button>`
          }
        </div>
      </div>`;
    });
    html += `</div>`;
    return html;
  },

  // ========== 战斗背包渲染 ==========
  renderBattleInventoryHtml() {
    const p = this.state.player;
    const eq = p.equipment;
    let html = `<div class="battle-shop">
      <div class="bs-title">🎒 背包 & 装备</div>`;

    // 装备栏
    html += `<div class="inv-equip-row">`;
    html += `⚔️ 武器：${eq.weapon ? SHOP_ITEMS.find(i => i.id === eq.weapon)?.name || eq.weapon : '无'}`;
    if (eq.weapon) html += ` <button class="btn btn-sm btn-outline inv-unequip-btn" onclick="App.unequipItem('weapon')">卸下</button>`;
    html += `<br>`;
    html += `🛡️ 防具：${eq.armor ? SHOP_ITEMS.find(i => i.id === eq.armor)?.name || eq.armor : '无'}`;
    if (eq.armor) html += ` <button class="btn btn-sm btn-outline inv-unequip-btn" onclick="App.unequipItem('armor')">卸下</button>`;
    html += `<br>`;
    html += `💍 饰品：${eq.accessory ? SHOP_ITEMS.find(i => i.id === eq.accessory)?.name || eq.accessory : '无'}`;
    if (eq.accessory) html += ` <button class="btn btn-sm btn-outline inv-unequip-btn" onclick="App.unequipItem('accessory')">卸下</button>`;
    html += `</div>`;

    // 道具列表
    if (p.inventory.length === 0) {
      html += `<div class="inv-empty">（空的）</div>`;
    } else {
      p.inventory.forEach(inv => {
        const item = SHOP_ITEMS.find(i => i.id === inv.id);
        if (!item) return;
        html += `<div class="bs-item-row">
          <span>${item.name} ×${inv.count}</span>
          <div>
            ${item.type === 'consumable' ? `<button class="btn btn-sm btn-outline bs-buy-btn" onclick="App.useItem('${item.id}')">使用</button>` : ''}
            ${item.type === 'equipment' ? `<button class="btn btn-sm btn-outline bs-buy-btn" onclick="App.equipItem('${item.id}')">装备</button>` : ''}
          </div>
        </div>`;
      });
    }
    html += `</div>`;
    return html;
  },

  // ========== 商店/道具操作 ==========
  buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    const p = this.state.player;
    if (p.gold < item.price) {
      this.addBattleLog(`❌ 金币不足！需要 ${item.price} 金币`, 'miss');
      this.renderBattleView();
      return;
    }
    p.gold -= item.price;
    // 灵感硬币单独计数
    if (item.type === 'stuckToken') {
      p.stuckTokens = (p.stuckTokens || 0) + 1;
      this.addBattleLog(`🛒 购买了 ${item.name}（当前 ${p.stuckTokens} 枚）`, 'gold');
    } else {
      const existing = p.inventory.find(i => i.id === itemId);
      if (existing) { existing.count++; }
      else { p.inventory.push({ id: itemId, count: 1 }); }
      this.addBattleLog(`🛒 购买了 ${item.name}`, 'gold');
    }
    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  useItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return;
    const p = this.state.player;
    const combat = this.state.combat;
    const inv = p.inventory.find(i => i.id === itemId);
    if (!inv || inv.count <= 0) return;

    if (itemId === 'charm') {
      // 护符：战斗中使用，本场获得护体
      if (!combat.isInBattle) {
        this.addBattleLog('⚔️ 请在战斗中护符！', 'info');
        return;
      }
      combat.shielded = true;
      inv.count--;
      if (inv.count <= 0) p.inventory = p.inventory.filter(i => i.id !== itemId);
      this.addBattleLog('🛡️ 护符已激活！下次答错将自动抵消', 'hit');
      this.saveBattleData();
      this.renderBattleView();
      return;
    }

    if (itemId === 'xpBoost') {
      // 经验药水
      p.xpBoostRemaining += 5;
      inv.count--;
      if (inv.count <= 0) p.inventory = p.inventory.filter(i => i.id !== itemId);
      this.addBattleLog('⚡ 经验加成已激活，持续 5 场战斗', 'hit');
      this.saveBattleData();
      this.renderBattleView();
      return;
    }
  },

  equipItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || item.type !== 'equipment') return;
    const p = this.state.player;
    const inv = p.inventory.find(i => i.id === itemId);
    if (!inv || inv.count <= 0) return;

    // 如果该槽位已有装备，先卸下
    const slot = item.slot;
    if (p.equipment[slot]) {
      const oldId = p.equipment[slot];
      const oldInv = p.inventory.find(i => i.id === oldId);
      if (oldInv) oldInv.count++; else p.inventory.push({ id: oldId, count: 1 });
    }

    p.equipment[slot] = itemId;
    inv.count--;
    if (inv.count <= 0) {
      p.inventory = p.inventory.filter(i => i.id !== itemId);
    }
    this.addBattleLog(`⚔️ 装备了 ${item.name}`, 'hit');
    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  unequipItem(slot) {
    const p = this.state.player;
    if (!p.equipment[slot]) return;
    const oldId = p.equipment[slot];
    const oldInv = p.inventory.find(i => i.id === oldId);
    if (oldInv) oldInv.count++; else p.inventory.push({ id: oldId, count: 1 });
    p.equipment[slot] = null;
    this.addBattleLog(`🔄 卸下了装备`, 'info');
    this.saveBattleData();
    this.renderBattleSidebar();
    this.renderBattleView();
  },

  submitBattleAnswerFromInput() {
    if (this.state.combat.isJudging) return; // AI 判卷中，防止连点
    const input = $('#battle-answer-input');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) return;
    input.value = '';
    this.submitBattleAnswer(answer);
  },


  // ===== Toast 通知 + 加载遮罩 =====
  // type: 'info' | 'ok' | 'err' | 'loading'
  _toast(msg, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = { info: 'var(--accent)', ok: '#4a8', err: '#d44', loading: 'var(--text-secondary)' };
    const icons = { info: '💬', ok: '✅', err: '❌', loading: '⏳' };
    const el = document.createElement('div');
    el.style.cssText = 'padding:10px 16px;border-radius:6px;font-size:13px;color:#fff;background:' + (colors[type] || colors.info) + ';box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:auto;max-width:360px;transition:opacity .3s';
    el.textContent = (icons[type] || '') + ' ' + msg;
    container.appendChild(el);
    if (duration > 0) {
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, duration);
    }
    return el;  // 返回元素，调用方可手动 remove
  },

  _showLoading(msg = '处理中…') {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    const textEl = document.getElementById('loading-text');
    if (textEl) textEl.textContent = msg;
    overlay.style.display = 'flex';
    // 禁用导航和底栏点击（保留侧边栏可滚动）
    const nav = document.querySelector('.sidebar-nav');
    const footer = document.querySelector('.sidebar-footer');
    if (nav) nav.style.pointerEvents = 'none';
    if (footer) footer.style.pointerEvents = 'none';
  },
  _hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
    const nav = document.querySelector('.sidebar-nav');
    const footer = document.querySelector('.sidebar-footer');
    if (nav) nav.style.pointerEvents = '';
    if (footer) footer.style.pointerEvents = '';
  },


  // 从角色卡文件读取全部教学记忆
  async _loadTeacherMemory(teacherId) {
    try {
      const resp = await fetch('老师/' + encodeURIComponent(teacherId) + '.md');
      if (!resp.ok) return [];
      const md = await resp.text();
      const secIdx = md.indexOf('\n## 教学记忆');
      if (secIdx < 0) return [];
      const sec = md.substring(secIdx);
      const entries = [];
      // 匹配 ### 日期 标题\n内容 或 ### 早期教学记忆（压缩）\n内容
      const re = /\n### (\d{4}-\d{2}-\d{2}) (.+?)\n([\s\S]*?)(?=\n### |\n*$)/g;
      let m;
      while ((m = re.exec(sec)) !== null) {
        entries.push({ date: m[1], lesson: m[2].trim(), note: m[3].trim() });
      }
      return entries; // 全部返回，不截断
    } catch (e) { return []; }
  },

  // 追加教学记忆到角色卡，超过 20 条时压缩旧条目
  async _appendTeacherMemory(teacherId, date, lesson, note) {
    const memPath = '老师/' + encodeURIComponent(teacherId) + '.md';
    let existing = '';
    try { const r = await fetch(memPath); if (r.ok) existing = await r.text(); } catch (e) {}

    // 定位 ## 教学记忆 段落，解析现有条目
    const secIdx = existing.indexOf('\n## 教学记忆');
    let beforeSec = '', secContent = '';
    if (secIdx >= 0) {
      beforeSec = existing.substring(0, secIdx);
      secContent = existing.substring(secIdx + 1); // 不含开头的 \n
    } else {
      beforeSec = existing;
      secContent = '\n## 教学记忆\n';
    }

    // 追加新条目
    const newEntry = '\n### ' + date + ' ' + lesson + '\n' + note;
    secContent += newEntry;

    // 统计当前 ### 条目数
    const allEntries = (secContent.match(/\n### /g) || []);
    const MAX_FULL = 20; // 最多保留 20 条完整记忆

    if (allEntries.length > MAX_FULL) {
      // 压缩：保留最近 15 条完整，其余合并为一条摘要
      const blocks = secContent.split(/\n(?=### )/);
      // blocks[0] 是 "## 教学记忆\n" 头部
      const header = blocks[0];
      const entryBlocks = blocks.slice(1); // 所有 ### 条目（按时间顺序，旧在前）
      const keepCount = 15;
      const oldBlocks = entryBlocks.slice(0, entryBlocks.length - keepCount);
      const recentBlocks = entryBlocks.slice(entryBlocks.length - keepCount);

      // 从旧条目提取关键信息做无损压缩（保留日期+课题，截短笔记）
      const compressedLines = oldBlocks.map(b => {
        const lines = b.trim().split('\n');
        const head = lines[0] || '';
        const body = lines.slice(1).join(' ').substring(0, 80); // 前 80 字
        return head + '\n' + body + (lines.length > 2 ? '…' : '');
      });

      const compressedEntry = '\n### 早期教学记忆（压缩·共' + oldBlocks.length + '条）\n' +
        compressedLines.join('\n\n');

      secContent = header + compressedEntry + '\n' + recentBlocks.join('');
    }

    const newContent = beforeSec + secContent;
    await this._savePlanFile(memPath, newContent);

    // LS 缓存（兜底）
    if (!this.state.teacherNotes[teacherId]) this.state.teacherNotes[teacherId] = [];
    this.state.teacherNotes[teacherId].push({ date, lesson, note });
    if (this.state.teacherNotes[teacherId].length > 20) {
      this.state.teacherNotes[teacherId] = this.state.teacherNotes[teacherId].slice(-20);
    }
    LS.set('teacher_notes', this.state.teacherNotes);
  },

  // 检查教案缓存状态
  _hasSectionPlan(chNum, secNum) {
    const courseName = this.state.selectedCourse || "";
    const key = "plan_section_" + courseName + "_第" + chNum + "章_" + secNum;
    return LS.get(key, null) !== null;
  },
  _hasChapterPlan(chNum) {
    const courseName = this.state.selectedCourse || "";
    const key = "plan_chapter_" + courseName + "_" + chNum;
    return LS.get(key, null) !== null;
  },

  renderOutlineTree() {
    const tree = $('#outline-tree');
    // 渲染课程选择器
    const courseSel = $('#course-select');
    const courses = this.state.textbookCourses;
    if (courses.length > 1) {
      courseSel.style.display = '';
      courseSel.innerHTML = courses.map(c =>
        `<option value="${c.courseName}"${c.courseName === this.state.selectedCourse ? ' selected' : ''}>${c.courseName}（${c.chapters.reduce((sum,ch) => sum + ch.sections.length, 0)} 节）</option>`
      ).join('');
    } else if (courses.length === 1) {
      courseSel.style.display = 'none';
    }

    const outline = this.state.textbookOutline;
    if (!outline.length) {
      tree.innerHTML = '<div style="font-size:13px;color:var(--text-secondary)">该课程下暂无教材<br>将 .md 文件放入 教材/' + (this.state.selectedCourse || '') + ' 文件夹</div>' +
        '<button class="btn btn-sm btn-outline" style="margin-top:8px" onclick="App.rescanTextbooks()">🔄 重新扫描教材</button>';
      return;
    }
    // 多选字数统计
    // 动态教学模式：显示当前位置和进度
    const pos = this.state.coursePosition[this.state.selectedCourse];
    const flatAllForUI = (() => {
      const course = this.state.textbookCourses.find(c => c.courseName === this.state.selectedCourse);
      if (!course) return [];
      const f = [];
      course.chapters.forEach(ch => {
        ch.sections.forEach(s => f.push({ filename: s.filename, chapterNum: ch.chapterNum, num: s.num, title: s.title }));
      });
      return f;
    })();
    const curIdx = pos ? flatAllForUI.findIndex(s => s.filename === pos.filename) : -1;
    const doneCount = this.state.progress ? this.state.progress.lessonRecords.filter(r => r.courseName === this.state.selectedCourse).length : 0;

    tree.innerHTML = (flatAllForUI.length > 0 ? `<div style="padding:8px 12px;margin-bottom:4px;font-size:12px;border-radius:4px;background:var(--accent-light);color:var(--text-secondary)">📊 课程进度：${doneCount} / ${flatAllForUI.length} 节已完成${curIdx>=0?' · 📍 当前位置：第'+flatAllForUI[curIdx].chapterNum+'章 '+flatAllForUI[curIdx].num:'未开始'}</div>` : '') + outline.map(ch => {
      const chNum = ch.chapterNum;
      const doneCount = ch.sections.filter(s => this.isSectionDone(chNum, s.num)).length;
      return `
        <div class="outline-chapter">
          <div class="outline-chapter-header" onclick="App.toggleChapter(this)" data-chapter="${chNum}">
            <span class="arrow">▶</span>
            <span>第${chNum}章</span>
            <span class="outline-plan-btn" onclick="App._generateChapterPlan('${this.escapeHtml(this.state.selectedCourse)||''}',${chNum}).then(()=>App.renderOutlineTree()).catch(e=>alert('章概括生成失败：'+e.message));event.stopPropagation()" title="生成整章教学概括（AI读取全章内容）" style="margin-left:6px;cursor:pointer;font-size:9px;opacity:0.6">📝章</span>
            <span style="font-size:11px;color:var(--text-secondary);margin-left:auto">${doneCount}/${ch.sections.length}</span>
          </div>
          <div class="outline-sections" data-chapter="${chNum}">
            ${ch.sections.map(s => {
              const done = this.isSectionDone(chNum, s.num);
              // 根据分节号深度计算缩进（1.1=0, 1.1.1=16px, 1.1.1.1=32px）
              const depth = s.num.split('.').length - 2;
              const indent = Math.max(0, depth) * 16;
              const isCurrent = pos && pos.chapterNum === chNum && pos.num === s.num;
              const onClick = this.state.isClassActive ? '' : `onclick="App._jumpToSection('${this.escapeHtml(s.filename)}',${chNum},'${s.num}','${this.escapeHtml(s.title)}')"`;
              return `<div class="outline-section${isCurrent?' current':''}${done?' done':''}" title="${s.title}" style="padding-left:${indent + 12}px;${this.state.isClassActive?'':'cursor:pointer'}" ${onClick}>
                <span class="outline-section-indicator" style="margin-right:6px;font-size:11px;flex-shrink:0">${isCurrent ? '📍' : done ? '✅' : '·'}</span>
                <span class="outline-section-title">${chNum}.${s.num} ${s.title}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  },

  toggleSectionDone(chNum, secNum, title) {
    const p = this.state.progress;
    if (!p) return;
    const idx = p.lessonRecords.findIndex(r =>
      r.chapterNum === chNum && r.sectionNum === secNum
    );
    if (idx >= 0) {
      // 取消完成
      p.lessonRecords.splice(idx, 1);
      p.completedLessons = Math.max(0, (p.completedLessons || 0) - 1);
    } else {
      // 标记完成
      p.lessonRecords.push({
        date: formatDate(new Date()),
        teacher: '手动标记',
        chapterNum: chNum,
        sectionNum: secNum,
        title: title,
        summary: '手动标记为已学完'
      });
      p.completedLessons = (p.completedLessons || 0) + 1;
    }
    if (p.lessonRecords.length > 0) {
      const last = p.lessonRecords[p.lessonRecords.length - 1];
      p.currentProgress = `已完成第${last.chapterNum}章 ${last.title}`;
    } else {
      p.currentProgress = '准备开始';
    }
    LS.set('progress', p);
    this.renderOutlineTree();
    this.updateStats();
  },

  expandChapter(chNum) {
    const sec = $(`.outline-sections[data-chapter="${chNum}"]`);
    if (sec) sec.classList.add('open');
    const hdr = $(`.outline-chapter-header[data-chapter="${chNum}"] .arrow`);
    if (hdr) hdr.classList.add('open');
  },

  toggleChapter(el) {
    const chNum = el.dataset.chapter;
    const sec = $(`.outline-sections[data-chapter="${chNum}"]`);
    const arrow = el.querySelector('.arrow');
    sec.classList.toggle('open');
    arrow.classList.toggle('open');
  },

  isSectionDone(chNum, secNum) {
    if (!this.state.progress) return false;
    return this.state.progress.lessonRecords.some(r =>
      r.chapterNum === chNum && r.sectionNum === secNum
    );
  },

  // 点击侧边栏节标题 → 跳转到该节（未上课时可用）
  _jumpToSection(filename, chNum, secNum, title) {
    if (this.state.isClassActive) return;
    this.state.coursePosition[this.state.selectedCourse] = {
      filename, chapterNum: chNum, num: secNum, title
    };
    LS.set('course_position', this.state.coursePosition);
    $('#chat-topic').textContent = '📍 第' + chNum + '章 ' + secNum + ' ' + title;
    this._updateStartBtn();
    this.renderOutlineTree();
    if (!this.state.isClassActive) this._showReadyState();
  },

  selectSection(chNum, secNum, title, filename) {
    this.state.selectedSection = { chapterNum: chNum, num: secNum, title, filename };
    this.renderOutlineTree();
    this.expandChapter(chNum);
    const readerUrl = '教材阅读器.html?file=' + encodeURIComponent(filename);
    $('#chat-topic').innerHTML = `第${chNum}章 ${chNum}.${secNum} ${title} <a href="${readerUrl}" target="_blank" rel="noopener" title="在教材阅读器中打开" style="font-size:11px;color:var(--accent);text-decoration:none;margin-left:6px">📂</a>`;
    this._updateStartBtn();
    // 选课后切回准备上课状态（覆盖课后统计）
    if (!this.state.isClassActive) this._showReadyState();
  },

  // 构建平铺章节列表（用于连续性检查）
  _getFlatSections() {
    const flat = [];
    (this.state.textbookOutline || []).forEach(ch => {
      ch.sections.forEach(s => flat.push({ filename: s.filename }));
    });
    return flat;
  },

  // 多选章节切换（☑/☐）— 仅允许连续选课，不可跳节
  async toggleMultiSection(chNum, secNum, title, filename) {
    const arr = this.state.selectedSections;
    const idx = arr.findIndex(s => s.filename === filename);
    if (idx >= 0) {
      // 取消选中：检查剩余节是否仍连续或为空
      const afterRemove = arr.filter(s => s.filename !== filename);
      if (afterRemove.length > 1) {
        const flat = this._getFlatSections();
        const sorted = [...afterRemove].sort((a, b) => {
          return flat.findIndex(s => s.filename === a.filename) - flat.findIndex(s => s.filename === b.filename);
        });
        let ok = true;
        for (let i = 1; i < sorted.length; i++) {
          if (flat.findIndex(s => s.filename === sorted[i].filename) - flat.findIndex(s => s.filename === sorted[i-1].filename) !== 1) { ok = false; break; }
        }
        if (!ok) {
          alert('取消此节会破坏连续性。只能取消最前或最后面的选中节。');
          return;
        }
      }
      arr.splice(idx, 1);
    } else {
      // 检查重复：同一节不能选两次
      if (arr.some(s => s.filename === filename)) return;

      // 加入当前选中 + 新选中的，按课程顺序排序
      const flatSections = this._getFlatSections();
      const candidate = [...arr, { chapterNum: chNum, num: secNum, title, filename }];
      candidate.sort((a, b) => {
        const ai = flatSections.findIndex(s => s.filename === a.filename);
        const bi = flatSections.findIndex(s => s.filename === b.filename);
        return ai - bi;
      });

      // 检查是否连续（在 flatSections 中相邻）
      let consecutive = true;
      for (let i = 1; i < candidate.length; i++) {
        const prevIdx = flatSections.findIndex(s => s.filename === candidate[i-1].filename);
        const currIdx = flatSections.findIndex(s => s.filename === candidate[i].filename);
        if (currIdx - prevIdx !== 1) { consecutive = false; break; }
      }
      if (!consecutive) {
        alert('仅支持连选相邻章节（不能跳课）。\n请按课程顺序选择连续的小节。');
        return;
      }

      // 加载字数
      let charCount = 0;
      try {
        const content = await this.fetchSection(filename);
        charCount = content.length;
      } catch (e) { charCount = 0; }
      arr.push({ chapterNum: chNum, num: secNum, title, filename, charCount });
    }
    this.renderOutlineTree();
    this._updateStartBtn();
    if (!this.state.isClassActive) this._showReadyState();
  },

  _updateStartBtn() {
    // 动态教学模式：选了课程和教师即可开始
    const hasCourse = !!this.state.selectedCourse;
    const hasTeacher = !!this.state.selectedTeacherId;
    const ok = hasCourse && hasTeacher;
    $('#btn-start-class').disabled = !ok;
    if (!ok) $('#btn-start-class').title = hasCourse ? '请选择一位授课导师' : '请先选择课程';
    else $('#btn-start-class').title = '';
  },

  // 重置聊天空状态为"准备上课"（覆盖课后统计信息）
  _showReadyState() {
    const contentEl = $('#chat-empty-content');
    if (contentEl) {
      contentEl.innerHTML = `<div class="chat-empty-icon">📖</div>
        <p>在左侧选择课程和授课导师，然后点击"开始上课"</p>
        <p class="hint">系统将自动从上次进度继续——导师用苏格拉底法引导你，每次只提一个问题</p>
        <p class="hint" style="font-size:11px;margin-top:4px">💡 学完一节后AI会自动推进到下一节 · 输入 /next 可手动跳节 · 输入 /done 可标记当前节完成</p>`;
    }
    $('#chat-empty').style.display = 'flex';
    $('#chat-messages').style.display = 'none';
    $('#chat-input-area').style.display = 'none';
  },

  renderTeacherSelect() {
    const container = $('#teacher-select');
    if (!this.state.teachers.length) {
      container.innerHTML = '<div style="font-size:13px;color:var(--text-secondary)">未加载导师</div>';
      return;
    }
    const locked = this.state.isClassActive;
    container.innerHTML = this.state.teachers.map(t => {
      const roleTag = t.orderRole === '守护导师' ? '🌳 ' : '🌱 ';
      return `<div class="teacher-card${this.state.selectedTeacherId===t.id?' selected':''}"
               onclick="App.selectTeacher('${t.id}')">
        <div class="teacher-card-avatar" style="background:${t.avatarColor}">
          ${t.name.charAt(0)}
        </div>
        <div class="teacher-card-info">
          <div class="teacher-card-name">${roleTag}${t.name}</div>
          <div class="teacher-card-role">${t.role || t.core || ''}</div>
        </div>
      </div>`;
    }).join('');
  },

  selectTeacher(id) {
    if (this.state.isClassActive) return;  // 上课中不可切换教师
    this.state.selectedTeacherId = id;
    const t = this.state.teachers.find(x => x.id === id);
    if (t) {
      const roleTag = t.orderRole === '守护导师' ? '🌳 ' : '🌱 ';
      $('#chat-teacher-name').textContent = roleTag + t.name + (t.role ? ' · ' + t.role : '');
      $('#chat-avatar').style.background = t.avatarColor;
      $('#chat-avatar').textContent = t.name.charAt(0);
    }
    this.renderTeacherSelect();
    this._updateStartBtn();
    // 选导师后切回准备上课状态
    if (!this.state.isClassActive) this._showReadyState();
  },

  updateStats() {
    const p = this.state.progress;
    const bonds = this.state.bonds;
    if (!p) return;
    // 从 lessonRecords + courseMastery 中收集所有掌握知识点
    const allMastered = new Set();
    (p.lessonRecords || []).forEach(r => {
      if (r.masteredConcepts) r.masteredConcepts.forEach(c => allMastered.add(c));
    });
    if (p.courseMastery) {
      Object.values(p.courseMastery).forEach(arr => arr.forEach(c => allMastered.add(c)));
    }
    // 兼容旧版 masteredPoints
    (p.masteredPoints || []).forEach(c => allMastered.add(c));
    const masteredCount = allMastered.size;
    $('#stats-panel').innerHTML = `
      <div class="stat-row"><span class="stat-label">已完成课数</span><span class="stat-value">${p.completedLessons || 0}</span></div>
      <div class="stat-row"><span class="stat-label">掌握知识点</span><span class="stat-value">${masteredCount}</span></div>
      <div class="stat-row"><span class="stat-label">游戏天数</span><span class="stat-value">第${this.state.gameDay}天 · ${this.state.gameTime}</span></div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-secondary);border-top:1px solid var(--border);padding-top:6px">
        🤝 羁绊：${Object.entries(bonds).map(([k,v]) => `${k}(${v.value})`).join(' · ')}
      </div>
    `;
  },

  updateWechatBadge() {
    const badge = $('#wechat-badge');
    badge.style.display = this.state.wechatUnread.length > 0 ? 'inline' : 'none';
  },

  // ========== 视图切换 ==========
  switchView(name) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $(`#view-${name}`).classList.add('active');
    if (name === 'wechat') {
      this.renderWechatView();
      if (this.state.wechatUnread.length > 0) {
        this.state.wechatArchive.push(...this.state.wechatUnread);
        this.state.wechatUnread = [];
        LS.set('wechat_unread', []);
        LS.set('wechat_archive', this.state.wechatArchive);
        this.updateWechatBadge();
      }
      // 自动滚到底部
      setTimeout(() => {
        const allMsgs = document.querySelectorAll('#wechat-messages .wechat-msg');
        const lastMsg = allMsgs[allMsgs.length - 1];
        if (lastMsg) lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    }
    if (name === 'diary') this.renderDiaryView();
    if (name === 'exercise') this.renderHomeworkView();
    if (name === 'history') this.renderHistoryView();
    if (name === 'pet') { this.renderPetView(); this.updatePetBadge(); }
    if (name === 'battle') this.renderBattleView();
  },

  // ========== 主题 ==========
  loadSettings() {
    const s = LS.get('settings', { theme: 'light' });
    this.state.settings = s;
  },
  toggleTheme() {
    this.state.settings.theme = this.state.settings.theme === 'dark' ? 'light' : 'dark';
    LS.set('settings', this.state.settings);
    this.applyTheme();
  },
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.settings.theme);
    $('#theme-toggle').textContent = this.state.settings.theme === 'dark' ? '☀️' : '🌙';
  },
  toggleSidebar() {
    $('#sidebar').classList.toggle('collapsed');
  },

  // ========== 多节上课字符限制（修改这里调整上限） ==========
  // 获取当前主章节（多选时返回第一个，单选时返回 selectedSection）


  // 获取某门课的当前教学位置（从 coursePosition 读取，无记录则返回第一节）
  _getCoursePosition(courseName) {
    const pos = this.state.coursePosition[courseName || this.state.selectedCourse];
    if (pos) return pos;
    // 首次：取该课程第一节
    const course = this.state.textbookCourses.find(c => c.courseName === (courseName || this.state.selectedCourse));
    if (!course || !course.chapters.length || !course.chapters[0].sections.length) return null;
    const firstSec = course.chapters[0].sections[0];
    const initPos = {
      filename: firstSec.filename,
      chapterNum: firstSec.chapterNum,
      num: firstSec.num,
      title: firstSec.title
    };
    this.state.coursePosition[courseName || this.state.selectedCourse] = initPos;
    LS.set('course_position', this.state.coursePosition);
    return initPos;
  },

  // 获取课程平铺节列表
  _getFlatSectionsForCourse(courseName) {
    const course = this.state.textbookCourses.find(c => c.courseName === (courseName || this.state.selectedCourse));
    if (!course) return [];
    const flat = [];
    course.chapters.forEach(ch => {
      ch.sections.forEach(s => flat.push({
        filename: s.filename,
        chapterNum: ch.chapterNum,
        num: s.num,
        title: s.title
      }));
    });
    return flat;
  },

  // 拼合节包：当前节<1000字且下一节≤5000字时触发，累加直到≥5000字或课程结束
  // 规则：如果下一节本身>5000字则不合并（避免小引子+大章正文拼在一起）
  // 返回 { sections: [...], totalChars: number, filename: string, bundled: bool }
  async _buildSectionBundle(courseName, startSection, minChars = 5000) {
    const flat = this._getFlatSectionsForCourse(courseName);
    const startIdx = flat.findIndex(s => s.filename === startSection.filename);
    if (startIdx === -1) return { sections: [startSection], totalChars: 0, filename: startSection.filename, bundled: false };
    // 先取第一节内容
    const firstContent = await this.fetchSection(flat[startIdx].filename).catch(() => '');
    const firstLen = firstContent.length;
    // 第一节≥3000字：不触发拼合
    if (firstLen >= 3000) {
      return { sections: [{ ...flat[startIdx], charCount: firstLen }], totalChars: firstLen, filename: startSection.filename, bundled: false };
    }
    // 检查下一节：如果下一节>5000字，不合并
    if (startIdx + 1 < flat.length) {
      const nextContent = await this.fetchSection(flat[startIdx + 1].filename).catch(() => '');
      if (nextContent.length > 5000) {
        return { sections: [{ ...flat[startIdx], charCount: firstLen }], totalChars: firstLen, filename: startSection.filename, bundled: false };
      }
    }
    // 触发拼合：从起始节开始累加，最多3节
    const bundle = [];
    let total = 0;
    const maxSections = 3;
    for (let i = startIdx; i < flat.length && bundle.length < maxSections; i++) {
      const content = (i === startIdx) ? firstContent : (await this.fetchSection(flat[i].filename).catch(() => ''));
      bundle.push({ ...flat[i], charCount: content.length });
      total += content.length;
      if (total >= minChars) break;
    }
    return { sections: bundle, totalChars: total, filename: startSection.filename, bundled: bundle.length > 1 };
  },

  // 推进到下一节（支持节包：跳过 bundle 中已教的节）
  _advanceToNextSection(courseName) {
    const flat = this._getFlatSectionsForCourse(courseName);
    const pos = this._getCoursePosition(courseName);
    if (!pos || !flat.length) return null;
    const idx = flat.findIndex(s => s.filename === pos.filename);
    if (idx === -1 || idx >= flat.length - 1) return null; // 已是最后一节
    const next = flat[idx + 1];
    const newPos = {
      filename: next.filename,
      chapterNum: next.chapterNum,
      num: next.num,
      title: next.title
    };
    this.state.coursePosition[courseName || this.state.selectedCourse] = newPos;
    LS.set('course_position', this.state.coursePosition);
    return newPos;
  },

  // 自动检测并生成教案（仅无缓存时触发，阻塞等待）
  async _ensureLessonPlan(pos) {
    const courseName = this.state.selectedCourse;
    if (!courseName || !pos) return;
    // 1. 先判断是否需要拼合（再决定是否复用旧缓存）
    const bundle = await this._buildSectionBundle(courseName, pos, 5000);
    const isBundle = bundle.bundled && bundle.sections.length > 1;
    // 2. 检查是否已有教案缓存——拼合模式下跳过旧缓存（旧教案可能只覆盖单节）
    if (!isBundle) {
      const existingPlan = await this._loadSectionPlan(courseName, pos.chapterNum, pos.num, pos.title);
      if (existingPlan) {
        this.addSystemMessage('📋 已加载本节教案缓存（' + pos.num + ' ' + pos.title + '）');
        return;
      }
    }
    // 3. 开始生成
    if (isBundle) {
      this.addSystemMessage('⏳ 准备教案中（节包 ' + bundle.sections.length + ' 节 ' + bundle.totalChars + ' 字）…');
    } else {
      this.addSystemMessage('⏳ 准备教案中（' + pos.num + ' ' + pos.title + '）…');
    }
    this._showLoading('老师正在准备教案…');
    const toastEl = this._toast('首次教学此节，老师正在准备教案…', 'loading', 0);
    try {
      // 3. 准备生成内容
      const bundleContents = await Promise.all(bundle.sections.map(s =>
        this.fetchSection(s.filename).catch(() => '(加载失败)')
      ));
      const combinedContent = bundle.sections.map((s, i) =>
        '=== 第' + s.chapterNum + '章 ' + s.num + ' ' + s.title + ' ===\n' + bundleContents[i]
      ).join('\n\n');

      // 4. 加载章概括（如果有）
      let chapterSummary = '';
      try {
        const chapterPlan = await this._loadChapterPlan(courseName, pos.chapterNum);
        if (chapterPlan) {
          const secInfo = (chapterPlan.sections || []).filter(s =>
            bundle.sections.some(bs => bs.num === s.num)
          );
          chapterSummary = '## 本章主题\n' + (chapterPlan.chapterTheme || '') +
            '\n\n## 教学目标\n' + (chapterPlan.chapterGoal || '') +
            '\n\n## 节间逻辑\n' + (chapterPlan.sectionFlow || '') +
            '\n\n## 本节角色\n' + secInfo.map(s => s.role + ' — ' + s.coreIdea).join('\n') +
            '\n\n## 难度\n' + secInfo.map(s => s.difficulty).join('');
        }
      } catch(e) { /* 忽略 */ }
      if (!chapterSummary) chapterSummary = '（暂无章概括，请直接从教材中提取全部知识点和逻辑脉络）';

      // 5. 加载教案提示词
      const sectionPromptMd = await this._fetchSystemPrompt('lesson_plan_section.md');
      if (!sectionPromptMd) throw new Error('分节教案提示词文件缺失');

      const labelInfo = isBundle
        ? '本节包包含 ' + bundle.sections.length + ' 个相邻小节：' + bundle.sections.map(s => s.num + ' ' + s.title).join('、')
        : '本节：' + pos.num + ' ' + pos.title;
      const userMsg = '=== ' + labelInfo + ' ===\n\n' +
        '=== 章概括 ===\n' + chapterSummary +
        '\n\n=== 教材全文 ===\n\n' + combinedContent +
        '\n\n请按指定 Markdown 格式输出本节教案。注意：这是' + (isBundle ? '一个节包（多节合并），教案需覆盖其中全部知识点。' : '一个单节，按常规格式输出。');

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: sectionPromptMd },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3,
          max_tokens: 8192
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API请求失败 (HTTP ' + resp.status + ')');
      }
      const data = await resp.json();
      const planMd = data.choices[0].message.content;

      // 6. 落盘 + 缓存
      const safeTitle = (pos.title || '').replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
      const planPath = '教案/' + courseName + '/第' + pos.chapterNum + '章_' + pos.num + '_' + safeTitle + '_教案.md';
      const savedToDisk = await this._savePlanFile(planPath, planMd);
      const cacheKey = 'plan_section_' + courseName + '_第' + pos.chapterNum + '章_' + pos.num;
      LS.set(cacheKey, planMd);
      console.log('📝 教案已准备：' + pos.num + (isBundle ? '（节包' + bundle.sections.length + '节）' : '') + ' → ' + planPath);
      if (toastEl) toastEl.remove();
      const diskMsg = savedToDisk ? ' 💾已落盘' : ' ⚠️仅LS缓存（server.py未启动？）';
      this._toast('✅ 教案已准备：' + pos.num + ' ' + pos.title + (isBundle ? ' +' + (bundle.sections.length-1) + '节' : '') + diskMsg, 'ok');
      this.addSystemMessage('✅ 教案准备成功（' + planMd.length + '字）' + diskMsg);
    } catch(e) {
      if (toastEl) toastEl.remove();
      this._toast('⚠️ 教案准备失败：' + e.message + '，将直接用教材教学', 'err');
      this.addSystemMessage('⚠️ 教案准备失败：' + e.message + '，将直接使用原始教材教学');
      console.warn('教案准备失败：', e.message);
    } finally {
      this._hideLoading();
    }
  },

  // 手动推进到下一节（学生输入 /next）
  async _manualAdvance() {
    if (!this.state.isClassActive) return;
    const pos = this._getCoursePosition();
    if (!pos) { this.addSystemMessage('⚠️ 无法获取当前位置'); return; }
    // 处理节包
    const bundleSections = this.state._currentBundleSections;
    if (bundleSections && bundleSections.length > 1) {
      bundleSections.forEach(s => this._markSectionDone(s));
      const lastInBundle = bundleSections[bundleSections.length - 1];
      this.state.coursePosition[this.state.selectedCourse] = {
        filename: lastInBundle.filename, chapterNum: lastInBundle.chapterNum,
        num: lastInBundle.num, title: lastInBundle.title
      };
      LS.set('course_position', this.state.coursePosition);
    } else {
      this._markSectionDone(pos);
    }
    this.state._currentBundleSections = null;
    const next = this._advanceToNextSection();
    if (!next) {
      this.addSystemMessage('🎉 恭喜！本课程全部章节已完成！');
      return;
    }
    this.addSystemMessage('⏭️ 已推进到下一节：第' + next.chapterNum + '章 ' + next.num + ' ' + next.title);
    // 为新节自动检测/生成教案
    await this._ensureLessonPlan(next);
    // 加载新节内容并告知AI
    const content = await this.fetchSection(next.filename).catch(() => '(加载失败)');
    const contextMsg = '【系统提示】已推进到下一节：第' + next.chapterNum + '章 ' + next.num + ' ' + next.title +
      '。以下是本节教材内容，请用苏格拉底教学法开始教学。记住：每次只提一个问题。\n\n=== 教材内容 ===\n' + content;
    this.state.chatHistory.push({ role: 'user', content: contextMsg });
    LS.set('chat_history', this.state.chatHistory);
    this.addSystemMessage('📖 已加载：第' + next.chapterNum + '章 ' + next.num + ' ' + next.title);
    await this.sendToAI(null);
  },

  // 标记某节为已学完
  _markSectionDone(section) {
    if (!section || !this.state.progress) return;
    const p = this.state.progress;
    const alreadyDone = p.lessonRecords.some(r =>
      r.chapterNum === section.chapterNum && r.sectionNum === section.num
    );
    if (!alreadyDone) {
      p.lessonRecords.push({
        date: formatDate(new Date()),
        teacher: this.getCurrentTeacher().namePure || this.getCurrentTeacher().name,
        courseName: this.state.selectedCourse,
        chapterNum: section.chapterNum,
        sectionNum: section.num,
        title: section.title,
        summary: '连续教学模式自动标记'
      });
      p.completedLessons = (p.completedLessons || 0) + 1;
      LS.set('progress', p);
    }
  },

  // 节完成回调：标记 → 推进 → 注入下一节
  async _onSectionComplete() {
    const pos = this._getCoursePosition();
    if (!pos) return;
    // 获取节包信息（如果有）
    const bundleSections = this.state._currentBundleSections;
    const isBundle = bundleSections && bundleSections.length > 1;
    console.group('✅ _onSectionComplete — 节完成');
    console.log('  位置:', '第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title);
    console.log('  节包:', isBundle ? bundleSections.length + '节 (' + bundleSections.map(s=>s.num).join('→') + ')' : '单节');
    // 标记所有包内节为完成
    if (isBundle) {
      bundleSections.forEach(s => this._markSectionDone(s));
      this.addSystemMessage('✅ 节包完成：' + bundleSections.map(s => s.num + ' ' + s.title).join(' + ') + '（共' + bundleSections.length + '节）');
    } else {
      this._markSectionDone(pos);
      this.addSystemMessage('✅ 第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title + ' 已学完');
    }
    // 知识树长枝
    const teacher = this.getCurrentTeacher();
    const rpgName = teacher.namePure || teacher.name;
    this.addTreeBranch(rpgName, pos.title);
    // 羁绊增长（少量，主要增长在下课时）
    const isGuardian = teacher.orderRole === '守护导师';
    const bondTarget = isGuardian ? rpgName : this.getGuardianForDisciple(rpgName);
    this.addBond(bondTarget, isGuardian ? 1 : 0);  // 节完成给守护导师 +1
    LS.set('rpg_trees', this.state.trees);
    LS.set('rpg_bonds', this.state.bonds);
    this.state._currentBundleSections = null;  // 清除节包追踪

    // 节包模式下：跳到包最后一节，再推进一次到下一节
    let next;
    if (isBundle) {
      const lastInBundle = bundleSections[bundleSections.length - 1];
      this.state.coursePosition[this.state.selectedCourse] = {
        filename: lastInBundle.filename, chapterNum: lastInBundle.chapterNum,
        num: lastInBundle.num, title: lastInBundle.title
      };
      LS.set('course_position', this.state.coursePosition);
    }
    next = this._advanceToNextSection();
    if (!next) {
      this.addSystemMessage('🎉 恭喜！本课程全部章节已完成！你可以结束本节课了。');
      console.log('  结果: 课程全部完成！');
      console.groupEnd();
      this.renderSidebar();
      return;
    }
    console.log('  推进到:', '第' + next.chapterNum + '章 ' + next.num + ' ' + next.title);
    console.groupEnd();
    this.renderSidebar();

    // 暂停询问是否继续
    setTimeout(() => {
      if (confirm('✅ 本节已完成！\n\n📖 下一节：第' + next.chapterNum + '章 ' + next.num + ' ' + next.title + '\n\n要继续上课吗？')) {
        this._continueToNextSection(next);
      } else {
        this.addSystemMessage('⏸️ 已暂停。点击"结束课程"可存档，下次继续。');
      }
    }, 400);
  },

  // 确认后继续下一节
  async _continueToNextSection(next) {
    // 为新节自动检测/生成教案
    await this._ensureLessonPlan(next);
    // 加载下一节并告知 AI
    const content = await this.fetchSection(next.filename).catch(() => '(教材内容加载失败)');
    const nextPreview = '【系统提示】上一节已学完。现在开始教学下一节：第' + next.chapterNum + '章 ' + next.num + ' ' + next.title +
      '。以下是本节教材内容，请用苏格拉底教学法继续教学。\n\n=== 教材内容 ===\n' + content;
    this.state.chatHistory.push({ role: 'user', content: nextPreview });
    LS.set('chat_history', this.state.chatHistory);
    this.addSystemMessage('📖 新章节已加载，继续教学...');
    await this.sendToAI(null);
  },

  // 课后自动生成错题习题（每卡住知识点1道选择题，累积保存）
  async _generateStuckExercises() {
    const stuckLog = this.state.stuckLog || [];
    // stuckLog 已在 startClass 清空，全部都是本节课的。按知识点去重。
    const seen = new Set();
    const newStucks = stuckLog.filter(s => {
      const key = s.knowledgePoint + '|' + s.sectionNum;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // 也收集学生手动标记的消息
    const flagged = this.state.flaggedMessages || [];
    const totalItems = newStucks.length + flagged.length;
    if (!totalItems) return;

    this.addSystemMessage('📝 检测到 ' + newStucks.length + ' 个卡住点 + ' + flagged.length + ' 条标记，正在生成针对性习题…');
    console.log('📝 _generateStuckExercises: ' + newStucks.length + ' stuck + ' + flagged.length + ' flagged');

    // 构建卡住摘要
    const stuckSummary = newStucks.map((s, i) =>
      (i+1) + '. 知识点：' + s.knowledgePoint +
      '\n   错误类型：' + s.errorType +
      '\n   章节：第' + s.chapterNum + '章 ' + s.sectionNum + ' ' + s.sectionTitle +
      '\n   学生回答：' + s.context
    ).join('\n\n');
    // 构建标记摘要
    const flaggedSummary = flagged.map((f, i) =>
      (i+1) + '. 学生标记的讲解片段：' + f.snippet +
      '\n   完整内容：' + f.content.substring(0, 500)
    ).join('\n\n');

    // 加载当前教材内容（供 AI 参考出题）
    let textbookRef = '';
    try {
      const pos = this._getCoursePosition();
      if (pos) {
        textbookRef = await this.fetchSection(pos.filename);
        if (textbookRef.length > 3000) textbookRef = textbookRef.substring(0, 3000);
      }
    } catch(e) { /* 忽略 */ }

    const prompt = `你是课程"${this.state.selectedCourse || ''}"的习题设计专家。以下学生在学习过程中暴露了若干薄弱点以及手动标记的难点，请为每个条目设计1道选择题。

=== 卡住记录 ===
${stuckSummary || '（无）'}

=== 学生手动标记的难点 ===
${flaggedSummary || '（无）'}

=== 教材参考 ===
${textbookRef || '（无）'}

=== 要求 ===
1. 每个条目生成1道选择题（共${totalItems}道：${newStucks.length}个卡住点 + ${flagged.length}条标记）
2. 每道题4个选项（A/B/C/D），1个正确答案 + 3个干扰项
3. 干扰项必须基于"错误类型"中描述的学生真实错误思路来设计——让选了错误选项的学生看到解析后能意识到"这就是我当时犯的错"
4. 题目难度适中，不要太简单也不要太刁钻
5. 用 JSON 格式回复（只输出 JSON，不要其他内容）

输出格式：
{
  "exercises": [
    {
      "knowledgePoint": "知识点名称",
      "question": "题目正文",
      "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
      "correctAnswer": "A",
      "explanation": "正确答案解析（1-2句话）",
      "trapNotes": {"A": "为什么正确", "B": "对应哪种错误思路", "C": "对应哪种错误思路", "D": "对应哪种错误思路"}
    }
  ]
}`;

    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: '你是一个严谨的习题设计专家。请严格按照 JSON 格式输出。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 4096,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API请求失败 (HTTP ' + resp.status + ')');
      }
      const data = await resp.json();
      const resultText = data.choices[0].message.content;
      console.log('📝 错题API返回长度:', resultText.length, '前200字:', resultText.substring(0, 200));
      const m = resultText.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('API返回中未找到JSON对象');
      const parsed = JSON.parse(m[0]);
      const exercises = (parsed.exercises || []).map(ex => ({
        ...ex,
        date: formatDate(new Date()),
        courseName: this.state.selectedCourse,
        sourceSection: newStucks[0] ? newStucks[0].sectionNum : ''
      }));

      if (!exercises.length) throw new Error('API返回的exercises为空');

      // 累积保存
      this.state.stuckExercises = [...(this.state.stuckExercises || []), ...exercises];
      LS.set('stuck_exercises', this.state.stuckExercises);

      console.log('✅ 错题习题已生成：' + exercises.length + ' 道 → 累积共 ' + this.state.stuckExercises.length + ' 道');
      this.addSystemMessage('✅ 已生成 ' + exercises.length + ' 道错题习题（累积共 ' + this.state.stuckExercises.length + ' 道），可在战斗系统中练习');
    } catch(e) {
      console.error('❌ 错题习题生成失败：', e.message, e.stack);
      this.addSystemMessage('⚠️ 错题习题生成失败：' + e.message);
    }
  },

  // 解析 AI 回复中的协议标记
  _handleAIMarkers(reply) {
    let cleanReply = reply;
    let isComplete = false;
    const requestedSections = [];
    const stuckMarks = [];

    // 检测"本节已学完"标记
    const completeRe = /【本节已学完】/g;
    if (completeRe.test(cleanReply)) {
      isComplete = true;
      cleanReply = cleanReply.replace(completeRe, '').trim();
    }

    // 检测"需要阅读"标记
    const readRe = /【需要阅读[：:]\s*([\d.]+)】/g;
    let m;
    while ((m = readRe.exec(cleanReply)) !== null) {
      requestedSections.push(m[1].trim());
    }
    cleanReply = cleanReply.replace(readRe, '').trim();

    // 检测"卡住"标记：【卡住：知识点】错误类型：描述
    const stuckRe = /【卡住[：:](.+?)】错误类型[：:](.+?)(?:\n|$)/g;
    while ((m = stuckRe.exec(cleanReply)) !== null) {
      stuckMarks.push({
        knowledgePoint: m[1].trim(),
        errorType: m[2].trim()
      });
    }
    cleanReply = cleanReply.replace(stuckRe, '').trim();

    return { cleanReply, isComplete, requestedSections, stuckMarks };
  },
  _getPrimarySection() {
    // 优先使用动态教学位置，回退到旧版选择
    const pos = this.state.coursePosition[this.state.selectedCourse];
    if (pos) return pos;
    if (this.state.selectedSections.length > 0) return this.state.selectedSections[0];
    return this.state.selectedSection;
  },
  getMaxSectionChars() { return 5000; },  // ← 改这个数字即可调整字数上限

  // ========== 教学对话核心 ==========
  async startClass() {
    // 动态教学模式：从 coursePosition 获取当前位置
    const pos = this._getCoursePosition();
    if (!pos || !this.state.selectedTeacherId) {
      alert(!pos ? '该课程无教材章节，请先扫描教材。' : '请先选择授课导师');
      return;
    }
    console.group('🚀 startClass — 开始上课');
    console.log('  课程:', this.state.selectedCourse);
    console.log('  教师:', this.getCurrentTeacher().name);
    console.log('  位置:', '第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title);
    console.log('  文件:', pos.filename);
    const flatDbg = this._getFlatSectionsForCourse();
    const idxDbg = flatDbg.findIndex(s => s.filename === pos.filename);
    console.log('  进度:', (idxDbg+1) + '/' + flatDbg.length);
    console.log('  游戏时间:', '第' + this.state.gameDay + '天 ' + this.state.gameTime);
    console.groupEnd();
    try {
    this.state.isClassActive = true;
    this.state.chatHistory = [];
    this.state.classTokenUsage = { promptCacheHit: 0, promptCacheMiss: 0, completionTokens: 0 };
    this.state.activeItem = null;
    this.state.stuckLog = [];  // 新课清空卡住记录
    this.state.flaggedMessages = [];  // 新课清空标记
    this.state._lastAIQuestionTime = null;
    LS.set('chat_history', []);
    $('#chat-messages').innerHTML = '';
    $('#chat-messages').style.display = 'flex';
    $('#chat-empty').style.display = 'none';
    $('#chat-input-area').style.display = 'flex';
    $('#btn-end-class').disabled = false;
    $('#chat-input').focus();
    this._updateStuckBtn();

    this.advanceGameTime();
    const label = `第${pos.chapterNum}章 ${pos.num} ${pos.title}`;
    this.addSystemMessage(`📖 课程开始 — ${this.getCurrentTeacher().name} 授课 · ${label} · ${this.state.gameTime}的${this.state.currentLocation}`);
    // 教材文件链接
    const readerUrl = '教材阅读器.html?file=' + encodeURIComponent(pos.filename);
    const msgEl = document.createElement('div');
    msgEl.className = 'message system';
    msgEl.innerHTML = `<div class="message-bubble">📂 教材文件：<a href="${readerUrl}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">在阅读器中打开 ${this.escapeHtml(pos.filename)}</a></div>`;
    $('#chat-messages').appendChild(msgEl);
    this.addSystemMessage(`🌳 课前状态 — ${this.getTreeStatusText()}`);
    // 显示课程进度
    const flat = this._getFlatSectionsForCourse();
    const curIdx = flat.findIndex(s => s.filename === pos.filename);
    this.addSystemMessage(`📍 课程进度：第 ${curIdx + 1} / ${flat.length} 节（${Math.round((curIdx + 1) / flat.length * 100)}%）`);

    // 自动检测并生成教案（仅无缓存时触发，阻塞等待）
    await this._ensureLessonPlan(pos);

    const initMsg = '开始上课。当前教学章节：第' + pos.chapterNum + '章 ' + pos.num + ' ' + pos.title +
      '。请根据教材内容，用苏格拉底教学法提出第一个引导性问题。记住：每次只提一个问题，等待我回答。';
    await this.sendToAI(initMsg);
    this._saveClassSnapshot();  // 保存课堂快照，刷新可恢复
    } catch (e) {
      console.error('startClass 失败:', e);
      this.state.isClassActive = false;
      this.addSystemMessage('❌ 开课失败：' + e.message);
      $('#btn-end-class').disabled = true;
      $('#btn-start-class').disabled = false;
    }
  },

  getTreeStatusText() {
    const trees = this.state.trees;
    return Object.values(trees).map(t => `${t.icon}${t.name}: ${t.branchesCount}枝(${t.phase})`).join(' · ');
  },

  getCurrentTeacher() {
    const t = this.state.teachers.find(t => t.id === this.state.selectedTeacherId);
    if (t) return t;
    return { name: '导师', namePure: '导师', avatarColor: '#8B6914', fullMd: '', orderRole: '使徒' };
  },

  async sendToAI(initUserMsg) {
    this.showTyping(true);
    try {
      const systemPrompt = await this.buildSystemPrompt();
      const apiMessages = [{ role: 'system', content: systemPrompt }];
      for (const msg of this.state.chatHistory) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
      if (initUserMsg) {
        apiMessages.push({ role: 'user', content: initUserMsg });
      }
      // 每25轮提醒AI检查是否该标记本节完成
      const assistantMsgs = this.state.chatHistory.filter(m => m.role === 'assistant').length;
      if (assistantMsgs > 0 && assistantMsgs % 25 === 0) {
        apiMessages.push({ role: 'user', content: '【系统提醒】已进行 ' + assistantMsgs + ' 轮对话。请自查：你是否已经覆盖了本节教材的所有核心概念？如果已全部覆盖、学生已掌握，请在回复末尾标记【本节已学完】。如果还有未覆盖的重要知识点，请继续教学。' });
      }

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: apiMessages,
          temperature: 0.8,
          max_tokens: 2048
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || 'API 请求失败 (HTTP ' + resp.status + ')');
      }

      const data = await resp.json();
      const reply = data.choices[0].message.content;
      // === 协议标记检测 ===
      const { cleanReply, isComplete, requestedSections, stuckMarks } = this._handleAIMarkers(reply);
      if (isComplete || requestedSections.length > 0 || stuckMarks.length > 0) {
        console.log('🔖 AI标记检测:', [
          isComplete ? '【本节已学完】' : '',
          requestedSections.length > 0 ? '【需要阅读:' + requestedSections.join(',') + '】' : '',
          stuckMarks.length > 0 ? '🔴【卡住:' + stuckMarks.map(s => s.knowledgePoint).join(',') + '】' : ''
        ].filter(Boolean).join(' '));
        console.log('  回复长度:', reply.length, '→ 清理后:', cleanReply.length);
      }
      // 处理"卡住"标记 → 存入 stuckLog
      if (stuckMarks.length > 0) {
        const pos = this._getCoursePosition();
        stuckMarks.forEach(sm => {
          const lastUserMsg = [...this.state.chatHistory].reverse().find(m => m.role === 'user');
          this.state.stuckLog.push({
            knowledgePoint: sm.knowledgePoint,
            errorType: sm.errorType,
            sectionNum: pos ? pos.num : '',
            chapterNum: pos ? pos.chapterNum : 0,
            sectionTitle: pos ? pos.title : '',
            courseName: this.state.selectedCourse,
            timestamp: '第' + this.state.gameDay + '天 ' + this.state.gameTime,
            context: lastUserMsg ? lastUserMsg.content.substring(0, 200) : ''
          });
          console.log('🔴 卡住记录:', sm.knowledgePoint, '|', sm.errorType);
        });
        LS.set('stuck_log', this.state.stuckLog);
      }
      // 处理"需要阅读"——异步加载并注入上下文
      if (requestedSections.length > 0) {
        for (const secNum of requestedSections) {
          const flatR = this._getFlatSectionsForCourse();
          const target = flatR.find(s => s.num === secNum);
          if (target) {
            try {
              const extraContent = await this.fetchSection(target.filename);
              this.addSystemMessage('📎 AI请求查阅：第' + target.chapterNum + '章 ' + target.num + ' ' + target.title);
              this.state.chatHistory.push({
                role: 'user',
                content: '【系统注入·供参考】第' + target.chapterNum + '章 ' + target.num + ' ' + target.title + '：\n' + extraContent.substring(0, 3000)
              });
            } catch(e) { /* 忽略加载失败 */ }
          }
        }
      }
      // 显示清理后的回复
      this.addMessage('assistant', cleanReply);
      this.state.chatHistory.push({ role: 'assistant', content: cleanReply });
      LS.set('chat_history', this.state.chatHistory);
      this.state._lastAIQuestionTime = Date.now();  // 记录提问时间戳
      // 节完成 → 自动推进（延迟500ms让用户先看到消息）
      if (isComplete) {
        setTimeout(() => this._onSectionComplete(), 500);
      }

      if (data.usage) {
        this.state.classTokenUsage.promptCacheHit += data.usage.prompt_cache_hit_tokens || 0;
        this.state.classTokenUsage.promptCacheMiss += data.usage.prompt_cache_miss_tokens || 0;
        this.state.classTokenUsage.completionTokens += data.usage.completion_tokens || 0;
      }
    } catch (e) {
      this.addSystemMessage('❌ 错误：' + e.message);
    }
    this._saveClassSnapshot();  // 每次 AI 回复后保存快照
    this.showTyping(false);
  },

  // 动态生成学习者档案（基于真实数据）
  _buildLearnerProfile(knowledgeText) {
    return `# 学习者档案

## 基本信息
- **称呼**：旅者
- **身份**：来到伊庇斯特梅小镇的求知者

## 性格特点
- 认真专注，会追问到底
- 好奇心旺盛：不满足于"怎么做"，总要追问"为什么"
- 不怕展露无知：遇到不懂的地方会直接问
- 坚韧：被难题卡住时不会轻易放弃

## 当前知识储备
${knowledgeText}

## 学习目标
学好所选课程，成为真正的视界探索者`;
  },

  async buildSystemPrompt() {
    const teacher = this.getCurrentTeacher();
    // 动态教学模式：从 coursePosition 获取当前节（<1000字且下一节≤5000字时自动拼合）
    const pos = this._getCoursePosition();
    let sectionContent = '';
    let sections = pos ? [pos] : [];
    this.state._currentBundleSections = null;  // 重置节包追踪
    if (pos) {
      try {
        const bundle = await this._buildSectionBundle(this.state.selectedCourse, pos, 5000);
        sections = bundle.sections;
        if (bundle.bundled) {
          // 多节拼合
          const bundleContents = await Promise.all(bundle.sections.map(s =>
            this.fetchSection(s.filename).catch(() => '(加载失败)')
          ));
          sectionContent = bundle.sections.map((s, i) =>
            '=== 第' + s.chapterNum + '章 ' + s.num + ' ' + s.title + ' ===\n' + bundleContents[i]
          ).join('\n\n');
          console.log('📦 节包拼合：' + bundle.sections.length + ' 节 ' + bundle.totalChars + ' 字');
          this.state._currentBundleSections = bundle.sections;  // 记住包范围，完成时跳过全部
        } else {
          sectionContent = await this.fetchSection(pos.filename);
        }
      } catch(e) { sectionContent = '(教材内容加载失败)'; }
    }

        // 动态生成课程进度摘要（从 lessonRecords + courseMastery）
    const pForSummary = this.state.progress;
    let progressSummary = '暂无学习记录';
    let learnerKnowledgeText = '暂无学习记录';
    if (pForSummary) {
      const courseStats = {}; // { courseName: { lessons: Set, concepts: Set } }
      (pForSummary.lessonRecords || []).forEach(r => {
        const cn = r.courseName || '未分类';
        if (!courseStats[cn]) courseStats[cn] = { lessons: 0, concepts: new Set() };
        courseStats[cn].lessons++;
        (r.masteredConcepts || []).forEach(c => courseStats[cn].concepts.add(c));
      });
      // 合并 courseMastery
      if (pForSummary.courseMastery) {
        Object.entries(pForSummary.courseMastery).forEach(([cn, concepts]) => {
          if (!courseStats[cn]) courseStats[cn] = { lessons: 0, concepts: new Set() };
          (concepts || []).forEach(c => courseStats[cn].concepts.add(c));
        });
      }
      const entries = Object.entries(courseStats);
      if (entries.length > 0) {
        progressSummary = '已完成 ' + (pForSummary.completedLessons || 0) + ' 节课。' +
          entries.map(([cn, st]) => cn + '(' + st.lessons + '节 ' + st.concepts.size + '个概念)').join(' · ');
        learnerKnowledgeText = entries.map(([cn, st]) =>
          '**' + cn + '**：' + ([...st.concepts].slice(0, 12).join('、') || '基础概念')
        ).join('；');
      }
    }

    const treeStatus = Object.values(this.state.trees).map(t =>
      `${t.name}(${t.icon})：${t.branchesCount}枝，${t.phase}`
    ).join('；');

    const bondStatus = Object.entries(this.state.bonds).map(([k,v]) =>
      `${k}羁绊：${v.value}(${v.level})`
    ).join('；');

    const worldSetting = (await this.fetchWorldSetting())
      .replace('{{PROGRESS_SUMMARY}}', progressSummary)
      .replace('{{TREE_STATUS}}', treeStatus)
      .replace('{{BOND_STATUS}}', bondStatus);

    const currentCourse = this.state.textbookCourses.find(c => c.courseName === this.state.selectedCourse);
	const domainHint = (currentCourse && currentCourse.domainHint)
	  ? currentCourse.domainHint
	  : '这是一门课程。所有讨论、问题、例子必须围绕课程主题展开，不要偏离到无关领域。';

	// 构建导师记忆段落
	let fileMemories = await this._loadTeacherMemory(teacher.id);
    let memorySection = '';
    if (fileMemories.length > 0) {
      memorySection = '\n\n=== 导师记忆（你对这位学生的过往印象）===\n' +
        fileMemories.map(n => '[' + n.date + ' ' + n.lesson + '] ' + n.note).join('\n') +
        '\n\n请参考以上记忆调整本次教学策略：对薄弱环节重点引导，对已掌握部分可以适当加快进度。若学生主动提起之前的内容，自然回应。';
    } else {
      memorySection = '\n\n=== 导师记忆 ===\n你还没有教过这位学生，这是你们第一次见面。请在教学中逐步了解学生的水平。';
    }
// ===== 加载教案（第二层章概括 + 第三层分节教案）=====
    let chapterPlanText = '';
    let sectionPlanMd = null;
    let hasLessonPlan = false;
    try {
      const planSection = pos;
      if (planSection) {
        const planCourse = this.state.selectedCourse || '';
        const chNum = planSection.chapterNum;
        // 加载第三层教案
        sectionPlanMd = await this._loadSectionPlan(planCourse, chNum, planSection.num, planSection.title);
        if (sectionPlanMd) hasLessonPlan = true;
        // 加载第二层章概括
        const chapterPlan = await this._loadChapterPlan(planCourse, chNum);
        if (chapterPlan) {
          const planSecNum = (pos || this.state.selectedSection || {}).num || '';
          const secInfo = (chapterPlan.sections || []).filter(s => s.num === planSecNum);
          chapterPlanText = '【本章主题】' + (chapterPlan.chapterTheme || '') + '\n' +
            '【教学目标】' + (chapterPlan.chapterGoal || '') + '\n' +
            '【节间逻辑】' + (chapterPlan.sectionFlow || '') + '\n' +
            '【本节角色】' + secInfo.map(s => s.role + ' — ' + s.coreIdea).join('；') + '\n' +
            '【难度】' + secInfo.map(s => s.difficulty).join('');
          // 加载本节知识地图
          const kmSecPoints = (chapterPlan.knowledgeMap || []).filter(k => k.section === planSecNum).flatMap(k => k.points);
          if (kmSecPoints.length > 0) {
            chapterPlanText += '\n\n【本节知识地图（逐一覆盖，不得跳过）】\n' + kmSecPoints.map(p => p.status + ' ' + p.name + ' (' + (p.type || '') + ')').join('\n');
          }
        }
      }
    } catch (e) {
      console.warn('教案加载失败，回退到原始教材：', e.message);
    }

// 此文件内容会被插入到 buildSystemPrompt() 的 return 位置
    // ===== 加载系统提示词文件（优先读文件，失败用内置兜底）=====
    const [instrFile, depthFile, socraticFile, answerFile] = await Promise.all([
      this._fetchSystemPrompt('teaching_instructions.md'),
      this._fetchSystemPrompt('teaching_depth_rules.md'),
      this._fetchSystemPrompt('socratic_rules.md'),
      this._fetchSystemPrompt('answer_handling.md')
    ]);

    // 替换变量占位符
    const courseMap = (() => {
      const f = this._getFlatSectionsForCourse();
      const i = f.findIndex(s2 => pos && s2.filename === pos.filename);
      if (i === -1) return '（无课程数据）';
      // 只显示前一节（已学）+ 当前节 + 后两节
      const start = Math.max(0, i - 1);
      const end = Math.min(f.length, i + 3);
      const nearby = f.slice(start, end);
      let map = '';
      if (start > 0) map += '  ...（前面还有 ' + start + ' 节已学）\n';
      map += nearby.map((s2, j) => {
        const realIdx = start + j;
        return (realIdx === i ? '📍【当前】' : realIdx < i ? '  ✅' : '  📖') + '第' + s2.chapterNum + '章 ' + s2.num + ' ' + s2.title;
      }).join('\n');
      if (end < f.length) map += '\n  ...（后面还有 ' + (f.length - end) + ' 节）';
      return map;
    })();
    const S = (t, d) => (t != null && t !== '') ? t : d;
    const secNum = pos ? pos.num : '?';
    const chNum = pos ? String(pos.chapterNum) : '?';
    const secTitle = pos ? pos.title : '?';

    // 重要指令：优先读文件，失败用简化兜底
    const instrMd = S(instrFile,
      '1. 你现在就是' + teacher.name + '，用ta的性格、语气、风格说话。\n' +
      '2. 【教学优先】按教材顺序逐一覆盖全部核心概念，苏格拉底提问法，每次聚焦一个知识点。\n' +
      '3. 每次只提一个具体问题。\n4. 不直接给答案。\n5. 不猜术语名称。\n6. 不模糊引用。\n' +
      '7. 数学公式用 $...$ 格式。\n8. 三次卡住给简短讲解后追问。\n' +
      '9. 学生总结出概念时肯定后推进。\n10. 角色扮演1句内。\n' +
      '11.【领域边界】' + domainHint + '\n' +
      '12.【深度约束】执行下方规则。\n' +
      '13.【连续教学】第' + chNum + '章 ' + secNum + '节《' + secTitle + '》，学完后标记【本节已学完】。\n' +
      '14.【查阅章节】需要时标记【需要阅读：X.X】。\n' +
      '15.【课程地图】\n' + courseMap
    ).replace(/\{\{TEACHER_NAME\}\}/g, teacher.name)
     .replace(/\{\{DOMAIN_HINT\}\}/g, domainHint)
     .replace(/\{\{CHAPTER_NUM\}\}/g, chNum)
     .replace(/\{\{SECTION_NUM\}\}/g, secNum)
     .replace(/\{\{SECTION_TITLE\}\}/g, secTitle)
     .replace(/\{\{COURSE_MAP\}\}/g, courseMap);

    // 教学深度约束
    const depthMd = S(depthFile,
      '## 一、教材全覆盖\n逐一覆盖全部核心概念，每段经提问→回答→追问→确认循环。\n\n' +
      '## 二、四层提问：①概念确认 ②逻辑推导 ③演化推论 ④反向辨析（至少前两层）\n\n' +
      '## 三、每3轮框架梳理\n\n## 四、比喻后回归原文\n\n' +
      '## 五、卡住标记：连续两次答错/跑偏/不懂时，回复末尾加【卡住：知识点】错误类型：描述'
    );

    const socraticMd = S(socraticFile, SEED_DATA.systemMd);
    const answerMd = S(answerFile, SEED_DATA.systemDetailMd);

    return instrMd +
      (this.state.activeItem && ITEM_EFFECTS[this.state.activeItem] ? '\n=== 已激活道具效果 ===\n' + ITEM_EFFECTS[this.state.activeItem].effect : '') +
      '\n\n' +
      (chapterPlanText ? '=== 本章教学背景 ===\n' + chapterPlanText + '\n\n' : '') +
      '=== ' + (hasLessonPlan ? '本节教案（AI预解析·按路线图教学）' : '当前章节教材内容') + ' ===\n' +
      (hasLessonPlan ? (sectionPlanMd || '') : (sectionContent || '（未加载教材）')) +
      '\n\n' + depthMd + '\n\n' +
      '=== 苏格拉底教学法核心规则 ===\n' + socraticMd + '\n\n' +
      '=== 系统操作细节 ===\n' + answerMd + '\n\n' +
      '=== 当前导师人设 ===\n' +
      // 优先用完整人设（裁掉旧教学记忆段），兜底用摘要
      ((teacher.fullMd ? teacher.fullMd.replace(/## 教学记忆[\s\S]*$/, '').trim().substring(0, 4000) : '') || teacher.personaBrief || '通用导师') +
      (teacher.exampleDialogue ? '\n\n=== 角色对话示例 ===\n<example_dialogue>\n' + teacher.exampleDialogue + '\n</example_dialogue>' : '') +
      memorySection + '\n\n' +
      '=== 学习者档案 ===\n' +
      this._buildLearnerProfile(learnerKnowledgeText) + '\n\n' +
      worldSetting;

  },

  async sendMessage() {
    if (!this.state.isClassActive) return;
    const input = $('#chat-input');
    const text = input.value.trim();
    if (!text) return;

    // === 回退指令 ===
    if (text === '/back' || text === '/回退') {
      const flat = this._getFlatSectionsForCourse();
      const pos = this._getCoursePosition();
      const idx = flat.findIndex(s => s.filename === pos.filename);
      if (idx <= 0) { this.addSystemMessage('⚠️ 已是第一节，无法回退'); }
      else {
        const prev = flat[idx - 1];
        this.state.coursePosition[this.state.selectedCourse] = {
          filename: prev.filename, chapterNum: prev.chapterNum, num: prev.num, title: prev.title
        };
        LS.set('course_position', this.state.coursePosition);
        this.addSystemMessage('⏮️ 已回退到：第' + prev.chapterNum + '章 ' + prev.num + ' ' + prev.title);
        this.renderSidebar();
      }
      input.value = ''; input.style.height = 'auto';
      return;
    }
    // === 手动推进指令 ===
    if (text === '/next' || text === '/跳过') {
      this.addSystemMessage('⏭️ 手动推进到下一节...');
      await this._manualAdvance();
      input.value = ''; input.style.height = 'auto';
      return;
    }
    if (text === '/done' || text === '/完成') {
      this.addSystemMessage('✅ 手动标记当前节完成...');
      await this._onSectionComplete();
      input.value = ''; input.style.height = 'auto';
      return;
    }
    // === 拦截道具使用指令 ===
    const useMatch = text.match(/^\/(?:使用|use)\s+(.+)/i);
    if (useMatch) {
      const itemKey = findItemKey(useMatch[1]);
      if (!itemKey) {
        this.addSystemMessage('❌ 未识别的道具。可用道具：橡子、露水、花瓣、金橡子、海洋之泪、金花瓣');
        input.value = '';
        input.style.height = 'auto';
        return;
      }
      const effect = ITEM_EFFECTS[itemKey];
      if (!effect) {
        this.addSystemMessage('❌ 未识别的道具。');
        input.value = '';
        input.style.height = 'auto';
        return;
      }
      // 查找对应的树产物 key（acorn → trees.oak.items.acorn）
      const treeMap = { acorn: 'oak', goldenAcorn: 'oak', dew: 'willow', oceanTear: 'willow', petal: 'laurel', goldenFlower: 'laurel' };
      const treeKey = treeMap[itemKey];
      const tree = this.state.trees[treeKey];
      const count = tree.items[itemKey];
      if (!count || count <= 0) {
        this.addSystemMessage(`❌ 背包中没有 ${effect.name}。`);
        input.value = '';
        input.style.height = 'auto';
        return;
      }
      // 扣除道具
      tree.items[itemKey] -= 1;
      LS.set('rpg_trees', this.state.trees);
      // 设置本节课激活的道具
      this.state.activeItem = itemKey;
      this.addSystemMessage(`✅ 已使用 ${effect.name}，本课效果持续生效！`);
      this.renderSidebar();
      input.value = '';
      input.style.height = 'auto';
      return;
    }

    input.value = '';
    input.style.height = 'auto';
    this.addMessage('user', text);
    this.state.chatHistory.push({ role: 'user', content: text });
    LS.set('chat_history', this.state.chatHistory);
    // 响应时间追踪：超过120秒视为卡住
    if (this.state._lastAIQuestionTime) {
      const delta = Math.round((Date.now() - this.state._lastAIQuestionTime) / 1000);
      if (delta >= 120) {
        const pos = this._getCoursePosition();
        this.state.chatHistory.push({
          role: 'user',
          content: '⏱️ 系统提示：学生此次回复耗时 ' + delta + ' 秒（超过120秒阈值），可能在此知识点上存在困惑，请注意检测是否需要标记卡住。'
        });
        // 自动追加到 stuckLog（去重：同一节只记录一次超时，累计耗时）
        const kpName = (pos ? pos.num + ' ' + pos.title : '未知');
        const existing = this.state.stuckLog.find(s => s.knowledgePoint === kpName && s.errorType.startsWith('响应超时'));
        if (existing) {
          existing.context += ' | 再次超时' + delta + 's: ' + text.substring(0, 80);
        } else {
          this.state.stuckLog.push({
            knowledgePoint: kpName,
            errorType: '响应超时（多次长时间停顿，可能对该节内容存在困惑）',
            sectionNum: pos ? pos.num : '',
            chapterNum: pos ? pos.chapterNum : 0,
            sectionTitle: pos ? pos.title : '',
            courseName: this.state.selectedCourse,
            timestamp: '第' + this.state.gameDay + '天 ' + this.state.gameTime,
            context: '首次超时' + delta + 's: ' + text.substring(0, 200)
          });
        }
        LS.set('stuck_log', this.state.stuckLog);
        console.log('⏱️ 响应超时:', delta + '秒 → 已记录');
      }
      this.state._lastAIQuestionTime = null;
    }
    this._saveClassSnapshot();  // 用户消息后保存快照
    await this.sendToAI(null);
  },

  async sendStuck() {
    if (!this.state.isClassActive) return;
    const p = this.state.player;
    if (!p.stuckTokens || p.stuckTokens <= 0) {
      this.addSystemMessage('💡 灵感硬币不足！请到斗技场商店购买。');
      return;
    }
    p.stuckTokens--;
    this.saveBattleData();
    this.renderSidebar();
    // 不在聊天区显示，仅作为系统指令注入给 AI
    const text = '⏸️ 系统指令：学生点击了"我卡住了"按钮（消耗1枚灵感硬币，剩余' + p.stuckTokens + '枚），表示当前问题无法继续。请降低难度、给一个更简单的引导问题或简短提示，帮助学生突破卡点。不要直接给答案。';
    this.addSystemMessage('💡 消耗1枚灵感硬币（剩余' + p.stuckTokens + '枚），已向教师发送求助信号');
    this.state.chatHistory.push({ role: 'user', content: text });
    LS.set('chat_history', this.state.chatHistory);
    this._saveClassSnapshot();
    await this.sendToAI(null);
    this._updateStuckBtn();
  },

  _updateStuckBtn() {
    const btn = document.getElementById('btn-stuck');
    if (btn) {
      const n = this.state.player.stuckTokens || 0;
      btn.textContent = n > 0 ? '我卡住了 💡'+n : '💡0 金币购买';
      btn.title = n > 0 ? '消耗1枚💡灵感硬币求助（剩余'+n+'枚）' : '灵感硬币不足，请到斗技场商店购买';
    }
  },

  handleInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
    }
    if (event.key === 'Escape' && this.state.isClassActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      event.preventDefault();
    }
  },

  async endClass() {
    if (!this.state.isClassActive) return;
    if (!confirm('确定结束本节课吗？系统将自动生成课后总结。\n当前位置会被保存，下次上课自动继续。')) return;

    this.state.isClassActive = false;
    this._saveClassSnapshot();  // 清除课堂快照（课程正常结束）

    // ===== 保存当前课程位置 =====
    LS.set('course_position', this.state.coursePosition);

    // 对话不足3轮（<3条AI回复）→ 跳过所有课后处理，不消耗资源
    const assistantMsgs = this.state.chatHistory.filter(m => m.role === 'assistant').length;
    if (assistantMsgs < 3) {
      this.addSystemMessage('⏭️ 对话不足3轮，跳过课后总结与RPG结算');
      $('#btn-end-class').disabled = true;
      $('#chat-input-area').style.display = 'none';
      this.showTokenStats();
      $('#chat-messages').style.display = 'none';
      $('#chat-empty').style.display = 'flex';
      LS.set('chat_history', this.state.chatHistory);
      this.renderSidebar();
      this.updateWechatBadge();
      return;
    }

    this.addSystemMessage('课程结束 — 正在生成课后总结…');
    // ===== 先执行 RPG 系统更新（即使后续 API 失败也不丢数据） =====
    const section = this._getPrimarySection();
    const teacher = this.getCurrentTeacher();
    const rpgName = teacher.namePure || teacher.name;
    const rpgBranchResult = this.addTreeBranch(rpgName, section ? section.title : '未知');
    const isGuardian = teacher.orderRole === '守护导师';
    const bondAmount = isGuardian ? 5 : 3;
    const bondTarget = isGuardian ? rpgName : this.getGuardianForDisciple(rpgName);
    this.addBond(bondTarget, bondAmount);
    LS.set('rpg_trees', this.state.trees);
    LS.set('rpg_bonds', this.state.bonds);

    // 显示树生长和好感度消息
    if (rpgBranchResult) {
      const product = rpgBranchResult.product;
      const itemName = rpgBranchResult.isRare ? product.rare : product.normal;
      this.addSystemMessage(`🌿 ${rpgBranchResult.tree.name} 第${rpgBranchResult.tree.branchesCount}枝已长成：${section ? section.title : '未知'}`);
      this.addSystemMessage(`🪙 收获：${itemName} ×1`);
      this.addSystemMessage(`🤝 ${bondTarget}羁绊 +${bondAmount}（当前 ${this.state.bonds[bondTarget].value}，${this.state.bonds[bondTarget].level}）`);
    }

    try {
      await this.postClassUpdate();
      this.addSystemMessage('✅ 课后总结已生成！可查看探索日志和教团群聊。');
    } catch(e) {
      this.addSystemMessage('⚠️ 课后总结生成失败：' + e.message);
    }

    // 自动生成错题习题（如果有卡住记录）
    if (this.state.stuckLog.length > 0) {
      try {
        await this._generateStuckExercises();
      } catch(e) {
        console.warn('错题习题生成失败：', e.message);
      }
    }

    this.saveConversationArchive();

    $('#btn-end-class').disabled = true;
    $('#chat-input-area').style.display = 'none';
    this.showTokenStats();
    $('#chat-messages').style.display = 'none';
    $('#chat-empty').style.display = 'flex';
    LS.set('chat_history', this.state.chatHistory);
    this.renderSidebar();
    this.updateWechatBadge();
  },

  async postClassUpdate() {
    const teacher = this.getCurrentTeacher();
    const section = this._getPrimarySection();
    if (!section) return;

    const chatSummary = this.state.chatHistory
      .filter(m => m.role === 'assistant')
      .slice(-8)
      .map(m => m.content.substring(0, 300))
      .join('\n---\n');

    // 选取授课教师 + 随机 2-3 位其他教师作为群聊参与者
    const allTeachers = this.state.teachers;
    const otherTeachers = allTeachers.filter(t => t.name !== teacher.name);
    // 随机打乱取 2-3 位
    const shuffled = otherTeachers.sort(() => Math.random() - 0.5);
    const participants = [teacher, ...shuffled.slice(0, 2 + Math.floor(Math.random() * 2))];
    const participantNames = participants.map(t => t.name);
    // 构建参与者简要人设
    const personasBrief = participants.map(t => {
      const brief = (t.fullMd ? t.fullMd.replace(/## 教学记忆[\s\S]*$/, '').trim().substring(0, 2000) : '') || t.personaBrief || `【${t.name}】${t.style || '通用导师'}。${t.core || ''}`;
      return `### ${t.name}\n${brief}`;
    }).join('\n\n');

    // 加载本节对应的知识地图，供 AI 标记状态
    let knowledgeMapRef = '';
    try {
      const primaryS = this._getPrimarySection();
      if (primaryS) {
        const kmCourse = this.state.selectedCourse || '';
        const chapterPlan = await this._loadChapterPlan(kmCourse, primaryS.chapterNum);
        if (chapterPlan && chapterPlan.knowledgeMap) {
          const secMap = chapterPlan.knowledgeMap.filter(k => k.section === primaryS.num);
          if (secMap.length > 0) {
            knowledgeMapRef = '\n=== 本节知识地图（请逐项标记状态）===\n' +
              JSON.stringify(secMap.flatMap(k => k.points), null, 2) +
              '\n\n注意：上方知识地图中的每个知识点，你都必须在 knowledgePoints 输出中逐一标记实际教学状态（mastered/weak/not_covered）。知识点名称必须与知识地图中的 name 精确匹配。';
          }
        }
      }
    } catch (e) { /* 忽略 */ }

    const prompt = `你是一个群聊模拟器。请根据以下角色设定和课堂对话，完成四件事。

=== 角色设定 ===
${personasBrief}

=== 课堂对话摘要 ===
授课教师：${teacher.name}
章节：第${section.chapterNum}章 ${section.title}
对话摘要（最近 8 条）：
${chatSummary}

=== 任务 ===
请用 JSON 格式回复（只输出 JSON，不要其他内容）：
{
  "knowledgePoints": [
    {
      "name": "知识点名称（如：逆向克氏循环、化学渗透机制、ATP面额困境）",
      "status": "mastered",
      "evidence": "简短证据：学生在本课中对该知识点的实际表现——是独立推导出来了，还是反复卡住，还是没来得及覆盖"
    }
  ],
  "summary": "整体概述：本节课教了什么、学生整体表现如何",
  "weakPoints": ["薄弱知识点1", "薄弱知识点2"],
  "strengths": ["已掌握知识点1", "已掌握知识点2"],
  "extensionQuestions": [
    "拓展思考题1——基于本节内容进一步追问的深层问题",
    "拓展思考题2"
  ],
  "nextLessonHints": "对下节课的简短建议：哪些薄弱点需要优先补强、哪些已掌握内容可以快进或跳过",
  "teacherNote": "以${teacher.name}的第一人称写一段150字内的教学笔记：该生本节课表现、掌握情况、薄弱环节、下次课应关注什么。",
  "participantNotes": [
    {"teacherName": "${participantNames[0] || '导师'}", "note": "100字内：从群聊讨论中对该生的观察印象"}
  ],
  "diary": "以旅者的第一人称写一篇300-500字的课后探索日志。风格：生活化、情感细腻、真实。包含与${teacher.name}互动细节和内心感受。",
  "wechat": [
    {"sender": "${participantNames[0] || '导师'}", "content": "发言内容"},
    ...
  ]
}

${knowledgeMapRef}

=== 知识点标记规则===
0. knowledgePoints 是核心输出——你必须逐一遍历本节教材中涉及的每一个关键概念，为每个概念标注掌握状态。knowledgePoints 中的 name 必须与上方知识地图中的 name 精确匹配以支持自动回写。不要只列两三个笼统的大标题，要拆细。
1. status 取值：mastered（学生能独立推导/准确回答）、weak（学生反复卡住/回答模糊/需要多次提示）、not_covered（课堂时间不足未展开讨论）。
2. evidence 必须引用学生在对话中的具体表现，不能写空话。"表现好"是不合格的证据；"学生独立推导了克氏循环的正向产能逻辑，准确区分了正向与逆向的ATP角色"是合格的证据。
3. weakPoints 从 knowledgePoints 中 status="weak" 的条目提取。
4. strengths 从 knowledgePoints 中 status="mastered" 的条目提取。
5. extensionQuestions 应基于本节内容提出更深层的追问，用于学生课后思考。每个问题应有明确指向，不要空洞。
6. nextLessonHints 必须具体——指出下节课应优先补强的知识点和可以快进的内容，用于驱动教师记忆系统。

=== 群聊对话规则 ===
7. 参与角色：仅限 ${participantNames.join('、')}，其他人不出场。
8. 轮流发言，每人每次不超过 3 句话。后一个人必须对前一个人的话做出反应再引出新内容，不能自说自话。
9. 必须有至少两个角色产生观点分歧，来回至少两轮辩论，随后由第三人升华或打圆场。
10. 允许严肃讨论被吐槽打断，允许活泼角色突然说出深刻的话。
11. 对话结尾必须留下一个未解决的问题或"下次再聊"的钩子。
12. 风格：自然口语化。可以互相叫名字或绰号。内容围绕本节课的教学——学生表现、教学难点、意外收获等。
13. 生成 5-7 条消息，保证每个参与者至少发言一次。

=== 教学笔记规则 ===
14. teacherNote 由${teacher.name}以第一人称写，记录本节课对学生的主要印象和下次教学建议（150字内）。
15. participantNotes 是参与群聊的每位其他导师在群聊中讨论的内容摘要（每人80字内）。⚠️ 注意：这些导师并未旁听课程，只能基于群聊中的讨论内容发表看法。禁止编造课堂观察（如"学生微笑了""他犹豫了一下"），只能写"从群聊讨论来看，..."或"根据刚才的讨论，..."这类表述。teacherName 必须与角色设定中的名字一致。

注意：
- diary 以"我"的视角写，用中文
- summary 要具体，指出掌握好的具体知识点和薄弱点
- knowledgePoints 必须覆盖教材全部核心概念，不得遗漏
- teacherNote 要具体、可用于后续教学参考
- participantNotes 只能基于群聊讨论内容，不得虚构课堂观察
- 严格输出 JSON`;

    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.apiKey
      },
      body: JSON.stringify({
        model: MODEL_CONFIG.name,
        messages: [
          { role: 'system', content: '你是一个教学数据生成助手。请严格按格式要求输出 JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });

    if (!resp.ok) throw new Error('API 请求失败');
    const data = await resp.json();
    const reply = data.choices[0].message.content;

    if (data.usage) {
      this.state.classTokenUsage.promptCacheHit += data.usage.prompt_cache_hit_tokens || 0;
      this.state.classTokenUsage.promptCacheMiss += data.usage.prompt_cache_miss_tokens || 0;
      this.state.classTokenUsage.completionTokens += data.usage.completion_tokens || 0;
    }

    let parsed;
    try {
      const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/) || reply.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : reply;
      parsed = JSON.parse(jsonStr);
    } catch(e) {
      parsed = { summary: '本节课完成。', diary: '今天的课上完了。', wechat: [{ sender: teacher.name, content: '今天的课上得很顺利！' }] };
    }

    // --- 保存教师记忆 ---
    const nowDate = formatDate(new Date());
    const lessonLabel = `第${section.chapterNum}章 ${section.title}`;

    // 授课教师教学笔记 → 写教学日志文件
    if (parsed.teacherNote) {
      await this._appendTeacherMemory(teacher.id, nowDate, lessonLabel, parsed.teacherNote);
      console.log('🧠 教师记忆: ' + teacher.name + '(' + teacher.id + ') → 老师/' + teacher.id + '_教学日志.md | ' + lessonLabel);
    } else {
      console.warn('🧠 教师记忆: ' + teacher.name + '(' + teacher.id + ') 本次未生成 teacherNote（API 返回可能缺失该字段）');
    }

    // 群聊参与教师的观察笔记 → 写教学日志文件
    if (parsed.participantNotes && Array.isArray(parsed.participantNotes)) {
      for (const pn of parsed.participantNotes) {
        const other = allTeachers.find(t => t.name === pn.teacherName || t.namePure === pn.teacherName);
        if (other && other.id !== teacher.id) {
          try {
            await this._appendTeacherMemory(other.id, nowDate, lessonLabel + '（群聊观察）', pn.note);
          } catch (e) { /* 忽略 */ }
        }
      }
    }

        LS.set('teacher_notes', this.state.teacherNotes);
    console.log('💾 teacher_notes 已写入 LS，教师数：' + Object.keys(this.state.teacherNotes).length + '，总记忆条数：' + Object.values(this.state.teacherNotes).reduce((s, a) => s + a.length, 0));

    // ===== 知识点管道：从 AI 结构化输出写入各 RPG 子系统 =====
    const p = this.state.progress || this.parseProgressSeed();
    p.completedLessons = (p.completedLessons || 0) + 1;
    p.currentProgress = `已完成第${section.chapterNum}章 ${section.title}`;
    p.lessonRecords = p.lessonRecords || [];
    const courseName = this.state.selectedCourse || '默认课程';

    // 处理 knowledgePoints → courseMastery + weakPoints
    p.courseMastery = p.courseMastery || {};
    if (!p.courseMastery[courseName]) p.courseMastery[courseName] = [];
    p.weakPoints = p.weakPoints || [];

    const kps = parsed.knowledgePoints || [];
    // 存储原始知识点评估供调试查看
    this.state.lastKnowledgePoints = { date: formatDate(new Date()), section: section.title, points: kps };
    LS.set('last_knowledge_points', this.state.lastKnowledgePoints);

    const masteredFromKP = kps.filter(k => k.status === 'mastered').map(k => k.name);
    const weakFromKP = kps.filter(k => k.status === 'weak').map(k => k.name);
    const notCoveredFromKP = kps.filter(k => k.status === 'not_covered').map(k => k.name);

    // 写入 courseMastery（已掌握）
    masteredFromKP.forEach(c => {
      if (!p.courseMastery[courseName].includes(c)) p.courseMastery[courseName].push(c);
    });
    // 兼容旧字段：从 strengths 也取
    (parsed.strengths || []).forEach(c => {
      if (!p.courseMastery[courseName].includes(c)) p.courseMastery[courseName].push(c);
    });
    // 兼容旧字段：masteredConcepts
    (parsed.masteredConcepts || []).forEach(c => {
      if (!p.courseMastery[courseName].includes(c)) p.courseMastery[courseName].push(c);
    });

    // 写入 weakPoints（薄弱点，去重）
    [...weakFromKP, ...(parsed.weakPoints || [])].forEach(w => {
      if (w && !p.weakPoints.includes(w)) p.weakPoints.push(w);
    });

    // 写入 lessonRecords（含完整知识点分解）
    p.lessonRecords.push({
      date: formatDate(new Date()),
      teacher: teacher.name,
      courseName: courseName,
      chapterNum: section.chapterNum,
      sectionNum: section.num,
      title: section.title,
      summary: parsed.summary,
      masteredConcepts: masteredFromKP.length > 0 ? masteredFromKP : (parsed.masteredConcepts || []),
      weakConcepts: weakFromKP,
      notCoveredConcepts: notCoveredFromKP,
      extensionQuestions: parsed.extensionQuestions || [],
      allKnowledgePoints: kps
    });

    // 将拓展题 + 补强建议写入授课教师记忆（优先注入下节课）
    const extensionNoteParts = [];
    if (parsed.extensionQuestions && parsed.extensionQuestions.length > 0) {
      extensionNoteParts.push('【拓展思考题】' + parsed.extensionQuestions.join('；'));
    }
    if (parsed.nextLessonHints) {
      extensionNoteParts.push('【下节课建议】' + parsed.nextLessonHints);
    }
    if (extensionNoteParts.length > 0) {
      if (!this.state.teacherNotes[teacher.id]) this.state.teacherNotes[teacher.id] = [];
      this.state.teacherNotes[teacher.id].push({
        date: formatDate(new Date()),
        lesson: `第${section.chapterNum}章 ${section.title}`,
        chapterNum: section.chapterNum,
        sectionNum: section.num,
        note: extensionNoteParts.join('\n')
      });
      if (this.state.teacherNotes[teacher.id].length > 20) {
        this.state.teacherNotes[teacher.id] = this.state.teacherNotes[teacher.id].slice(-20);
      }
      LS.set('teacher_notes', this.state.teacherNotes);
    }

    this.state.progress = p;
    LS.set('progress', p);
    this.updatePetBadge();

    // 回写知识地图到章概括文件（状态更新）
    try {
      const kmSection = this._getPrimarySection();
      if (kmSection && chapterPlan && chapterPlan.knowledgeMap) {
        const secMaps = chapterPlan.knowledgeMap.filter(k => k.section === kmSection.num);
        let updated = false;
        secMaps.forEach(secMap => {
          (secMap.points || []).forEach(pt => {
            const match = kps.find(k => k.name === pt.name);
            if (match) {
              const newStatus = match.status === 'mastered' ? '✅' : match.status === 'weak' ? '🔄' : '⬜';
              if (pt.status !== newStatus) { pt.status = newStatus; updated = true; }
            }
          });
        });
        if (updated) {
          const planPath = '教案/' + (this.state.selectedCourse || '') + '/_第' + kmSection.chapterNum + '章_概括.json';
          await this._savePlanFile(planPath, JSON.stringify(chapterPlan, null, 2));
          LS.set('plan_chapter_' + (this.state.selectedCourse || '') + '_' + kmSection.chapterNum, chapterPlan);
          console.log('🗺️ 知识地图已更新：' + planPath);
        }
      }
    } catch (e) { console.warn('知识地图回写失败：', e.message); }

    console.log(`📊 知识点管道：mastered=${masteredFromKP.length} weak=${weakFromKP.length} notCovered=${notCoveredFromKP.length} | 拓展题=${(parsed.extensionQuestions||[]).length} | weakPoints总计=${p.weakPoints.length}`);

    // 添加日记
    const diary = this.state.diary || [];
    diary.unshift({ date: new Date().toISOString(), content: parsed.diary, auto: true, teacher: teacher.name });
    this.state.diary = diary;
    LS.set('diary', diary);

    // 添加微信消息
    const now = new Date();
    const wcMsgs = (parsed.wechat || []).map(m => ({
      date: now.toISOString(), sender: m.sender, content: m.content
    }));
    this.state.wechatUnread = (this.state.wechatUnread || []).concat(wcMsgs);
    LS.set('wechat_unread', this.state.wechatUnread);

    this.renderSidebar();
  },

  getGuardianForDisciple(discipleName) {
    const map = { '刻晴': '格里高尔', '三月七': '以实玛丽', '甘雨': '十四行诗' };
    return map[discipleName] || discipleName;
  },

  // ========== 会话归档 ==========
  saveConversationArchive() {
    const chat = this.state.chatHistory;
    if (!chat || chat.length < 2) return;

    const teacher = this.getCurrentTeacher();
    const section = this._getPrimarySection();
    const u = this.state.classTokenUsage; const cost = calcCost(u.promptCacheHit || 0, u.promptCacheMiss || 0, u.completionTokens);
    const archive = {
      id: 'arc_' + Date.now(),
      date: new Date().toISOString(),
      dateFormatted: formatDate(new Date()),
      teacherId: this.state.selectedTeacherId,
      teacherName: teacher.name,
      chapterNum: section ? section.chapterNum : '?',
      sectionNum: section ? section.num : '?',
      sectionTitle: section ? section.title : '未知',
      messages: chat
	        .filter(m => !(m.role === 'user' && (m.content.startsWith('⏱️') || m.content.startsWith('【系统提示】') || m.content.startsWith('【系统注入') || m.content.startsWith('⏸️ 系统指令') || m.content.startsWith('(我卡住了'))))
	        .map(m => ({ role: m.role, content: m.content })),
      tokenUsage: { ...this.state.classTokenUsage, cost: { usd: cost.usd, cny: cost.cny } }
    };

    archive.type = 'class';
    this.state.conversationArchives.unshift(archive);
    LS.set('conversation_archives', this.state.conversationArchives);
    this.addSystemMessage('📂 本节课对话已存档（可在"会话归档"中查看）');
  },

  savePetConversationArchive() {
    const p = this.state.pet;
    const msgs = p.teachingMessages;
    if (!msgs || msgs.length < 2) return;

    // Calculate token usage from pet sessions (approximate since pet doesn't track separately)
    const totalChars = msgs.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.round(totalChars * 0.5); // rough: ~2 chars per token for Chinese

    const archive = {
      id: 'pet_arc_' + Date.now(),
      type: 'pet',
      date: new Date().toISOString(),
      dateFormatted: formatDate(new Date()),
      petName: p.name,
      petEmoji: this.getPetAppearance().emoji,
      topic: p.teachingTopic,
      messages: msgs.map(m => ({ role: m.role, content: m.content })),
      learnedWords: [...(p.learnedWords || [])],
      goldenEggs: p.goldenEggs.length,
      tokenUsage: { promptCacheHit: 0, promptCacheMiss: estimatedTokens, completionTokens: estimatedTokens, cost: { cny: 0 } }
    };

    this.state.conversationArchives.unshift(archive);
    LS.set('conversation_archives', this.state.conversationArchives);
  },

  showTokenStats() {
    const usage = this.state.classTokenUsage;
    const hit = usage.promptCacheHit || 0;
    const miss = usage.promptCacheMiss || 0;
    const cost = calcCost(hit, miss, usage.completionTokens);
    const totalTokens = cost.totalTokens;
    if (totalTokens === 0) return;
    const kTokens = (totalTokens / 1000).toFixed(1);
    const promptK = ((hit + miss) / 1000).toFixed(1);
    const hitK = (hit / 1000).toFixed(1);
    const missK = (miss / 1000).toFixed(1);
    const completeK = (usage.completionTokens / 1000).toFixed(1);
    const cachePct = (hit + miss) > 0 ? Math.round(hit / (hit + miss) * 100) : 0;
    const cnyStr = cost.cny < 0.01 ? '< ¥0.01' : '≈ ¥' + cost.cny.toFixed(4);
    // 渲染到 chat-empty 区域（此时 chat-messages 已被隐藏）
    const statsHtml = `📊 本课统计 — Token：输入 ${promptK}K（💾缓存 ${hitK}K · ✨新 ${missK}K · 命中率 ${cachePct}%） + 输出 ${completeK}K = 共 ${kTokens}K | ${cnyStr} · ${MODEL_CONFIG.name}`;
    this.addSystemMessage(statsHtml);
    // 写入 empty 内容区，保留开始上课按钮
    const contentEl = $('#chat-empty-content');
    if (contentEl) {
      contentEl.innerHTML = `<div class="chat-empty-icon">📊</div><p>${statsHtml}</p><p style="margin-top:8px;color:var(--text-secondary)">在左侧选择课程章节和授课导师，开始新的课程</p>`;
    }
  },

  renderHistoryView() {
    const listEl = $('#history-list');
    const archives = this.state.conversationArchives;
    $('#history-detail-content').style.display = 'none';
    $('#history-detail-empty').style.display = 'flex';
    $$('.history-item').forEach(el => el.classList.remove('selected'));

    if (!archives.length) {
      listEl.innerHTML = `<div class="history-empty-state">
        <div style="font-size:36px;margin-bottom:8px">📭</div>
        <p>暂无会话归档</p>
        <p style="font-size:12px">每次课程结束后会自动归档</p>
      </div>`;
      return;
    }

    listEl.innerHTML = archives.map(a => {
      const isPet = a.type === 'pet';
      const isHw = a.type === 'homework';
      const firstMsg = a.messages.find(m => m.role === 'assistant');
      const preview = firstMsg ? firstMsg.content.substring(0, 60) + '…' : '';
      let titleHtml, metaHtml;
      if (isPet) {
        titleHtml = `<div class="history-item-title">🐣 萌宠授课 · ${a.topic || '未命名'}</div>`;
        metaHtml = `${a.petName || '萌宠'} · ${a.dateFormatted} · ${a.messages.length}轮对话 · 🥚${a.goldenEggs || 0}金蛋`;
      } else if (isHw) {
        titleHtml = `<div class="history-item-title">✏️ 作业批改 · ${a.fileName || '未命名'}</div>`;
        metaHtml = `${a.teacherName} · ${a.dateFormatted} · ${a.messages.length}轮对话`;
      } else {
        titleHtml = `<div class="history-item-title" title="${this.escapeHtml(a.sectionTitle || '')}">第${a.chapterNum}章 ${a.sectionTitle}</div>`;
        metaHtml = `${a.teacherName} · ${a.dateFormatted} · ${a.messages.length}轮对话`;
      }
      return `<div class="history-item" data-id="${a.id}" onclick="App.viewArchiveDetail('${a.id}')">
        <div class="history-item-top">
          <div class="history-item-info">
            ${titleHtml}
            <div class="history-item-meta">${metaHtml}</div>
          </div>
          <div class="history-item-actions">
            <button class="btn-icon" onclick="event.stopPropagation();App.downloadArchive('${a.id}')" title="下载为文件">💾</button>
            <button class="btn-icon" onclick="event.stopPropagation();App.deleteArchive('${a.id}')" title="删除">🗑️</button>
          </div>
        </div>
        <div class="history-preview">${this.escapeHtml(preview)}</div>
      </div>`;
    }).join('');
  },

  viewArchiveDetail(id) {
    const archive = this.state.conversationArchives.find(a => a.id === id);
    if (!archive) return;
    $$('.history-item').forEach(el => el.classList.remove('selected'));
    const itemEl = $(`.history-item[data-id="${id}"]`);
    if (itemEl) itemEl.classList.add('selected');
    $('#history-detail-empty').style.display = 'none';
    const contentEl = $('#history-detail-content');
    contentEl.style.display = 'block';

    const isPet = archive.type === 'pet';
    const isHw = archive.type === 'homework';
    const teacherName = archive.teacherName || archive.petName || '导师';
    const teacher = this.state.teachers.find(t => t.name === teacherName);
    const avatarColor = teacher ? teacher.avatarColor : '#8B6914';
    const teacherAvatar = isPet ? '🐣' : isHw ? '✏️' : teacherName.charAt(0);

    let tokenInfoHtml = '';
    if (!isHw) {
      const tuPromptTotal = (archive.tokenUsage.promptCacheHit || 0) + (archive.tokenUsage.promptCacheMiss || 0) + (archive.tokenUsage.promptTokens || 0);
      if (archive.tokenUsage && (tuPromptTotal + (archive.tokenUsage.completionTokens || 0)) > 0) {
        const tu = archive.tokenUsage;
        const hit = tu.promptCacheHit || 0;
        const miss = tu.promptCacheMiss || 0;
        const totalPrompt = hit + miss + (tu.promptTokens || 0);
        const totalK = ((totalPrompt + (tu.completionTokens || 0)) / 1000).toFixed(1);
        const hitK = (hit / 1000).toFixed(1);
        const missK = (miss / 1000).toFixed(1);
        const completeK = ((tu.completionTokens || 0) / 1000).toFixed(1);
        const cachePct = (hit + miss) > 0 ? Math.round(hit / (hit + miss) * 100) : 0;
        const cnyVal = tu.cost ? tu.cost.cny : calcCost(hit, miss, tu.completionTokens || 0).cny;
        const cnyStr = cnyVal < 0.01 ? '< ¥0.01' : '≈ ¥' + cnyVal.toFixed(4);
        const cacheDetail = (hit + miss) > 0
          ? `💾缓存${hitK}K · ✨新${missK}K · 命中${cachePct}%`
          : `（历史数据，无缓存细分）`;
        tokenInfoHtml = `<div style="font-size:11px;color:var(--accent);margin-top:4px;line-height:1.5">
          📊 ${totalK}K tokens ${cacheDetail} · ${cnyStr}</div>`;
      }
    }

    let headerHtml;
    if (isPet) {
      headerHtml = `<div style="font-size:18px;font-weight:700;margin-bottom:4px">🐣 萌宠授课 · ${archive.topic || '未命名'}</div>
        <div style="font-size:13px;color:var(--text-secondary)">
          ${archive.petName || '萌宠'} · ${archive.dateFormatted} · 共 ${archive.messages.length} 轮对话 · 🥚 ${archive.goldenEggs || 0} 金蛋
        </div>`;
    } else if (isHw) {
      headerHtml = `<div style="font-size:18px;font-weight:700;margin-bottom:4px">✏️ 作业批改 · ${archive.fileName || '未命名'}</div>
        <div style="font-size:13px;color:var(--text-secondary)">
          ${archive.teacherName} 批改 · ${archive.dateFormatted} · 共 ${archive.messages.length} 轮对话
        </div>`;
    } else {
      headerHtml = `<div style="font-size:18px;font-weight:700;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${this.escapeHtml(archive.sectionTitle)}">第${archive.chapterNum}章 ${archive.sectionTitle}</div>
        <div style="font-size:13px;color:var(--text-secondary)">
          ${archive.teacherName} 授课 · ${archive.dateFormatted} · 共 ${archive.messages.length} 轮对话
        </div>`;
    }

    contentEl.innerHTML = `
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--accent)">
        ${headerHtml}
        ${tokenInfoHtml}
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn btn-sm btn-outline" onclick="App.downloadArchive('${archive.id}')">💾 下载为 .md</button>
          <button class="btn btn-sm btn-outline" onclick="App.deleteArchive('${archive.id}');App.renderHistoryView();$$('.history-item').forEach(e=>e.classList.remove('selected'));$('#history-detail-empty').style.display='flex';$('#history-detail-content').style.display='none'" style="color:var(--danger)">🗑️ 删除此存档</button>
        </div>
      </div>
      ${archive.messages.map(m => {
        const isUser = m.role === 'user';
        let senderName, roleTag, displayAvatar, displayBg;
        if (isUser) {
          senderName = '旅者';
          roleTag = '学生';
          displayAvatar = '旅';
          displayBg = '#a08060';
        } else if (isPet) {
          senderName = archive.petName || '萌宠';
          roleTag = '萌宠';
          displayAvatar = archive.petEmoji || '🐣';
          displayBg = '#e8a440';
        } else if (isHw) {
          senderName = teacherName;
          roleTag = '导师';
          displayAvatar = '师';
          displayBg = avatarColor;
        } else {
          senderName = teacherName;
          roleTag = '导师';
          displayAvatar = teacherAvatar;
          displayBg = avatarColor;
        }
        return `<div class="history-msg">
          <div class="history-msg-header">
            <div class="history-msg-avatar" style="background:${displayBg}">${displayAvatar}</div>
            <span class="history-msg-sender">${senderName}</span>
            <span class="history-msg-role-tag${isUser ? ' user' : ''}">${roleTag}</span>
          </div>
          <div class="history-msg-content">${this.renderContent(m.content)}</div>
        </div>`;
      }).join('')}
    `;

    if (window.renderMathInElement) {
      renderMathInElement(contentEl, {
        delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}],
        throwOnError: false
      });
    }
  },

  deleteArchive(id) {
    if (!confirm('确定永久删除这条对话存档吗？此操作不可撤销。')) return;
    this.state.conversationArchives = this.state.conversationArchives.filter(a => a.id !== id);
    LS.set('conversation_archives', this.state.conversationArchives);
    this.renderHistoryView();
  },

  downloadArchive(id) {
    const archive = this.state.conversationArchives.find(a => a.id === id);
    if (!archive) return;
    const isHw = archive.type === 'homework';
    let md = `# 视界探索者教团 · 教学对话存档\n\n`;
    md += `- **日期**：${archive.dateFormatted}\n`;
    if (isHw) {
      md += `- **类型**：作业批改\n`;
      md += `- **作业文件**：${archive.fileName || '粘贴内容'}\n`;
      md += `- **导师**：${archive.teacherName}\n`;
      md += `- **对话轮数**：${archive.messages.length}\n`;
    } else {
      md += `- **章节**：第${archive.chapterNum}章 ${archive.sectionTitle}\n`;
      md += `- **导师**：${archive.teacherName}\n`;
      md += `- **对话轮数**：${archive.messages.length}\n`;
      md += `- **模型**：${MODEL_CONFIG.name}\n`;
    }

    if (archive.tokenUsage) {
      const tu = archive.tokenUsage;
      const totalK = (((tu.promptCacheHit || 0) + (tu.promptCacheMiss || 0) + (tu.promptTokens || 0) + (tu.completionTokens || 0)) / 1000).toFixed(1);
      md += `- **Token 用量**：总 ${totalK}K\n`;
    }
    md += `\n---\n\n`;

    archive.messages.forEach(m => {
      if (m.role === 'assistant') {
        md += `### ${archive.teacherName}：\n\n${m.content}\n\n`;
      } else {
        md += `### 旅者：\n\n${m.content}\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let safeFilename;
    if (isHw) {
      safeFilename = `作业批改_${archive.fileName || '粘贴'}_${archive.dateFormatted.replace(/[/\\:]/g,'_')}.md`;
    } else {
      safeFilename = `教团会话_第${archive.chapterNum}章_${archive.sectionTitle}_${archive.dateFormatted.replace(/[/\\:]/g,'_')}.md`;
    }
    a.download = safeFilename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ========== 数据备份与恢复 ==========
  backupAllData() {
    const data = {
      version: 3,
      exportDate: new Date().toISOString(),
      modelConfig: MODEL_CONFIG,
      order_progress: LS.get('progress', null),
      order_exercise_history: LS.get('exercise_history', []),
      order_wechat_unread: LS.get('wechat_unread', []),
      order_wechat_archive: LS.get('wechat_archive', []),
      order_diary: LS.get('diary', []),
      order_conversation_archives: LS.get('conversation_archives', []),
      order_teacher_notes: LS.get('teacher_notes', {}),
      order_textbook_sections: LS.get('textbook_sections', {}),
      order_textbook_courses: LS.get('textbook_courses', null),
      order_selected_course: LS.get('selected_course', ''),
      // RPG 数据
      order_rpg_trees: LS.get('rpg_trees', null),
      order_rpg_bonds: LS.get('rpg_bonds', null),
      order_rpg_gameday: LS.get('rpg_gameday', 1),
      // 答题打怪数据
      order_battle_player: LS.get('battle_player', null),
      order_battle_combat: LS.get('battle_combat', null),
      order_pet_data: LS.get('pet_data', null),
      order_course_position: LS.get('course_position', {}),
      order_stuck_log: LS.get('stuck_log', []),
      order_stuck_exercises: LS.get('stuck_exercises', []),
      order_last_knowledge_points: LS.get('last_knowledge_points', null),
      order_flagged_messages: LS.get('flagged_messages', [])
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    a.download = `教团存档_${dateStr}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ 教团存档已下载！\n\n包含：学习进度、三树状态、羁绊值、物品背包、群聊、日志等全部数据。');
  },

  restoreAllData() {
    $('#restore-file-input').click();
  },

  handleRestoreFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('⚠️ 恢复存档会覆盖当前全部进度，确定继续吗？')) {
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version) throw new Error('备份文件格式不正确');

        const keys = [
          'order_progress', 'order_exercise_history',
          'order_wechat_unread', 'order_wechat_archive',
          'order_diary', 'order_conversation_archives',
          'order_teacher_notes',
          'order_textbook_sections',
          'order_textbook_courses', 'order_selected_course',
          'order_rpg_trees', 'order_rpg_bonds', 'order_rpg_gameday',
          'order_battle_player', 'order_battle_combat',
          'order_pet_data',
          'order_course_position',
          'order_stuck_log',
          'order_stuck_exercises',
          'order_last_knowledge_points',
          'order_flagged_messages'
        ];
        keys.forEach(k => {
          if (data[k] !== undefined) {
            const lsKey = k.replace('order_', '');
            localStorage.setItem('order_' + lsKey, JSON.stringify(data[k]));
          }
        });

        this.loadPersistentData();
        this.renderSidebar();
        this.renderBattleView();
        this.renderWechatView();
        this.renderDiaryView();
        this.renderHistoryView();
        alert('✅ 存档恢复成功！');
      } catch (err) {
        alert('❌ 恢复失败：' + err.message);
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  },

  saveAllState() {
    if (this.state.progress) LS.set('progress', this.state.progress);
    LS.set('exercise_history', this.state.exerciseHistory);
    LS.set('wechat_unread', this.state.wechatUnread);
    LS.set('wechat_archive', this.state.wechatArchive);
    LS.set('diary', this.state.diary);
    LS.set('conversation_archives', this.state.conversationArchives);
    LS.set('teacher_notes', this.state.teacherNotes);
    LS.set('chat_history', this.state.chatHistory);
    LS.set('pet_data', this.state.pet);
    LS.set('textbook_courses', this.state.textbookCourses);
    LS.set('selected_course', this.state.selectedCourse);
    LS.set('rpg_gameday', this.state.gameDay);
    LS.setStr('rpg_gametime', this.state.gameTime);
    LS.set('course_position', this.state.coursePosition);
    LS.set('stuck_log', this.state.stuckLog);
    LS.set('stuck_exercises', this.state.stuckExercises);
    LS.set('last_knowledge_points', this.state.lastKnowledgePoints);
    LS.set('flagged_messages', this.state.flaggedMessages);
  },

  // ========== 聊天 UI ==========
  renderChatView() {
    if (this.state.isClassActive) {
      $('#chat-messages').innerHTML = '';
      $('#chat-messages').style.display = 'flex';
      $('#chat-empty').style.display = 'none';
      $('#chat-input-area').style.display = 'flex';
      this.state.chatHistory.forEach(m => { this.addMessage(m.role, m.content, false); });
    }
  },

  addMessage(role, content, save = true) {
    const container = $('#chat-messages');
    const div = document.createElement('div');
    div.className = 'message ' + (role === 'user' ? 'user' : role === 'system' ? 'system' : 'ai');
    if (role === 'system') {
      div.innerHTML = `<div class="message-bubble">${this.escapeHtml(content)}</div>`;
    } else {
      const teacher = this.getCurrentTeacher();
      const avatarLetter = role === 'user' ? '旅' : (teacher.name ? teacher.name.charAt(0) : '师');
      const avatarColor = role === 'user' ? '#a08060' : (teacher.avatarColor || '#8B6914');
      const now = formatDate(new Date());
      const msgIdx = this.state.chatHistory.length; // 当前消息在 chatHistory 中的索引
      const flagBtn = role === 'assistant' && this.state.isClassActive
        ? `<button class="msg-flag-btn" onclick="App._flagMessage(${msgIdx})" title="标记此段讲解，课后生成知识卡片">📌</button>`
        : '';
      div.innerHTML = `
        <div class="message-avatar" style="background:${avatarColor}">${avatarLetter}</div>
        <div>
          <div class="message-bubble">${this.renderContent(content)}</div>
          <div class="message-time">${now} ${flagBtn}</div>
        </div>`;
    }
    container.appendChild(div);
    this.scrollToBottom();
    if (window.renderMathInElement) {
      renderMathInElement(div, {
        delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}],
        throwOnError: false
      });
    }
  },

  // 标记 AI 消息，课后生成知识卡片
  _flagMessage(idx) {
    if (!this.state.isClassActive) return;
    const msg = this.state.chatHistory[idx];
    if (!msg || msg.role !== 'assistant') return;
    // 检查是否已标记
    const already = this.state.flaggedMessages.find(f => f.index === idx);
    if (already) {
      this.state.flaggedMessages = this.state.flaggedMessages.filter(f => f.index !== idx);
      this.addSystemMessage('📌 已取消标记');
    } else {
      // 提取这段讲解的主题（取前60字作为摘要）
      const snippet = msg.content.replace(/【.*?】/g, '').replace(/\*.*?\*/g, '').trim().substring(0, 80);
      this.state.flaggedMessages.push({
        index: idx,
        content: msg.content,
        snippet: snippet,
        date: formatDate(new Date()),
        sectionNum: (this._getCoursePosition() || {}).num || '',
        chapterNum: (this._getCoursePosition() || {}).chapterNum || 0
      });
      this.addSystemMessage('📌 已标记，课后将生成知识卡片（共 ' + this.state.flaggedMessages.length + ' 条）');
    }
    LS.set('flagged_messages', this.state.flaggedMessages);
  },

  addSystemMessage(text) {
    this.addMessage('system', text);
  },

  renderContent(content) {
    let html = this.escapeHtml(content);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em style="color:var(--text-secondary)">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  },

  showTyping(show) {
    $('#chat-typing').style.display = show ? 'flex' : 'none';
    this.scrollToBottom();
  },

  scrollToBottom() {
    const el = $('#chat-messages');
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  },

  // ========== 作业问答 ==========
  getHomeworkTeacher() {
    const id = this.state.homeworkTeacherId;
    const t = this.state.teachers.find(t => t.id === id);
    if (t) return t;
    return { name: '导师', namePure: '导师', avatarColor: '#8B6914', fullMd: '', orderRole: '使徒' };
  },

  renderHomeworkSetup() {
    const sel = $('#hw-teacher-select');
    sel.innerHTML = '<option value="">— 选择导师 —</option>' +
      this.state.teachers.map(t => `<option value="${t.id}">${t.name} ${t.orderRole === '守护导师' ? '🌳' : ''}</option>`).join('');
    sel.value = this.state.homeworkTeacherId || '';

    const fileSel = $('#hw-file-select');
    fileSel.innerHTML = '<option value="">— 选择作业文件 —</option>' +
      this.state.homeworkFiles.map(f => `<option value="${f.filename}">${f.displayName}</option>`).join('');
  },

  toggleHomeworkPaste() {
    const area = $('#homework-paste-area');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
    if (area.style.display === 'block') {
      $('#hw-file-select').value = '';
    }
  },

  async startHomework() {
    const teacherId = $('#hw-teacher-select').value;
    if (!teacherId) { alert('请选择一位导师'); return; }
    if (!this.state.apiKey) { alert('请先设置 API Key'); return; }

    let homeworkContent = '';
    const selectedFile = $('#hw-file-select').value;
    const pastedContent = $('#hw-paste-input').value.trim();

    if (selectedFile) {
      try {
        homeworkContent = await this.fetchHomeworkFile(selectedFile);
        this.state.homeworkFileName = selectedFile;
      } catch(e) {
        alert('加载作业文件失败：' + e.message);
        return;
      }
    } else if (pastedContent) {
      homeworkContent = pastedContent;
      this.state.homeworkFileName = '';
    } else {
      alert('请选择作业文件或粘贴作业内容');
      return;
    }

    this.state.homeworkTeacherId = teacherId;
    this.state.homeworkActive = true;
    this.state.homeworkMessages = [];
    this.state.homeworkContent = homeworkContent;

    $('#homework-setup').style.display = 'none';
    $('#homework-chat').style.display = 'flex';
    $('#btn-end-homework').disabled = false;
    $('#hw-messages').innerHTML = '';

    const teacher = this.getHomeworkTeacher();
    this.hwAddSystemMessage(`📝 作业问答开始 — ${teacher.name} 逐题批改 · ${this.state.homeworkFileName || '粘贴内容'}`);

    // Send initial message to AI to kick off the first question
    await this.sendHomeworkToAI(null, `请开始逐题批改。先呈现第一道题，然后问我的答案。`);
    $('#hw-chat-input').focus();
  },

  async sendHomeworkToAI(userMsgContent, systemOverrideContent) {
    this.hwShowTyping(true);
    try {
      const kickoffMsg = systemOverrideContent || userMsgContent;
      if (kickoffMsg) {
        this.state.homeworkMessages.push({ role: 'user', content: kickoffMsg });
      }

      const teacher = this.getHomeworkTeacher();
      let systemPrompt;
      if (systemOverrideContent) {
        // Initial kick-off: use full system prompt
        const hwTemplate = await this.fetchHomeworkPrompt();
        systemPrompt = hwTemplate.replace('{{HOMEWORK_CONTENT}}', this.state.homeworkContent);
        // Add teacher persona
        systemPrompt += `\n\n=== 当前导师人设（你就是这位导师） ===\n${(teacher.fullMd ? teacher.fullMd.replace(/## 教学记忆[\s\S]*$/, '').trim().substring(0, 3000) : '') || teacher.personaBrief || '通用导师'}`;
        const hwCourse = this.state.textbookCourses.find(c => c.courseName === this.state.selectedCourse);
        const hwDomainHint = (hwCourse && hwCourse.domainHint)
          ? hwCourse.domainHint
          : '这是一门课程。所有讨论必须围绕课程主题，不要偏离领域。';
        systemPrompt += `\n\n=== 重要指令 ===\n1. 你现在就是${teacher.name}，用她的性格、语气、风格说话。\n2. 严格逐题批改，每次只处理一道题。\n3. 不要直接给答案。用反问、反例、提示引导学生自己发现。\n4. 数学公式用 $...$ 或 $$...$$ 格式。\n5. 【领域边界】${hwDomainHint}`;
      } else {
        // Continuation: use minimal context
        systemPrompt = `你正在逐题批改作业。你是${teacher.name}的苏格拉底式导师。继续逐题处理。前面已处理的题目不要重复。数学公式用 $...$ 或 $$...$$ 格式。`;
      }

      const apiMessages = [{ role: 'system', content: systemPrompt }];
      for (const msg of this.state.homeworkMessages) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.apiKey
        },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: apiMessages,
          temperature: 0.8,
          max_tokens: 2048
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || 'API 请求失败 (HTTP ' + resp.status + ')');
      }

      const data = await resp.json();
      const reply = data.choices[0].message.content;
      this.state.homeworkMessages.push({ role: 'assistant', content: reply });
      this.hwAddMessage('assistant', reply);

      if (data.usage) {
        this.state.classTokenUsage.promptCacheHit += data.usage.prompt_cache_hit_tokens || 0;
        this.state.classTokenUsage.promptCacheMiss += data.usage.prompt_cache_miss_tokens || 0;
        this.state.classTokenUsage.completionTokens += data.usage.completion_tokens || 0;
      }
    } catch (e) {
      this.hwAddSystemMessage('❌ 错误：' + e.message);
    }
    this.hwShowTyping(false);
  },

  async sendHomeworkMessage() {
    if (!this.state.homeworkActive) return;
    const input = $('#hw-chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    this.hwAddMessage('user', text);
    await this.sendHomeworkToAI(text, null);
    this.hwScrollToBottom();
  },

  async sendHomeworkStuck() {
    if (!this.state.homeworkActive) return;
    this.hwAddSystemMessage('🆘 你表示卡住了，老师会降低难度引导…');
    await this.sendHomeworkToAI('我卡住了，请降低难度或给提示。', null);
    this.hwScrollToBottom();
  },

  handleHomeworkInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendHomeworkMessage();
    }
  },

  endHomework() {
    // 先保存到会话归档
    this.saveHomeworkArchive();
    this.state.homeworkActive = false;
    this.state.homeworkMessages = [];
    this.state.homeworkContent = '';
    this.state.homeworkFileName = '';
    $('#homework-setup').style.display = '';
    $('#homework-chat').style.display = 'none';
    $('#btn-end-homework').disabled = true;
    $('#hw-messages').innerHTML = '';
    $('#hw-chat-input').value = '';
    this.hwAddSystemMessage('📝 作业批改已结束（对话已归档）。');
  },

  saveHomeworkArchive() {
    const msgs = this.state.homeworkMessages;
    if (!msgs || msgs.length < 2) return;
    const teacher = this.getHomeworkTeacher();
    const archive = {
      id: 'hw_' + Date.now(),
      type: 'homework',
      date: new Date().toISOString(),
      dateFormatted: formatDate(new Date()),
      teacherId: this.state.homeworkTeacherId,
      teacherName: teacher.name,
      fileName: this.state.homeworkFileName || '粘贴内容',
      messages: msgs.map(m => ({ role: m.role, content: m.content })),
    };
    this.state.conversationArchives.unshift(archive);
    LS.set('conversation_archives', this.state.conversationArchives);
  },

  renderHomeworkView() {
    this.renderHomeworkSetup();
    if (this.state.homeworkActive) {
      $('#homework-setup').style.display = 'none';
      $('#homework-chat').style.display = 'flex';
      $('#btn-end-homework').disabled = false;
    } else {
      $('#homework-setup').style.display = '';
      $('#homework-chat').style.display = 'none';
      $('#btn-end-homework').disabled = true;
    }
  },

  // ========== 作业问答 UI 辅助 ==========
  hwAddMessage(role, content) {
    const container = $('#hw-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'message ' + (role === 'user' ? 'user' : role === 'system' ? 'system' : 'ai');
    if (role === 'system') {
      div.innerHTML = `<div class="message-bubble">${this.escapeHtml(content)}</div>`;
    } else {
      const teacher = this.getHomeworkTeacher();
      const avatarLetter = role === 'user' ? '旅' : (teacher.name ? teacher.name.charAt(0) : '师');
      const avatarColor = role === 'user' ? '#a08060' : (teacher.avatarColor || '#8B6914');
      const now = formatDate(new Date());
      div.innerHTML = `
        <div class="message-avatar" style="background:${avatarColor}">${avatarLetter}</div>
        <div>
          <div class="message-bubble">${this.renderContent(content)}</div>
          <div class="message-time">${now}</div>
        </div>`;
    }
    container.appendChild(div);
    this.hwScrollToBottom();
    if (window.renderMathInElement) {
      renderMathInElement(div, {
        delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}],
        throwOnError: false
      });
    }
  },

  hwAddSystemMessage(text) {
    this.hwAddMessage('system', text);
  },

  hwShowTyping(show) {
    const el = $('#hw-typing');
    if (el) el.style.display = show ? 'flex' : 'none';
    this.hwScrollToBottom();
  },

  hwScrollToBottom() {
    const el = $('#hw-messages');
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  },

  // ========== 费曼萌宠 ==========
  // --- 萌宠状态辅助 ---
  getPetAppearance() { return PET_APPEARANCES.find(a => a.id === this.state.pet.appearance) || PET_APPEARANCES[0]; },
  getPetPersonality() { return PET_PERSONALITIES.find(p => p.id === this.state.pet.personality) || PET_PERSONALITIES[0]; },
  getPetStage() { return PET_EVOLUTION_STAGES.find(s => s.stage === this.state.pet.evolutionStage) || PET_EVOLUTION_STAGES[0]; },
  getPetNextStage() { return PET_EVOLUTION_STAGES.find(s => s.stage === this.state.pet.evolutionStage + 1) || null; },
  getCompletedLessonsCount() {
    return this.state.progress ? (this.state.progress.completedLessons || 0) : 0;
  },

  // --- 主渲染 ---
  renderPetView() {
    const p = this.state.pet;
    if (!p.unlocked) {
      const completed = this.getCompletedLessonsCount();
      const canHatch = completed >= PET_UNLOCK_LESSONS;
      $('#pet-egg-stage').style.display = '';
      $('#pet-hatch-ceremony').style.display = 'none';
      $('#pet-main-stage').style.display = 'none';
      const pct = Math.min(100, Math.round((completed / PET_UNLOCK_LESSONS) * 100));
      $('#pet-egg-progress-fill').style.width = pct + '%';
      $('#pet-egg-progress-text').textContent = `已学 ${completed}/${PET_UNLOCK_LESSONS} 节课` + (canHatch ? ' — 🎉 蛋开始裂开了！点击下方按钮领养萌宠' : '');
      if (canHatch) {
        // Show hatch button
        if (!$('#pet-hatch-ready-btn')) {
          const btn = document.createElement('button');
          btn.id = 'pet-hatch-ready-btn';
          btn.className = 'btn btn-primary';
          btn.style.cssText = 'margin-top:16px;font-size:16px;padding:12px 32px;';
          btn.textContent = '🐣 破壳领养';
          btn.onclick = () => { this.showHatchCeremony(); };
          $('#pet-egg-stage .pet-egg-container').appendChild(btn);
        }
        $('#pet-hatch-ready-btn').style.display = '';
      } else {
        const btn = $('#pet-hatch-ready-btn');
        if (btn) btn.style.display = 'none';
      }
    } else if (p.isTeaching) {
      $('#pet-egg-stage').style.display = 'none';
      $('#pet-hatch-ceremony').style.display = 'none';
      $('#pet-main-stage').style.display = '';
      this.renderPetMain();
    } else {
      $('#pet-egg-stage').style.display = 'none';
      $('#pet-hatch-ceremony').style.display = 'none';
      $('#pet-main-stage').style.display = '';
      this.renderPetMain();
    }
  },

  showHatchCeremony() {
    $('#pet-egg-stage').style.display = 'none';
    $('#pet-hatch-ceremony').style.display = '';
    $('#pet-main-stage').style.display = 'none';
    // Render appearance options
    let appHtml = '';
    PET_APPEARANCES.forEach(a => {
      appHtml += `<div class="pet-option-card" data-app="${a.id}" onclick="App.selectPetAppearance('${a.id}')">
        <span class="pet-option-emoji">${a.emoji}</span>${a.name}
      </div>`;
    });
    $('#pet-appearance-options').innerHTML = appHtml;
    // Render personality options
    let persHtml = '';
    PET_PERSONALITIES.forEach(p => {
      persHtml += `<div class="pet-option-card" data-pers="${p.id}" onclick="App.selectPetPersonality('${p.id}')">
        <span class="pet-option-emoji">${p.emoji}</span>${p.name}
      </div>`;
    });
    $('#pet-personality-options').innerHTML = persHtml;
    // Default selections
    this.selectPetAppearance('cat');
    this.selectPetPersonality('curious');
  },

  selectPetAppearance(id) {
    this.state.pet.appearance = id;
    $$('#pet-appearance-options .pet-option-card').forEach(c => c.classList.toggle('selected', c.dataset.app === id));
  },
  selectPetPersonality(id) {
    this.state.pet.personality = id;
    $$('#pet-personality-options .pet-option-card').forEach(c => c.classList.toggle('selected', c.dataset.pers === id));
  },

  hatchPet() {
    const name = $('#pet-name-input').value.trim();
    if (!name) { alert('请给萌宠取个名字！'); return; }
    this.state.pet.unlocked = true;
    this.state.pet.name = name;
    this.state.pet.evolutionStage = 1;
    this.state.pet.level = 1;
    this.state.pet.goldenEggs = [];
    this.state.pet.growthReflections = [];
    this.state.pet.sessions = [];
    this.state.pet.learnedWords = [];
    LS.set('pet_data', this.state.pet);
    this.updatePetBadge();
    this.renderPetView();
  },

  renderPetMain() {
    const p = this.state.pet;
    const appearance = this.getPetAppearance();
    const stage = this.getPetStage();
    $('#pet-profile-avatar').textContent = stage.icon;
    $('#pet-profile-name').textContent = p.name + ' · ' + appearance.emoji;
    $('#pet-profile-level').textContent = 'Lv.' + p.level;
    $('#pet-profile-stage').textContent = stage.icon + ' ' + stage.name;
    $('#pet-profile-eggs').textContent = p.goldenEggs.length;

    if (p.isTeaching) {
      $('#pet-teaching-chat').style.display = 'flex';
      $('#pet-idle-panels').style.display = 'none';
      $('#btn-start-teaching').style.display = 'none';
    } else {
      $('#pet-teaching-chat').style.display = 'none';
      $('#pet-idle-panels').style.display = '';
      $('#btn-start-teaching').style.display = '';
      this.renderGoldenEggs();
      this.renderGrowthTimeline();
      this.renderLearnedWordsPanel();
    }
  },

  // --- 控制台查看词库 ---
  showPetWords() {
    const p = this.state.pet;
    console.group(`📖 ${p.name || '萌宠'} 的词库（${p.learnedWords.length} 个词）`);
    if (p.learnedWords.length === 0) {
      console.log('（词库为空——还没学过任何专业词）');
    } else {
      console.table(p.learnedWords.map(w => ({
        词汇: w.word,
        定义: w.definition,
        学会时间: w.learnedAt
      })));
    }
    console.groupEnd();
    return p.learnedWords;
  },

  // --- 控制台查看教师记忆 ---
  showTeacherNotes(teacherId) {
    const notes = this.state.teacherNotes;
    if (teacherId) {
      const arr = notes[teacherId] || [];
      console.group(`🧠 ${teacherId} 的记忆（${arr.length} 条）`);
      console.table(arr.map(n => ({ 日期: n.date, 课时: n.lesson, 笔记: n.note.substring(0, 60) + '...' })));
      console.groupEnd();
      return arr;
    }
    // 全局概览
    const teacherNames = {};
    this.state.teachers.forEach(t => { teacherNames[t.id] = t.name; });
    console.group('🧠 全部教师记忆');
    Object.entries(notes).forEach(([id, arr]) => {
      console.log(`${teacherNames[id] || id}（${id}）：${arr.length} 条`);
    });
    console.groupEnd();
    console.log('💡 用 App.showTeacherNotes("sonetto") 查看特定教师详情');
    return notes;
  },

  renderLearnedWordsPanel() {
    const panel = $('#pet-learned-words-panel');
    if (!panel) return;
    const p = this.state.pet;
    if (p.learnedWords.length === 0) {
      panel.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;padding:12px">词库空空如也——萌宠一个专业词都还没学会。去教它一节课吧！</div>';
      return;
    }
    panel.innerHTML = p.learnedWords.map(w =>
      `<span style="display:inline-block;margin:4px;padding:4px 10px;background:var(--accent-light);border-radius:12px;font-size:12px;cursor:default" title="${this.escapeHtml(w.definition)}&#10;学会于 ${w.learnedAt}">📖 ${this.escapeHtml(w.word)}</span>`
    ).join('');
    panel.innerHTML += `<div style="margin-top:8px;font-size:11px;color:var(--text-secondary)">共 ${p.learnedWords.length} 个词 · 在控制台输入 <code>App.showPetWords()</code> 查看详情</div>`;
  },

  // --- 授课对话 ---
  async startPetTeaching() {
    const p = this.state.pet;
    if (!this.state.apiKey) { alert('请先设置 API Key'); return; }
    // Use learned knowledge points as default topic (from courseMastery, fallback to masteredPoints)
    const allMasteredForPet = new Set();
    const cm = this.state.progress?.courseMastery;
    if (cm) Object.values(cm).forEach(arr => arr.forEach(c => allMasteredForPet.add(c)));
    (this.state.progress?.masteredPoints || []).forEach(c => allMasteredForPet.add(c));
    const masteredForPet = [...allMasteredForPet];
    const defaultTopic = masteredForPet.length > 0
      ? '我想教你关于：' + masteredForPet.slice(0, 5).join('、')
      : '我想教你今天学的内容';

    const topic = prompt('请输入今天的授课主题（比如"极限的定义"或"导数的几何意义"）：', defaultTopic);
    if (!topic || !topic.trim()) return;

    p.isTeaching = true;
    p.teachingMessages = [];
    p.teachingTopic = topic.trim();
    $('#pet-messages').innerHTML = '';
    $('#pet-teaching-chat').style.display = 'flex';
    $('#pet-idle-panels').style.display = 'none';
    $('#btn-start-teaching').style.display = 'none';
    $('#pet-chat-input').value = '';

    const appearance = this.getPetAppearance();
    this.petAddSystemMessage(`🎓 反转课堂开始！你来教「${p.teachingTopic}」`);
    this.petAddSystemMessage(`🐣 ${p.name}（${appearance.emoji} ${appearance.name}）正认真地看着你，等待你的讲解…`);

    // Kick off AI conversation
    await this.sendPetToAI('（主人刚刚对我说："我今天要教你关于' + p.teachingTopic + '"。我要开始提问了。）');
    $('#pet-chat-input').focus();
  },

  async sendPetToAI(userContent) {
    this.petShowTyping(true);
    const p = this.state.pet;
    try {
      if (userContent) {
        p.teachingMessages.push({ role: 'user', content: userContent });
      }

      const appearance = this.getPetAppearance();
      const personality = this.getPetPersonality();
      const stage = this.getPetStage();
      // 从 courseMastery + masteredPoints 收集所有掌握知识点
      const allMasteredForPet = new Set();
      const cm2 = this.state.progress?.courseMastery;
      if (cm2) Object.values(cm2).forEach(arr => arr.forEach(c => allMasteredForPet.add(c)));
      (this.state.progress?.masteredPoints || []).forEach(c => allMasteredForPet.add(c));
      const masteredForPrompt = [...allMasteredForPet].slice(0, 10).join('、') || '暂无记录';

      // Build learned words string for the prompt (word-level granularity)
      let learnedWordsStr = '（词库为空——你一个专业词都还没学会。主人说的任何超出生活常识的词你都不懂。）';
      if (p.learnedWords && p.learnedWords.length > 0) {
        learnedWordsStr = p.learnedWords.map(w =>
          `- **${w.word}**：${w.definition}（学会于 ${w.learnedAt}）`
        ).join('\n');
      }

      let systemPrompt;
      if (p.teachingMessages.length <= 1) {
        // First message: use full prompt
        const template = await this.fetchFeynmanPetPrompt();
        systemPrompt = template
          .replace('{{PET_NAME}}', p.name)
          .replace('{{PET_APPEARANCE_DESC}}', appearance.desc)
          .replace('{{PET_PERSONALITY_DESC}}', personality.desc)
          .replace('{{PET_LEVEL}}', String(p.level))
          .replace('{{EVOLUTION_STAGE}}', stage.icon + ' ' + stage.name)
          .replace('{{GOLDEN_EGG_COUNT}}', String(p.goldenEggs.length))
          .replace('{{LEARNED_WORDS}}', learnedWordsStr)
          .replace('{{TEACHING_TOPIC}}', p.teachingTopic)
          .replace('{{MASTERED_POINTS}}', masteredForPrompt);
      } else {
        // Continuation: include learned words so pet remembers
        systemPrompt = `你是${p.name}，一只${appearance.desc}。性格${personality.desc}。你是学生，正在听主人讲「${p.teachingTopic}」。继续提问。不要假装懂了。数学公式用$...$。

⚠️ 陌生词打断规则仍然有效！主人说的话里如果有你没学过的词，立刻停下来问。
你已学会的词：
${learnedWordsStr}

记住：对学过的词可以问更细的问题，遇到陌生词必须打断。`;
      }

      const apiMessages = [{ role: 'system', content: systemPrompt }];
      for (const msg of p.teachingMessages) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.state.apiKey },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: apiMessages,
          temperature: 0.85,
          max_tokens: 2048
        })
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.error?.message || 'API错误'); }
      const data = await resp.json();
      const reply = data.choices[0].message.content;
      p.teachingMessages.push({ role: 'assistant', content: reply });
      LS.set('pet_data', p); // 每轮对话后实时存盘
      this.petAddMessage('ai', reply);
      if (data.usage) {
        this.state.classTokenUsage.promptCacheHit += data.usage.prompt_cache_hit_tokens || 0;
        this.state.classTokenUsage.promptCacheMiss += data.usage.prompt_cache_miss_tokens || 0;
        this.state.classTokenUsage.completionTokens += data.usage.completion_tokens || 0;
      }
    } catch(e) {
      this.petAddSystemMessage('❌ 错误：' + e.message);
    }
    this.petShowTyping(false);
  },

  async sendPetMessage() {
    const p = this.state.pet;
    if (!p.isTeaching) return;
    const input = $('#pet-chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    this.petAddMessage('user', text);
    await this.sendPetToAI(text);
    this.petScrollToBottom();
  },

  petAskHint() {
    const p = this.state.pet;
    if (!p.isTeaching) return;
    this.petAddSystemMessage('💡 萌宠小声说：主人，你可以试着从最基础的定义开始讲，或者举个具体例子～');
  },

  handlePetInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendPetMessage();
    }
  },

  async endPetTeaching() {
    const p = this.state.pet;
    if (!p.isTeaching) return;
    if (p.teachingMessages.length < 2) {
      alert('还没有开始对话，至少先和萌宠互动几轮再下课吧～');
      return;
    }
    this.petAddSystemMessage('📝 正在生成课堂总结与知识金蛋…');
    this.petShowTyping(true);

    try {
      // Call AI to generate Socrates review + golden egg
      const teacher = this.getCurrentTeacher();
      const conversationText = p.teachingMessages.map(m => (m.role === 'user' ? '主人' : p.name) + '：' + m.content).join('\n\n');

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.state.apiKey },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: `你是苏格拉底，一位教学点评专家。现在学生的萌宠（名${p.name}）听了一节由主人讲授的费曼教学课。请完成三件事：

1. 【教学点评】用苏格拉底的口吻，点评主人的授课质量：哪里讲得特别清楚？哪里萌宠可能还没完全理解？给出1-2条改进建议。

2. 【知识金蛋】从对话中提炼出一个「知识金蛋」——用简洁的语言总结这堂课的核心知识点（150字以内）。格式：
<golden_egg>
标题：（简短标题，15字以内）
内容：（知识点总结，150字以内）
</golden_egg>

3. 【萌宠新词】从对话中提取萌宠在这堂课上**真正学会了的**专业词汇。重要：只列出主人讲解得清晰完整、萌宠最终用自己的话正确复述了含义的词。主人草草带过或萌宠仍然迷糊的词不列。每个词附一句萌宠能理解的定义（用12岁小孩的话说）。格式：
<learned_words>
词1：定义1
词2：定义2
（1-5个词，宁缺毋滥。如果主人没把一个词彻底讲清、萌宠没确认理解，就空着不要列）
</learned_words>

请按顺序输出：点评 → 金蛋 → 新词。` },
            { role: 'user', content: `授课主题：${p.teachingTopic}\n\n课堂对话：\n${conversationText}\n\n请给出点评、金蛋和新词列表。` }
          ],
          temperature: 0.5,
          max_tokens: 2048
        })
      });
      if (!resp.ok) throw new Error('API错误');
      const data = await resp.json();
      const fullReply = data.choices[0].message.content;

      // Parse golden egg from response
      let eggTitle = p.teachingTopic;
      let eggContent = '';
      const eggMatch = fullReply.match(/<golden_egg>\s*\n?\s*标题[：:]\s*(.+?)\s*\n\s*内容[：:]\s*([\s\S]*?)\s*<\/golden_egg>/i);
      if (eggMatch) {
        eggTitle = eggMatch[1].trim();
        eggContent = eggMatch[2].trim();
      } else {
        // Fallback: use everything after the first paragraph as egg content
        const parts = fullReply.split('\n\n');
        eggContent = parts.slice(1).join('\n\n').replace(/<golden_egg>|<\/golden_egg>/g, '').trim();
        if (!eggContent) eggContent = fullReply.substring(0, 200);
      }

      // Add golden egg
      const egg = {
        id: 'egg_' + Date.now(),
        date: new Date().toISOString(),
        topic: eggTitle,
        content: eggContent,
        editedContent: ''
      };
      p.goldenEggs.push(egg);

      // Record session
      p.sessions.push({
        date: new Date().toISOString(),
        topic: p.teachingTopic,
        messageCount: p.teachingMessages.length,
        eggId: egg.id
      });

      // Save learned words from this session (word-level granularity)
      const today = formatDate(new Date());
      const learnedWordsList = this.parseLearnedWords(fullReply, eggTitle);
      if (learnedWordsList.length === 0) {
        // Fallback: use egg title as a single word entry
        learnedWordsList.push({ word: eggTitle, definition: eggContent.substring(0, 100) });
      }
      const newWords = [], updatedWords = [];
      for (const lw of learnedWordsList) {
        const existingIdx = p.learnedWords.findIndex(w => w.word === lw.word);
        const entry = { word: lw.word, definition: lw.definition, learnedAt: today, eggId: egg.id };
        if (existingIdx >= 0) {
          p.learnedWords[existingIdx] = entry;
          updatedWords.push(lw.word);
        } else {
          p.learnedWords.push(entry);
          newWords.push(lw.word);
        }
      }

      // Check for evolution
      this.checkPetEvolution();

      // Show result
      this.petAddSystemMessage('📋 ' + fullReply.replace(/<golden_egg>[\s\S]*?<\/golden_egg>/g, '').trim());
      this.petAddSystemMessage(`🥚 **知识金蛋 +1**：「${eggTitle}」已收入囊中！`);
      if (newWords.length > 0) {
        this.petAddSystemMessage(`🎉 ${p.name} 学会了新词：${newWords.map(w => '「' + w + '」').join('、')}`);
      }
      if (updatedWords.length > 0) {
        this.petAddSystemMessage(`📝 ${p.name} 更新了对：${updatedWords.map(w => '「' + w + '」').join('、')} 的理解`);
      }
      if (newWords.length === 0 && updatedWords.length === 0) {
        this.petAddSystemMessage('💬 这堂课没有新学会的词汇——也许主人可以试试把一个概念讲得更透？');
      }

      // Save
      LS.set('pet_data', p);
      // 归档萌宠对话
      this.savePetConversationArchive();
    } catch(e) {
      this.petAddSystemMessage('❌ 生成金蛋失败：' + e.message);
    }

    this.petShowTyping(false);
    p.isTeaching = false;
    this.petAddSystemMessage('📂 萌宠对话已存档（可在"会话归档"中查看）');
    p.teachingMessages = [];
    p.teachingTopic = '';
    $('#pet-teaching-chat').style.display = 'none';
    $('#pet-idle-panels').style.display = '';
    $('#btn-start-teaching').style.display = '';
    this.renderGoldenEggs();
    this.renderGrowthTimeline();
    this.updatePetBadge();
  },

  // --- 金蛋管理 ---
  renderGoldenEggs() {
    const grid = $('#pet-eggs-grid');
    const eggs = this.state.pet.goldenEggs;
    if (!eggs.length) {
      grid.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;padding:12px">还没有金蛋。教萌宠一节课来获得第一颗金蛋吧！</div>';
      return;
    }
    grid.innerHTML = eggs.slice().reverse().map(e => `
      <div class="pet-egg-card" onclick="App.viewGoldenEgg('${e.id}')">
        <div class="egg-icon">🥚</div>
        <div class="egg-topic">${this.escapeHtml(e.topic)}</div>
        <div class="egg-date">${formatDate(e.date)}</div>
      </div>`).join('');
  },

  viewGoldenEgg(eggId) {
    const egg = this.state.pet.goldenEggs.find(e => e.id === eggId);
    if (!egg) return;
    const content = egg.editedContent || egg.content;
    $('#pet-eggs-grid').innerHTML = `
      <div class="pet-egg-detail" style="width:100%">
        <button class="btn btn-sm btn-outline" onclick="App.renderGoldenEggs()" style="margin-bottom:12px">← 返回金蛋列表</button>
        <h3>🥚 ${this.escapeHtml(egg.topic)}</h3>
        <div class="pet-egg-detail-content">${this.renderContent(content)}</div>
        <div class="pet-egg-detail-actions">
          <button class="btn btn-sm btn-outline" onclick="App.editGoldenEgg('${egg.id}')">✏️ 编辑</button>
          <button class="btn btn-sm btn-outline" onclick="App.deleteGoldenEgg('${egg.id}')">🗑️ 删除</button>
        </div>
      </div>`;
  },

  editGoldenEgg(eggId) {
    const egg = this.state.pet.goldenEggs.find(e => e.id === eggId);
    if (!egg) return;
    const current = egg.editedContent || egg.content;
    const newContent = prompt('编辑知识金蛋内容：', current);
    if (newContent !== null && newContent.trim()) {
      egg.editedContent = newContent.trim();
      LS.set('pet_data', this.state.pet);
      this.viewGoldenEgg(eggId);
    }
  },

  deleteGoldenEgg(eggId) {
    if (!confirm('确定要删除这颗金蛋吗？')) return;
    this.state.pet.goldenEggs = this.state.pet.goldenEggs.filter(e => e.id !== eggId);
    LS.set('pet_data', this.state.pet);
    this.renderGoldenEggs();
    this.renderGrowthTimeline();
  },

  // --- 新词提取 ---
  parseLearnedWords(fullReply, fallbackWord) {
    const words = [];
    const wordsMatch = fullReply.match(/<learned_words>\s*\n?([\s\S]*?)\s*<\/learned_words>/i);
    if (wordsMatch) {
      const lines = wordsMatch[1].trim().split('\n');
      for (const line of lines) {
        const m = line.match(/^(.+?)[：:]\s*(.+)/);
        if (m) {
          words.push({ word: m[1].trim(), definition: m[2].trim().substring(0, 120) });
        }
      }
    }
    return words; // may be empty, caller handles fallback
  },

  // --- 成长系统 ---
  checkPetEvolution() {
    const p = this.state.pet;
    const currentStage = this.getPetStage();
    const nextStage = this.getPetNextStage();
    if (!nextStage) return; // Already max

    if (p.goldenEggs.length >= nextStage.eggsNeeded) {
      p.evolutionStage = nextStage.stage;
      p.level = nextStage.stage + 1;
      const reflection = `主人教我越来越多，我感觉自己变厉害了！从${currentStage.icon}${currentStage.name}成长为${nextStage.icon}${nextStage.name}了。谢谢主人的耐心教导～`;
      p.growthReflections.push({
        stage: nextStage.stage,
        date: new Date().toISOString(),
        content: reflection
      });
      this.petAddSystemMessage(`🌟 **${p.name} 成长了！** ${reflection}`);
      LS.set('pet_data', p);
    }
  },

  renderGrowthTimeline() {
    const timeline = $('#pet-growth-timeline');
    const p = this.state.pet;
    let html = '';
    PET_EVOLUTION_STAGES.forEach(s => {
      const reached = p.evolutionStage >= s.stage;
      const reflection = p.growthReflections.find(r => r.stage === s.stage);
      html += `<div class="pet-milestone${reached ? ' reached' : ''}">
        <div class="milestone-icon">${reached ? s.icon : '🔒'}</div>
        <div class="milestone-info">
          <div class="milestone-title">${s.name}${s.stage === 0 ? '' : ' · 🥚×' + s.eggsNeeded}</div>
          <div class="milestone-desc">${s.desc}</div>
          ${reflection ? `<div class="milestone-reflection">"${this.escapeHtml(reflection.content)}"</div>` : ''}
        </div>
      </div>`;
    });
    timeline.innerHTML = html;
  },

  // --- 萌宠 UI 辅助 ---
  petAddMessage(role, content) {
    const container = $('#pet-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'message ' + (role === 'user' ? 'user' : role === 'system' ? 'system' : 'ai');
    if (role === 'system') {
      div.innerHTML = `<div class="message-bubble">${this.escapeHtml(content)}</div>`;
    } else {
      const p = this.state.pet;
      const appearance = this.getPetAppearance();
      const avatarEmoji = role === 'user' ? '🧑‍🏫' : appearance.emoji;
      const avatarBg = role === 'user' ? '#a08060' : '#e89060';
      const displayName = role === 'user' ? '你' : p.name;
      const now = formatDate(new Date());
      div.innerHTML = `
        <div class="message-avatar" style="background:${avatarBg}">${avatarEmoji}</div>
        <div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:2px">${displayName}</div>
          <div class="message-bubble">${this.renderContent(content)}</div>
          <div class="message-time">${now}</div>
        </div>`;
    }
    container.appendChild(div);
    this.petScrollToBottom();
    if (window.renderMathInElement) {
      renderMathInElement(div, {
        delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}],
        throwOnError: false
      });
    }
  },

  petAddSystemMessage(text) { this.petAddMessage('system', text); },
  petShowTyping(show) {
    const el = $('#pet-typing');
    if (el) el.style.display = show ? 'flex' : 'none';
    this.petScrollToBottom();
  },
  petScrollToBottom() {
    const el = $('#pet-messages');
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  },

  updatePetBadge() {
    const badge = $('#pet-badge');
    if (!badge) return;
    const p = this.state.pet;
    if (!p.unlocked && this.getCompletedLessonsCount() >= PET_UNLOCK_LESSONS) {
      badge.style.display = '';
      badge.textContent = '●';
    } else if (p.unlocked && p.isTeaching) {
      badge.style.display = '';
      badge.textContent = '💬';
    } else {
      badge.style.display = 'none';
    }
  },

  // ========== 教团群聊 ==========
  renderWechatView() {
    const container = $('#wechat-messages');
    const allMsgs = [...this.state.wechatArchive, ...this.state.wechatUnread];
    const seen = new Set();
    const unique = [];
    for (const m of allMsgs) {
      const key = m.date + m.sender + m.content.substring(0, 30);
      if (!seen.has(key)) { seen.add(key); unique.push(m); }
    }
    unique.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!unique.length) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px">暂无群聊消息。<br>课后会自动生成导师们的讨论。</div>';
      return;
    }

    const colors = {};
    this.state.teachers.forEach(t => {
      colors[t.namePure] = t.avatarColor;
      colors[t.name] = t.avatarColor;
      const short = t.name.replace(/[（(].*[）)]/, '').trim();
      if (short !== t.name) colors[short] = t.avatarColor;
    });

    container.innerHTML = unique.map((m, idx) => {
      const color = colors[m.sender] || '#667eea';
      m._idx = idx; // 临时索引用于删除
      return `<div class="wechat-msg">
        <div class="wechat-avatar" style="background:${color}">${m.sender.charAt(0)}</div>
        <div class="wechat-body">
          <div class="wechat-sender">${m.sender}</div>
          <div class="wechat-bubble">${this.escapeHtml(m.content)}</div>
          <div class="wechat-time">${formatDate(m.date)}</div>
          <button class="wechat-delete-btn" onclick="App.deleteWechatMsg(${idx})" title="删除此消息">🗑️</button>
        </div>
      </div>`;
    }).join('');
    container.innerHTML += '<div class="wechat-notice">— 群聊消息由导师们在课后自动生成 —</div>';
  },

  // ========== 群聊消息删除 ==========
  deleteWechatMsg(idx) {
    // 按渲染顺序定位消息并删除
    const allMsgs = [...this.state.wechatArchive, ...this.state.wechatUnread];
    const seen = new Set();
    const unique = [];
    for (const m of allMsgs) {
      const key = m.date + m.sender + m.content.substring(0, 30);
      if (!seen.has(key)) { seen.add(key); unique.push(m); }
    }
    unique.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (idx < 0 || idx >= unique.length) return;
    const target = unique[idx];
    // 从 archive 或 unread 中删除
    const aIdx = this.state.wechatArchive.findIndex(m =>
      m.date === target.date && m.sender === target.sender && m.content === target.content
    );
    if (aIdx >= 0) {
      this.state.wechatArchive.splice(aIdx, 1);
      LS.set('wechat_archive', this.state.wechatArchive);
    } else {
      const uIdx = this.state.wechatUnread.findIndex(m =>
        m.date === target.date && m.sender === target.sender && m.content === target.content
      );
      if (uIdx >= 0) {
        this.state.wechatUnread.splice(uIdx, 1);
        LS.set('wechat_unread', this.state.wechatUnread);
      }
    }
    this.renderWechatView();
  },

  // 控制台批量清空群聊：__clearWechat()
  _debugClearWechat() {
    if (!confirm('确定清空全部群聊消息（含归档）？此操作不可恢复。')) return;
    this.state.wechatUnread = [];
    this.state.wechatArchive = [];
    LS.set('wechat_unread', []);
    LS.set('wechat_archive', []);
    this.renderWechatView();
    this.updateWechatBadge();
    return '✅ 群聊已清空';
  },

  // ========== 探索日志 ==========
  addDiary() {
    const input = $('#diary-input');
    const text = input.value.trim();
    if (!text) return;
    const diary = this.state.diary || [];
    diary.unshift({ date: new Date().toISOString(), content: text, auto: false });
    this.state.diary = diary;
    LS.set('diary', diary);
    input.value = '';
    this.renderDiaryView();
  },

  deleteDiary(idx) {
    if (!confirm('确定删除这条探索日志吗？')) return;
    const diary = this.state.diary || [];
    diary.splice(idx, 1);
    this.state.diary = diary;
    LS.set('diary', diary);
    this.renderDiaryView();
  },

  renderDiaryView() {
    const container = $('#diary-list');
    const diary = this.state.diary || [];
    if (!diary.length) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px">暂无探索日志。<br>课后会自动生成。也可以自己写。</div>';
      return;
    }
    container.innerHTML = diary.map((d, idx) => `
      <div class="diary-entry">
        <div class="diary-entry-header">
          <span class="diary-entry-date">${formatDateShort(d.date)}</span>
          <span class="diary-entry-label">${d.auto ? '🤖 自动生成' : '✍️ 手动记录'}${d.teacher ? ' · ' + d.teacher : ''}</span>
          <button class="diary-delete-btn" onclick="App.deleteDiary(${idx})" title="删除此日志">🗑️</button>
        </div>
        <div class="diary-entry-body">${this.escapeHtml(d.content)}</div>
      </div>
    `).join('');
  },

  // ========== 工具 ==========
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // ========== 划词复习卡片 ==========

  // 初始化 SelectionMenu（只初始化一次）
  _initSelectionMenu() {
    if (this._selectionMenuInited) return;
    this._selectionMenuInited = true;
    const self = this;
    try {
      this._selMenu = new SelectionMenu({
        container: document.getElementById('chat-messages'),
        id: 'sm-review-menu',
        menuHTML: '<a id="sm-gen-card">📌 生成复习卡片</a>',
        minimalSelection: 3,
        handler: function(e) {
          if (e.target.id === 'sm-gen-card') {
            const text = (this.selectedText || '').trim();
            if (text && text.length >= 3) {
              self._generateCardFromSelection(text);
            }
          }
        }
      });
      // 覆盖 insert：菜单跟随鼠标位置
      var origInsert = this._selMenu.insert;
      this._selMenu.insert = function(e) {
        origInsert.call(this, e);
        var mx = (e && e.clientX) ? e.clientX : 0;
        var my = (e && e.clientY) ? e.clientY : 0;
        setTimeout(function() {
          var el = document.getElementById('sm-review-menu');
          if (!el) return;
          var l = Math.min(mx + 10, window.innerWidth - el.offsetWidth - 10);
          var t = Math.min(my + 10, window.innerHeight - el.offsetHeight - 20);
          el.style.left = Math.max(10, l) + 'px';
          el.style.top  = Math.max(10, t) + 'px';
        }, 0);
      };
      console.log('✅ 划词菜单已初始化');
    } catch(e) { console.warn('划词菜单初始化失败:', e.message); }
  },

  // 选中文字 → AI 生成单道选择题 → 存入错题复习
  async _generateCardFromSelection(selectedText) {
    if (!this.state.apiKey) { this.addSystemMessage('⚠️ 请先设置 API Key'); return; }
    const pos = this._getCoursePosition();
    this.addSystemMessage('📌 正在为选中内容生成复习卡片…');
    console.log('📌 _generateCardFromSelection:', selectedText.substring(0, 80));

    const prompt = '你是一位习题设计专家。学生从课堂对话中选中了以下文字，觉得这部分概念还没完全理解。请为这段内容设计**1道选择题**（4个选项，标注正确答案和解析）。\n\n' +
      '=== 学生选中的文字 ===\n' + selectedText + '\n\n' +
      '=== 课程 ===\n' + (this.state.selectedCourse || '') + '\n' +
      '=== 当前章节 ===\n第' + (pos ? pos.chapterNum : '?') + '章 ' + (pos ? pos.num : '?') + ' ' + (pos ? pos.title : '') + '\n\n' +
      '请用 JSON 格式回复（只输出 JSON，不要其他内容）：\n' +
      '{"knowledgePoint":"这段文字涉及的知识点名称","question":"题目正文","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A","explanation":"解析（1-2句话）"}';

    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.state.apiKey },
        body: JSON.stringify({
          model: MODEL_CONFIG.name,
          messages: [
            { role: 'system', content: '你是一个严谨的习题设计专家。请严格按照 JSON 格式输出。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API请求失败 (HTTP ' + resp.status + ')');
      }
      const data = await resp.json();
      const resultText = data.choices[0].message.content;
      const m = resultText.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('API返回中未找到JSON');
      const parsed = JSON.parse(m[0]);

      const card = {
        ...parsed,
        date: formatDate(new Date()),
        courseName: this.state.selectedCourse,
        sourceSection: pos ? pos.num : '',
        sourceType: '划词选中'
      };

      // 存入错题复习池
      this.state.stuckExercises = [...(this.state.stuckExercises || []), card];
      LS.set('stuck_exercises', this.state.stuckExercises);

      console.log('✅ 复习卡片已生成:', parsed.knowledgePoint);
      this.addSystemMessage('✅ 复习卡片已生成：「' + parsed.knowledgePoint + '」（累积 ' + this.state.stuckExercises.length + ' 道，可在斗技场练习）');
      this.renderBattleSidebar();
    } catch(e) {
      console.error('❌ 生成复习卡片失败:', e.message);
      this.addSystemMessage('⚠️ 生成复习卡片失败：' + e.message);
    }
  },

  // ========== 调试工具 ==========
  // 导出 LS 中某节课的教案到控制台 + 触发下载
  // 用法：App._debugExportPlan('C++ Primer Plus', 1, '1.1')
  //       不带参数导出当前节的教案：__xp()
  _debugExportPlan(courseName, chNum, secNum) {
    courseName = courseName || this.state.selectedCourse;
    if (!courseName) { console.log('❌ 请指定课程名'); return; }
    const pos = chNum && secNum ? { chapterNum: chNum, num: secNum } : this._getCoursePosition();
    if (!pos) { console.log('❌ 无法确定节号'); return; }
    const cacheKey = 'plan_section_' + courseName + '_第' + pos.chapterNum + '章_' + pos.num;
    const cached = LS.get(cacheKey, null);
    if (!cached) {
      console.log('❌ LS 中无此教案缓存: ' + cacheKey);
      console.log('   已缓存的教案 key:');
      Object.keys(localStorage).filter(k => k.startsWith('order_plan_section_')).forEach(k => console.log('   ' + k.replace('order_', '')));
      return;
    }
    const safeTitle = (pos.title || cached.substring(0, 30).replace(/[#\n\r]/g, '')).replace(/[<>:"/\\\\|?*]/g, '_').substring(0, 50);
    const filename = '第' + pos.chapterNum + '章_' + pos.num + '_' + safeTitle + '_教案.md';
    console.log('📋 教案内容 (' + cached.length + ' 字):');
    console.log(cached);
    // 触发下载
    const blob = new Blob([cached], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return '✅ 已下载：' + filename + '（请放入 教案/' + courseName + '/ 目录）\n   文件路径：教案/' + courseName + '/' + filename;
  },

  // 在控制台调用 App._debugDumpState() 查看完整状态
  _debugDumpState() {
    const s = this.state;
    console.group('🔍 视界探索者教团 — 调试状态快照');
    console.log('━━━━━━ 📍 教学位置 ━━━━━━');
    console.log('  当前课程:', s.selectedCourse || '(未选)');
    console.log('  课程位置:', JSON.stringify(s.coursePosition, null, 2));
    const pos = this._getCoursePosition();
    if (pos) {
      console.log('  解析位置:', pos.chapterNum + '章 ' + pos.num + '节 ' + pos.title);
      console.log('  文件名:', pos.filename);
      const flat = this._getFlatSectionsForCourse();
      const idx = flat.findIndex(x => x.filename === pos.filename);
      console.log('  进度:', (idx+1) + '/' + flat.length + ' (' + Math.round((idx+1)/flat.length*100) + '%)');
    }
    console.log('  节包状态:', s._currentBundleSections ? s._currentBundleSections.length + '节' : '无');
    if (s._currentBundleSections) {
      s._currentBundleSections.forEach((sec, i) => {
        console.log('    [' + i + '] 第' + sec.chapterNum + '章 ' + sec.num + ' ' + sec.title + ' (' + (sec.charCount||'?') + '字)');
      });
    }
    console.log('━━━━━━ 🎓 教师 ━━━━━━');
    console.log('  当前教师:', s.selectedTeacherId || '(未选)');
    console.log('  上课中:', s.isClassActive);
    console.log('━━━━━━ 📚 学习进度 ━━━━━━');
    console.log('  已完成课数:', s.progress?.completedLessons || 0);
    console.log('  知识点:', JSON.stringify(s.progress?.courseMastery || {}));
    console.log('  教师记忆:', Object.keys(s.teacherNotes || {}).map(k => k + '(' + s.teacherNotes[k].length + '条)').join(', '));
    console.log('━━━━━━ 🎮 RPG ━━━━━━');
    console.log('  游戏日:', s.gameDay, '时间:', s.gameTime);
    console.log('  知识树:', JSON.stringify(Object.fromEntries(Object.entries(s.trees).map(([k,v])=>[k,v.branchesCount+'枝 '+v.phase]))));
    console.log('  羁绊:', JSON.stringify(s.bonds));
    console.log('  玩家Lv:', s.player?.level, 'XP:', s.player?.xp, '💰:', s.player?.gold);
    console.log('━━━━━━ 📖 教材缓存 ━━━━━━');
    console.log('  已缓存节数:', Object.keys(s.textbookSections).length);
    console.log('  课程列表:', s.textbookCourses.map(c => c.courseName + '(' + c.chapters.reduce((sum,ch)=>sum+ch.sections.length,0) + '节)').join(', '));
    console.log('━━━━━━ 💬 对话 ━━━━━━');
    console.log('  聊天轮次:', s.chatHistory.length);
    console.log('  Token:', JSON.stringify(s.classTokenUsage));
    console.groupEnd();
    return '✅ 调试快照已输出到控制台。使用 App._debugPrompt() 查看当前系统提示词构成。';
  },

  // 查看当前 AI 系统提示词的构成（各部分长度统计）
  async _debugPrompt() {
    console.clear();
    if (!this.state.selectedCourse) {
      console.log('⚠️ 请先在左侧选择一门课程（不需要上课），然后再次输入 __p()');
      console.log('   当前已选课程:', this.state.selectedCourse || '(无)');
      return '❌ 未选课程';
    }
    if (!this.state.selectedTeacherId) {
      console.log('⚠️ 请先在左侧选择一位教师（不需要上课），然后再次输入 __p()');
      console.log('   当前已选教师:', this.state.selectedTeacherId || '(无)');
      return '❌ 未选教师';
    }
    console.log('⏳ 正在构建系统提示词...');
    try {
      const prompt = await this.buildSystemPrompt();
      const sections = prompt.split('===');
      console.group('📋 当前系统提示词构成分析');
      console.log('总长度:', prompt.length, '字符 ≈', Math.round(prompt.length/2), 'tokens');
      console.log('总段数:', sections.length);
      console.log('---');
      // 分析各段
      const parts = [
        { label: '重要指令', marker: '重要指令' },
        { label: '道具效果', marker: '已激活道具效果' },
        { label: '章概括/教案', marker: '本章教学背景' },
        { label: '教材内容', marker: '当前章节教材内容' },
        { label: '教学深度约束', marker: '教学深度约束' },
        { label: '苏格拉底规则', marker: '苏格拉底教学法核心规则' },
        { label: '系统操作细节', marker: '系统操作细节' },
        { label: '导师人设+记忆', marker: '当前导师人设' },
        { label: '学习者档案', marker: '学习者档案' },
        { label: '世界观', marker: '世界观' },
      ];
      parts.forEach(p => {
        const idx = prompt.indexOf(p.marker);
        if (idx >= 0) {
          // 找到该段的结束（下一个 === 或结尾）
          let end = prompt.indexOf('\n===', idx + p.marker.length);
          if (end === -1) end = prompt.length;
          const seg = prompt.substring(idx, end);
          console.log(p.label + ': ' + seg.length + ' 字符 (~' + Math.round(seg.length/2) + ' tokens)');
        } else {
          console.log(p.label + ': ❌ 未找到');
        }
      });
      // 教材内容详细
      const contentIdx = prompt.indexOf('=== 当前章节教材内容 ===');
      if (contentIdx >= 0) {
        const contentStart = contentIdx;
        let contentEnd = prompt.indexOf('\n===', contentStart + 30);
        if (contentEnd === -1) contentEnd = prompt.length;
        const content = prompt.substring(contentStart, contentEnd);
        const secHeaders = content.match(/第\d+章 \d+\.\d+/g);
        if (secHeaders) {
          console.log('---');
          console.log('教材包含节数:', secHeaders.length);
          secHeaders.forEach(h => console.log('  ' + h));
        }
      }
      console.groupEnd();
      console.log('💡 查看完整 prompt：__pf()');
      return '✅ 分析完成。总长度 ' + prompt.length + ' 字符';
    } catch(e) {
      console.error('❌ 构建 prompt 失败:', e);
      return '❌ 失败：' + e.message;
    }
  },

  // 查看完整系统提示词文本
  async _debugPromptFull() {
    try {
      const prompt = await this.buildSystemPrompt();
      console.log(prompt);
      console.log('---');
      console.log('总长度:', prompt.length, '字符');
    } catch(e) {
      console.error('构建 prompt 失败:', e);
    }
  },
};

// ========== 调试快捷入口 ==========
// 控制台直接输入以下命令：
//   __d()                    — 完整状态快照
//   __p()                    — 当前 system prompt 构成分析
//   __pf()                   — 完整 system prompt 文本
//   __s                      — App.state 快捷引用
window.__s = App.state;
window.__d = () => { const r = App._debugDumpState(); console.log(r); };
window.__p = () => App._debugPrompt().then(r => { if (r) console.log(r); });
window.__pf = () => App._debugPromptFull().catch(e => console.error(e));
window.__xp = () => { const r = App._debugExportPlan(); if (r) console.log(r); };
window.__stuck = () => { return App._debugStuck(); };
window.__kp = () => { return App._debugKnowledgePoints(); };
window.__clearWechat = () => { return App._debugClearWechat(); };
// 清除所有提示词缓存（改了 .md 文件后运行）
window.__flushPrompts = () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('order_sys_prompt_') || k.startsWith('order_world_setting') || k.startsWith('order_homework_prompt') || k.startsWith('order_feynman_pet_prompt'));
  const count = keys.length;
  keys.forEach(k => localStorage.removeItem(k));
  return '✅ 已清除 ' + count + ' 条缓存。刷新页面即可加载新版。';
};
App._debugStuck = function() {
  console.log('stuckLog:', App.state.stuckLog.length, '条');
  App.state.stuckLog.forEach((s,i) => console.log('  ['+i+']', s.knowledgePoint, '|', s.errorType));
  console.log('flaggedMessages:', App.state.flaggedMessages.length, '条');
  App.state.flaggedMessages.forEach((f,i) => console.log('  ['+i+']', f.snippet));
  console.log('stuckExercises:', App.state.stuckExercises.length, '道');
  App.state.stuckExercises.forEach((e,i) => {
    console.log('  ['+i+']', e.knowledgePoint);
    console.log('    question:', (e.question||'').substring(0,80));
    console.log('    options:', JSON.stringify(e.options));
    console.log('    correctAnswer:', e.correctAnswer);
  });
  // 查看当前战斗题池
  const pool = App.state.combat.questionPool;
  console.log('questionPool:', pool.length, '题');
  pool.forEach((q,i) => {
    console.log('  ['+i+']', q.isStuckExercise?'📝':'', q.monsterName);
    console.log('    options:', JSON.stringify(q.options));
  });
  return 'stuckLog=' + App.state.stuckLog.length + ' stuckExercises=' + App.state.stuckExercises.length + ' pool=' + pool.length;
};
App._debugKnowledgePoints = function() {
  const kp = App.state.lastKnowledgePoints;
  if (!kp) { console.log('暂无知识点评估数据。上完一节课后会自动生成。'); return '暂无数据'; }
  console.group('📊 最近知识点评估 — ' + kp.date + ' ' + kp.section);
  console.log('共 ' + kp.points.length + ' 个知识点：');
  kp.points.forEach((p, i) => {
    const icon = p.status === 'mastered' ? '✅' : p.status === 'weak' ? '⚠️' : '⬜';
    console.log('  ' + icon + ' [' + i + '] ' + p.name + ' (' + p.status + ')');
    if (p.evidence) console.log('      证据: ' + p.evidence.substring(0, 120));
  });
  console.groupEnd();
  return JSON.stringify(kp, null, 2);
};

// ========== 启动 ==========
document.addEventListener('DOMContentLoaded', () => App.init());

// 自动调整 textarea 高度
document.addEventListener('input', (e) => {
  if (e.target.id === 'chat-input') {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }
});
