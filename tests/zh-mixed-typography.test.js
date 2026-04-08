const { describe, expect, test } = require("bun:test");
const { normalizeMixedTypography } = require("../packages/zh-mixed-typography");

describe("normalizeMixedTypography", () => {
  test("adds spaces between Han and Latin text", () => {
    expect(normalizeMixedTypography("使用VS Code编辑文档。")).toBe("使用 VS Code 编辑文档。");
  });

  test("adds spaces between Han and digits", () => {
    expect(normalizeMixedTypography("今天有3个人来访。")).toBe("今天有 3 个人来访。");
  });

  test("adds spaces between numbers and units while preserving percent", () => {
    expect(normalizeMixedTypography("手机还有50%电量，传输速度为20Gbps。")).toBe(
      "手机还有 50% 电量，传输速度为 20 Gbps。"
    );
  });

  test("removes stray spaces around Chinese punctuation", () => {
    expect(normalizeMixedTypography("如何对 Emoji 进行本地化 ？")).toBe("如何对 Emoji 进行本地化？");
  });

  test("converts Chinese-context punctuation and quote forms", () => {
    expect(normalizeMixedTypography("产品“混排规范”很重要,比如RightCapital!")).toBe(
      "产品「混排规范」很重要，比如 RightCapital！"
    );
  });

  test("can keep curly quotes when the option is disabled", () => {
    expect(
      normalizeMixedTypography("产品“混排规范”很重要,比如RightCapital!", {
        normalizeCornerQuotes: false
      })
    ).toBe("产品“混排规范”很重要，比如 RightCapital！");
  });

  test("normalizes fullwidth digits and keeps links readable", () => {
    expect(normalizeMixedTypography("请访问https://example.com查看第３版文档!")).toBe(
      "请访问 https://example.com 查看第 3 版文档！"
    );
  });

  test("keeps English sentence punctuation in English context", () => {
    expect(normalizeMixedTypography('He said, "This is fine."')).toBe('He said, "This is fine."');
  });

  test("keeps obvious embedded English sentence punctuation halfwidth", () => {
    expect(normalizeMixedTypography("请看Hello, world! 这是a test.")).toBe("请看 Hello, world! 这是 a test。");
  });
});
