# Product

## Register

product

## Users

Yanice(产品设计师)以及她分享作品的观众。使用场景:桌面浏览器里打开单文件工具,调参数生成粒子文字动画,用于 vibecoding 创作、社交分享(小红书)、以及导出代码嵌入其他项目。观众端场景:打开导出的组件,hover 看粒子聚合成文字的效果。

## Product Purpose

粒子造字机(Letter Shape Generator):单文件 HTML 创作工具。输入文字(单字符到整句,含中文),数千个粒子按 seeded RNG 填充字形轮廓,持续颤动呼吸,并可在多段文字间炸开重组。支持循环播放与 hover 显现两种模式,可将当前参数烘焙导出为 Vanilla JS / React / Vue 组件。成功标准:调参即时反馈、60fps、导出代码开箱可用。

## Brand Personality

三个词:精密、克制、灵动。Apple 工具类应用的气质(参照 macOS 系统设置 / Final Cut 检查器面板):界面退后,让 canvas 里的粒子动画成为唯一主角。UI 本身的动效要像系统级控件一样细腻但不抢戏。

## Anti-references

- AI 紫色渐变 / 霓虹发光 / 赛博风(SKILL.md 明确记录:科技感色板被用户否决并回退过两次,不得再引入)
- 花哨的面板装饰、bounce/elastic 缓动
- 破坏 9 色默认色板与 #d6cfc5 画布底色的"审美改良"

## Design Principles

1. **Canvas 是主角,面板是仪器** — 面板 UI 的一切动效服务于操作反馈,绝不与粒子动画争夺注意力
2. **每个参数改动即时可见** — 滑杆拖动时 canvas 实时响应,结构性重建在释放时发生
3. **确定性优先** — 同一 seed 永远同一构图;工具行为可预测、可复现
4. **系统级质感** — 控件的 hover/active/focus 反馈对齐 macOS 原生控件的时序与手感(120-300ms, ease-out)
5. **导出即成品** — 导出代码不是示例,是可直接进生产的组件

## Deviations from SKILL.md (Yanice 明确授权,2026-08-27)

安装在 `02_agent_memory_and_skills/letter-shape-generator-tool-bycoraldesign/SKILL.md` 的规范仍是参数默认值与架构的权威,但以下两条已被 Yanice 本人明确覆盖,后续会话不要"修正"回去:

1. **预设色板可以存在。** SKILL.md 记录「3 套科技感色板与高饱和默认板被明确否决并回退两次,不要再提」。该禁令针对的是 agent 自行发起的审美改良;Yanice 于 2026-08-26 主动要求加入莫兰迪色系。现状:默认仍是 Classic 九色加权板,Morandi 作为可切换预设并存。科技感/霓虹/高饱和方向的禁令依然有效。
2. **参数面板移到右侧。** SKILL.md 写「面板在 LEFT 是刻意偏离右侧惯例,保持不变」。Yanice 于 2026-08-27 要求改到右侧,理由是对齐 Apple 自家工具的检查器惯例(Final Cut Inspector / Keynote 格式面板)并让画布占据视觉主位。

## Accessibility & Inclusion

- 正文对比度 ≥ 4.5:1,双主题各自独立验证
- prefers-reduced-motion:UI 过渡压平;canvas 动画是内容本体且默认暂停,hover 模式降级为直接切换
- 键盘可达:滑杆原生可键控、swatch 为真按钮、focus-visible 焦点环、空格播放/暂停
- 触控目标 ≥ 44px(小控件用扩大热区)
