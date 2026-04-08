# PopClip Extensions

我自定义的 PopClip extensions。

## Chinese-English Typography

新增的中英文混排规范化扩展，核心规则实现位于可复用的 library：

- library: `packages/zh-mixed-typography/index.js`
- PopClip adapter: `Chinese-English-Typography.popclipext`

当前覆盖的规则包括：

- 中英文之间加空格
- 中文与数字之间加空格
- 数字与常见英文单位之间加空格
- `%`、`°` 与数字保持紧邻
- 中文语境下优先转为全角标点
- 中文引号优先转为 `「」` / `『』`
- 全角数字转半角数字

PopClip 选项：

- checkbox: 是否将弯引号替换为直角引号，默认开启

## Legacy

`Normalize.popclipext` 保留为旧实现，当前视为 deprecated，不再作为后续演进的主入口。
