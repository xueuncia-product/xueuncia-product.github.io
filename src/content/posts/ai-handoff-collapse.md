---
title: AI 产研协作：从节点提效到交接塌缩
date: 2026-06-27
section: methods
summary: PRD、设计稿、代码本质是跨工种交接的合同。AI 原生不是把交付物做得更精美，而是让交接本身塌缩。
tags: [AI协作, 产研协作, 产品方法]
---

传统产研是一条接力管线：产品出需求，设计出稿，前后端实现，测试验收，再交给运营。PRD、设计稿、代码这些交付物，本质是跨工种交接的“合同”。每一次交接都跨越一道技能边界，边界后面必须站一个不同工种的人。

这篇文章改写自我在 2026 年 6 月 27 日整理的一次关于“AI 与 Agent 时代的产品经理与产研团队形态”的讨论，于 2026 年 10 月 10 日整理为公开版。原稿是我和 AI 反复推演的产物，这里只保留结论和论证，对话原文不放。它是一个讨论框架，不是已经验证过的组织方案。

<figure class="fig">
  <p class="fig-h">AI 原生产研 · 思维推演路线图</p>
  <div class="fig-flow">
    <div class="fig-card" style="flex:1"><small>1 · 起点</small><b>接力管线</b><small>产品 → 设计 → 前后端 → 测试 → 运营；交付物（PRD / 稿 / 代码）= 跨工种“交接合同”</small></div>
    <div class="fig-card" style="flex:1"><small>2 · 第一层认知</small><b>AI 辅助</b><small>高保真稿直出、AI 写 PRD、AI 验收：接力棒还在传，交接没消失，天花板低</small></div>
    <div class="fig-card is-acc" style="flex:1"><small>3 · 判别标准（枢纽）</small><b>精美交付物 = AI 辅助</b><b>消失的交接 = AI 原生</b></div>
  </div>
  <p class="fig-h">4 · AI 原生 · 五个结构变化</p>
  <div class="fig-grid" style="--min:120px">
    <div class="fig-card"><b>管线 → 闭环</b><small>想法 → 原型 → 评测 → 迭代</small></div>
    <div class="fig-card"><b>职能筒仓 → 任务小组</b><small>2-4 人全栈小队</small></div>
    <div class="fig-card"><b>协调中枢切换</b><small>排期 + PRD → 评测集 + 数据闭环</small></div>
    <div class="fig-card"><b>交付物贬值</b><small>可抛弃，退化成提示词</small></div>
    <div class="fig-card"><b>角色融合</b><small>项目管理：管交接 → 管质量门</small></div>
  </div>
  <div class="fig-grid" style="--min:220px">
    <div class="fig-card"><small>5 · 新角色</small><b>产品经理 = 评测负责人</b><small>定义“什么算对”、守质量线、验收复核；写代码由任务小组写、前端评审合入（实现者 → 评审者）</small></div>
    <div class="fig-card"><small>6 · 规格三份拼图</small><b>PRD 拆成三份各自精确</b><small>技术沟通稿（为什么）+ 交互稿（形）+ 用例集（逻辑）；形与逻辑分开，是一次不重不漏的拆分</small></div>
  </div>
  <div class="fig-card"><small>7 · 用例集生成原理</small><b>画面 = f(数据 D，配置 C，看的人 V)</b><small>遍历输入空间，每条只改一个变量，再分正常域与异常域两层，作为不重不漏的标尺</small></div>
  <div class="fig-grid" style="--min:220px">
    <div class="fig-card"><small>8 · 业界印证 · 四条传承</small><ul><li>Specification by Example / BDD</li><li>spec-driven development（Spec Kit · Kiro）</li><li>specs = the new code（Sean Grove）</li><li>eval-driven（Hamel &amp; Shreya）</li></ul></div>
    <div class="fig-card"><small>9 · 边界 · Gojko 三坑</small><ul><li>别让规格文档膨胀</li><li>显式圈定范围、小步迭代，否则 AI 跑飞</li><li>保留人工审核</li></ul></div>
  </div>
  <div class="fig-card is-acc"><small>10 · 落地 · 传统公司怎么试</small><ul><li>选“绿地切片”当沙盒</li><li>用“小组写、原团队评审”替换交接</li><li>“地板和天花板”原则</li></ul></div>
  <figcaption>从“节点提效”到“交接塌缩”的十步推演</figcaption>
</figure>

## 判别标准：交付物更精美，还是交接消失了

我给自己定了一条判别标准：

- 改动让“交付物”更精美，是 AI **辅助**。这是在旧流水线的节点上提效，天花板低。
- 改动让某个“交接”消失，才是 AI **原生**。

用 AI 把高保真稿直出、PRD 共创生成、验收自动化，全都还是在老流水线的节点上提效。接力棒还在传，交接还在发生。真正的 AI 原生，是让交接本身塌缩。

## 五个结构变化

1. **管线变闭环**：从“先写规格再实现”，变成“想法→原型→评测→迭代”几小时一圈，原型即规格。
2. **职能筒仓变任务小组**：从产品组、前端组、后端组横切，变成 2-4 人的全栈小队，端到端负责一个用户结果。
3. **协调中枢切换**：从“排期 + PRD”换成“评测集 + 数据闭环”。
4. **交付物贬值**：PRD 的“合同”属性消失，退化成随时可以重新生成的提示词或规格说明。
5. **角色融合，项目管理变形**：项目管理从“管交接、管排期”，变成“管 AI 不失控、守质量门、做数据闭环治理”。

## 新角色与新协作

