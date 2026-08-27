# _recovery — 2026-08-27 数据抢救留档

这不是垃圾目录,是一次事故的留档。可以删,但删前先读完。

## 发生了什么

2026-08-26 深夜到 2026-08-27,一个 Fable 子 agent 在改 `../index.html` 时连续两次失败:

1. **第一次(额度中断)**:它正在做单次超大 `Write`(整个 ~100 KB 文件),写到一半被 org 月度额度掐断。磁盘上留下一个 50474 字节的残файл —— CSS 与 HTML 标记完整,但**文件末尾停在一个孤立的 `<script>` 开标签上,全文没有 `</script>`**,整个 JavaScript(约 50 KB)丢失。
2. **第二次(stalled)**:额度恢复后让它自己恢复,600 秒无任何进展,零字节写入。

之后由主会话(Claude)接手重建,改为**分块写入**:先落一个语法完整、可运行的版本,再用 `Edit` 逐块补功能,每块写完立即 `node --check` + 浏览器实测。

## 这里的文件是什么

| 文件 | 是什么 | 还有用吗 |
|---|---|---|
| `particleTextEngine.recovered.js` | 从上一轮验证脚本里救回的**完整粒子引擎源码**(12871 B,`node --check` 通过)。含 mask 自适应采样、seeded RNG、三渲染器、loop + hover 双状态机的 gather/disperse、sprite 缓存、`destroy()` | **已回填进 index.html** 并加了 app 控制钩子(setPaused / getState / takeOver / tick / release / resetLoop)。留作对照正本 |
| `vanilla-export-sample.js` | 事故前那一轮实际生成并通过校验的 vanilla 导出产物样本 | 留作导出模板的结构对照 |
| `index.truncated-markup.html` | 那个 50474 B 残文件的快照 | 只有考古价值 |

**没救回来的**:手写的 GIF89a 编码器(`buildGifPalette` / `lzwFrameBytes` / `gifSubBlocks`)。它只存在于被截断的 index.html 里;临时目录的 `check-gif.js` 只有测试用的 LZW 解码器和提取器,不含编码器本体。已由主会话重写,并用独立解码器做 round-trip 验证(两种场景逐像素零差异,含强制触发 12 位码宽与 4096 字典重置的 256 色噪声帧)。

## 教训(下次让 agent 改大文件时写进任务里)

**不要让 agent 用单次超大 `Write` 交付大文件。** 要求它:先写一个随时语法完整、可运行的最小版本,再用 `Edit` 逐块追加;每块写完就校验。这样任何一次中断都不会让磁盘上的文件失去可运行状态。
