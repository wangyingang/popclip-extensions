"use strict";

const { normalizeMixedTypography } = require("./lib/zhMixedTypography");

function normalize(input) {
  popclip.pasteText(
    normalizeMixedTypography(input.text, {
      normalizeCornerQuotes: popclip.options.normalizeCornerQuotes
    })
  );
}

function selfTest() {
  return normalizeMixedTypography("产品“混排规范”很重要,比如RightCapital!");
}

exports.selfTest = selfTest;
exports.actions = [
  {
    title: "规范中英文混排",
    regex: "(?=.*\\p{Script=Han})(?=.*(?:\\p{Script=Latin}|\\d|[０-９]))",
    requirements: ["text", "paste"],
    code: normalize
  }
];