**产品经理成为评测负责人（eval owner）**，定义“什么算做对了”：建立评测与用例集，守住质量标准，做验收复核。

写代码这件事也会换一种分工：任务小组在分支上写，前端负责评审合入。和前端的关系，从“交需求让前端实现”换成“小组写、前端评审”。前端从实现者变成评审者，领地没有被抢，变的是交接方式。

## PRD 拆成三份各自精确的东西

PRD 不是简单消失，而是拆成三份：

- **技术沟通稿**：背景、为什么做、架构约束。
- **高保真交互稿**：形，包括布局、视觉、交互，是像素级的真相。
- **用例集**：逻辑，给定输入、期望输出，能直接判对错。

其中“形”和“逻辑”的分开，本身就是一次不重不漏的拆分。

用例集的结构也不是拍脑袋列出来的，可以从一个函数推出来：被测系统的画面 = f(数据 D, 配置 C, 看的人 V)。用例集以这个输入空间为检查基线：

1. 每条用例只改变一个变量，便于定位失败原因。
2. 同时检查正常域与异常域。
3. 逐项检查覆盖与分类，每条只归一个格子，避免遗漏和重叠。

## 业界印证与边界

“用可执行的规格和用例弱化传统 PRD”不是空想，至少有四条有名有姓的传承：

| 传承 | 代表与一句话 |
|---|---|
| Specification by Example / BDD | Gojko Adzic（2011）。验收例子即规格，活文档既是需求又是自动化测试。 |
| spec-driven development | GitHub Spec Kit、AWS Kiro：先写 spec（需求→用户故事→验收标准），再生成代码。 |
| specs = the new code | Sean Grove（OpenAI）：代码只占价值的 10-20%，80-90% 是结构化沟通。 |
| eval-driven | Hamel 与 Shreya：好的 eval 就是活的 PRD，“eval owner”的说法也出自这里。 |

最值钱的是 Gojko 提醒的三个坑：

1. 别让规格文档膨胀。
2. 必须显式圈定范围、小步迭代，否则 AI 会跑飞。
3. 保留人工审核。

所以主流共识不是“消灭 PRD”，而是老式厚 PRD 死掉，规格变薄：为什么做留在文档里，形交给交互稿，逻辑交给可执行的用例。

## 传统团队怎么试

在一家职能齐全的传统公司里，真正的难点不是工具，而是组织本来就是围绕“被 AI 变得不必要的交接”搭起来的。我想到的折中过渡办法有三条：

1. **选一块“绿地切片”当沙盒**：不需要整个新项目，只要项目里一块没有领地主张的切片，比如新建的配置后台，避免变成组织之争。
2. **用“小组写、原团队评审”替换交接**：写代码的人从职能团队挪到任务小组，在分支上写，包括跨团队的仓库；原团队退到评审位，负责合入。
3. **“地板和天花板”原则**：MVP 功能是地板，重构深度是天花板。AI 提效达到预期，就把框架做深；不及预期，先保功能上线。

实验目标是**搞清交接塌缩之后大家的新活法**，不是“证明能省人”。后者是政治自杀，而且学不到新的工作流。

## 全文脉络

<figure class="fig">
  <p class="fig-h">AI 原生产研 · 六个分支</p>
  <div class="fig-grid" style="--min:200px">
    <div class="fig-card is-acc"><b>① 核心命题</b><ul><li>精美交付物 = AI 辅助</li><li>消失的交接 = AI 原生</li></ul></div>
    <div class="fig-card"><b>② 三层重构</b><ul><li>世界观：规格是主产品，代码是有损投影</li><li>组织：职能筒仓 → 任务小组（2-4 人）</li><li>角色：产品经理 → 评测负责人；前端 → 评审者</li><li>方法：PRD → 沟通稿 + 交互稿 + 用例集</li></ul></div>
    <div class="fig-card"><b>③ 用例集原理</b><ul><li>画面 = f(数据，配置，看的人)</li><li>受控变量 + 正常 / 异常域 = 不重不漏</li></ul></div>
    <div class="fig-card"><b>④ 业界印证</b><ul><li>SbE / BDD</li><li>spec-driven（Spec Kit · Kiro）</li><li>specs = new code（Sean Grove）</li><li>eval-driven（Hamel &amp; Shreya）</li></ul></div>
    <div class="fig-card"><b>⑤ 边界 · Gojko 三坑</b><ul><li>别让规格文档膨胀</li><li>显式圈定范围 + 小步迭代</li><li>保留人工审核</li></ul></div>
    <div class="fig-card"><b>⑥ 落地三招</b><ul><li>选“绿地切片”当沙盒</li><li>“小组写、原团队评审”换交接</li><li>“地板和天花板”原则</li></ul></div>
  </div>
  <figcaption>全文思维导图</figcaption>
</figure>

## 参考

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [AWS Kiro Specs](https://kiro.dev/docs/specs/)
- [Sean Grove《The New Code》全文](https://lawwu.github.io/transcripts/8rABwKRsec4.html)
- [Lenny：Why AI evals are the hottest new skill](https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill)
- [Specification by Example（Gojko Adzic）](https://gojko.net/books/specification-by-example/)
- [Gojko：spec-driven 的批评](https://www.linkedin.com/pulse/spec-driven-development-revenge-waterfall-bdd-taken-gojko-adzic-imquf)
- [AI killed the 10-page PRD, but the PRD isn't dead](https://aakashgupta.medium.com/ai-killed-the-10-page-prd-but-the-prd-isnt-dead-8801efe44b36)
