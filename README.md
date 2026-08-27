# Letter Shaper Studio

粒子造字机。单文件 HTML 工具:输入文字,数千个粒子填充字形轮廓,持续颤动呼吸,可在多段文字之间炸开重组,也可以做成 hover 才聚合的交互效果,或者打开摄像头用手去推、去抓。调好之后能导出成 Vanilla JS / React / Vue 组件,或者 PNG / WebM / GIF。

**零依赖,离线可用。** 双击 `index.html` 就能跑,不需要构建、不需要服务器、不联网。界面用的两款开源字体(DM Sans / JetBrains Mono)以 latin 子集 base64 内嵌在文件里,所以断网也是同一个样子 —— 这也是单文件从 ~127KB 涨到 ~240KB 的原因。

## 用法

打开 `index.html`。右侧是参数面板,左侧是画布。

顶部常用区(不随滚动移动):

- **Looks** — 五个成品预设,一键出效果:Confetti / Brickwork / Numerals / Morandi mist / Coarse grain
- **Text** — 最多 40 字符,支持中文整句。单字符时用 `↑` `↓` 循环 A–Z 0–9。字数越多字号自动越小,始终居中在画布内
- **Loop / Hover / Hand** — 三种模式,见下
- **Seed** — 构图的随机种子。同一个 seed 永远得到同一张构图;可以手输回去复现,方向键步进

下面这些可折叠分组:Shape(圆点 / 砖块 / ASCII 字符)· Distribution(数量 / 边缘羽化 / 不透明度)· Life(颤动幅度 / 速度 / 呼吸)· Motion(短语序列与各段时长)· Hand(仅 Hand 模式显示,见下)· Colors(Classic / Morandi 两套预设,每色可改颜色和权重)· Background(六个预设 + 自由取色)。折叠状态会记住。

### 三种模式

- **Loop** — 粒子按 Motion 里的短语序列循环:停留 → 炸开 → 重组成下一段文字。Sequence 一行一个短语
- **Hover** — 粒子散开漂浮在整个画布上,鼠标悬停时飞入聚合成文字,移开再散开。触屏是按住 / 松开
- **Hand** — 用摄像头跟手互动。字保持成形,手是一个力场:**摊开手掌**把附近的粒子推散开,**握拳**把它们吸过来抓在手里、跟着手走,**再摊开**就炸出去、各自弹回字形里

### Hand 模式

点画布上那颗 **Turn on camera**(或 Hand 分组里的同名按钮)授权摄像头。摄像头一亮,画布下方会浮出一张三格图示 —— 摊掌推散 / 握拳抓取 / 松开回落 —— 识别到手就自动退场,下次开摄像头再来一遍。画面只在这个标签页里跑:每帧被画进一张 160 × 120 的临时 canvas 做识别,用完即弃,不上传、不留存。预览框里蓝色的就是当前被认定为手的区域,底部标签显示 `Open palm` / `Fist` / 没找到手。

四个参数:

- **Reach** — 力场半径,画布宽度的比例
- **Force** — 推和抓的强度
- **Return** — 松手后弹回字形的快慢(粒子是一根锚在字形上的阻尼弹簧)
- **Fist sensitivity** — 多"握"才算握拳。手型判定用的是色块的径向分布(手指会把 92 分位半径顶得远高于中位数,拳头不会),这根滑杆挪的就是那条分界线

**Ring** 控制画布上要不要画那个很淡的手部指示圈。**默认关**——它是画进 canvas 的,PNG / WebM 导出会带上它,所以出图默认干净;需要看力场范围时再打开。

识别是纯手写的:肤色阈值(RGB 规则 + YCbCr 窗口)叠一层会衰减的运动累积量,3 × 3 中值滤波去噪,连通域标记之后挑"最大且真的在动"的那块——不然坐在后面一动不动的脸会被当成手。光线均匀、背景干净时最稳;手停住太久会被放掉,晃一下就回来。

摄像头需要安全上下文:`https` 或 `localhost` 一定可以;Chrome / Edge 直接双击本地 `index.html`(`file://`)也行,Safari 不行。

### 快捷键

