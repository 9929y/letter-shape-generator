# 合并决定 —— 这对 letter-shape-generator 意味着什么

> 完整决定记录在 `9929y/cream-studio` 的 `UNIFICATION.md`。这里只写本仓库的部分。
> 2026-08-30，读自 `letter-shape-generator@7bf5636`。

## 结论：本工具不是一个独立的生成器，它是 cream 换了一个 sampler

四个工具切成 **3 + 1**。Glass 独立；meshy 成为 Field 层；
**cream-studio 和本仓库合并成一个 Marks 引擎**（Phase 1，先于其它任何合并发生）。

两边是同一条四段管线，只是切口位置不同——**而本仓库的切口是对的那一个：**

| 阶段 | 本仓库 | cream |
|---|---|---|
| **pool** | `shapes[]`（index.html:1183）：color / size / opacity / trembleFreq / tremblePhase / breathPhase / glyph / bricks。**完全不依赖文字。** | 混在 `build()` 里，决定位置的同时决定颜色和大小 |
| **distribution** | `assignTargets(text)`（index.html:1218）：采样字形 mask，往已存在的 mark 上写 `toX/toY` | 七个 mode，各返回一个点列表 |
| **place(t)** | tremble / breathe | `place()`，同样的事 |
| **draw** | `dot` / `brick` / `ascii` —— **是个控件** | 形状焊死在 mode 里 |

把 pool 和 distribution 分开，是本工具能在多段文字之间炸开重组的原因。
合并采用**本仓库的四段切法**，把 cream 的七个分布作为 sampler 接进去，字形 mask 是第八个。

## 合并后本工具得到什么

1. **炸开重组不再只在文字之间。** morph 变成任意两个分布之间的事：
   `grid → glyph`、`rings → glyph`、`flow → grid`。sampler 可插拔之后这是免费的。
2. **mark 形状和分布变成两个独立的轴。** 字形可以用圆环画，点阵可以用 ASCII 画。
3. **SVG 导出。** cream 的 `toSVG()` 就是遍历点列表发几何，它不关心点从哪来。
   本工具现在只有 PNG / WebM / GIF。
4. **麦克风。** cream 的三频段（bass → size / mid → speed / hi → jitter）驱动的是
   逐帧参数不是布局，所以它挂在 `place(t)` 上，对字形一样生效。
5. **一条后期链。** meshy 那 22 个字段的 Effects（grain / vignette / 色差 / posterize …）。
   本工具和 cream 现在都没有。
6. **一个真的画板。** `⑥ Frame` 取代现在写死的 1200×1200。
7. **MP4，以及更好的 GIF。** glass-studio 的 `lib/mp4.ts` 是 WebCodecs `VideoEncoder`
   加手写经典布局 MP4 muxer（Premiere / Final Cut 直接导入），本工具现在只有 WebM。
   它的 `lib/gif.ts` 用中位切分调色板，比本工具的 RGB555 桶采样好一档——合并时留它那份，
   本工具这份手写 GIF89a 的价值在于它证明了这条路走得通。

## 本工具带过去什么

**代码导出。** 用 `Function.prototype.toString()` 把活引擎烤进 Vanilla / React / Vue，
所以线上跑的和工具里看到的是同一套渲染逻辑。cream 没有这个，meshy 和 glass 也没有。
合并后推广到所有分布。

## 不要「修正」回去的东西

- **不要改 SKILL.md**（`letter-shape-generator-tool-bycoraldesign`）。它仍是参数默认值的权威。
  已授权的两处偏离（莫兰迪色板、面板改到右侧）记在 `PRODUCT.md`。
- **不要引入科技感 / 霓虹 / 高饱和色板。** SKILL.md 记录这个方向被明确否决并回退过两次，
  禁令仍然有效。
- **确定性。** 所有结构性随机来自一个 LCG seeded RNG；`Math.random()` 全文件只允许两处。
  合并后 seed 升到文档级，这条不变。
- **画布上没有东西可拖。** 本工具和 cream、glass 站同一边。只有 Field 层有手柄。
