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
      return f.map((s2, j) => (j === i ? '📍【当前】' : '  ') + '第' + s2.chapterNum + '章 ' + s2.num + ' ' + s2.title + (j < i ? ' ✅' : '').trim()).join('\n');
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
      (teacher.personaBrief || teacher.fullMd || '通用导师') +
      (teacher.exampleDialogue ? '\n\n=== 角色对话示例 ===\n<example_dialogue>\n' + teacher.exampleDialogue + '\n</example_dialogue>' : '') +
      memorySection + '\n\n' +
      '=== 学习者档案 ===\n' +
      this._buildLearnerProfile(learnerKnowledgeText) + '\n\n' +
      worldSetting;