| 操作 | 键 |
|---|---|
| 播放 / 暂停 | `Space` |
| 撤销 / 重做 | `⌘Z` / `⇧⌘Z` |
| 步进 seed(焦点在 Seed 上) | `↑` `↓` |
| 循环字符(焦点在 Text 上,单字符时) | `↑` `↓` |
| 关闭弹层 | `Esc` |

界面里的 `?` 按钮也能看到这份列表。

## 导出

Export 按钮,两类:

**Code** — 把当前面板的所有参数(含生效的色板和模式)烘焙进自包含代码:

- `Vanilla JS` — 一个 `<canvas>` 加一段 IIFE,直接贴进任何页面
- `React` — 函数组件,`useRef` + `useEffect`,cleanup 里 `cancelAnimationFrame`;`text` / `colors` / `mode` 可用 props 覆盖
- `Vue` — Vue 3 SFC,`<script setup>`,`onMounted` / `onUnmounted`
- `Config JSON` — 纯参数对象,给程序化调用

导出的代码内联的是页面里同一个 `particleTextEngine` 函数(通过 `Function.prototype.toString()` 序列化),所以线上跑的和你在工具里看到的是同一套渲染逻辑。Hand 模式还会一并内联 `handTracker`,并给 canvas 接一个「首次点击开摄像头」的手势(浏览器不点不给流)。

**Media**

- `PNG` — 当前帧,1200 × 1200 原尺寸
- `WebM` — 录一个完整循环(Hover 模式录一段完整手势演示;Hand 模式录 8 秒实时表演,你在镜头前做什么就录到什么)。`captureStream(0)` 加逐帧 `requestFrame()`,一画一帧;编码格式 vp9 → vp8 → 裸 webm 逐级探测,Safari 不支持时按钮禁用
- `GIF` — 480 × 480 / 14fps,内联手写的 GIF89a 编码器(无外部库)。首帧按 RGB555 桶采样取 256 色全局调色板,后续帧走 32768 项最近邻查表;标准 LZW 带位宽增长与字典重置

## 实现要点

- **确定性**:所有结构性随机(粒子属性、mask 采样、散开目标)都来自一个 LCG seeded RNG。`Math.random()` 全文件只出现两处:Reseed 按钮和「加一个随机颜色」按钮
- **实时性**:非结构性参数(颤动 / 呼吸 / 各段时长 / 背景 / 形状)按引用逐帧读取,拖动滑杆即时生效;结构性参数(数量 / 尺寸 / 色板 / seed)在松手时重建粒子池
- **性能**:2920 粒子三种形态均稳定 60fps。零 per-particle `save/restore`;ASCII 形态用 glyph × color 预渲染 sprite 加单次 `setTransform` + `drawImage`,替代每帧几千次 font 赋值和 `fillText`;圆点直接 `arc`(旋转对圆是视觉空操作);砖块纯轴对齐 `fillRect`;`globalAlpha` 只在变化时写入
- **手部识别**:全部自己写,不引外部库、不联网、不留帧。摄像头帧降到 160 × 120,逐像素肤色判定(RGB 规则 + YCbCr 窗口)配一层会衰减的运动累积量,3 × 3 中值滤波,连通域标记后取「够大且真的在动」的那块,手型由径向分布的 r92 / r50 给出(拳头约 1.35,张开的手约 1.60)。整套跑在 30Hz,渲染仍是满帧
- **可访问性**:正文对比度 ≥ 4.5:1(light / dark 各自验证);`prefers-reduced-motion` 下 UI 过渡压平、hover 模式降级为直接切换;控件键盘可达,焦点环可见;触控目标 ≥ 44px

## 目录

```
index.html    工具本体,单文件
PRODUCT.md    产品定位、设计原则、以及对原 skill 规范的几处授权偏离
_recovery/    2026-08-27 一次写入事故的留档,见其中 README
```

## 出处

设计规范来自 `letter-shape-generator-tool-bycoraldesign`(作者 bycoraldesign,经 RedSkill 分发)。本仓库的实现代码为自行编写。参数默认值、已移除功能清单、以及几处经明确授权的偏离(莫兰迪色板预设、面板改到右侧、更名、Hand 模式)记录在 `PRODUCT.md`。
