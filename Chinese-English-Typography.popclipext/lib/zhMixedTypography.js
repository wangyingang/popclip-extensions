"use strict";

const HAN_RE = /\p{Script=Han}/u;
const LATIN = "\\p{Script=Latin}";
const HAN = "\\p{Script=Han}";
const CHINESE_CONTEXT_RE = /[\p{Script=Han}「」『』（）【】《》]/u;

const ASCII_TO_FULLWIDTH = {
  ",": "，",
  ".": "。",
  "?": "？",
  "!": "！",
  ":": "：",
  ";": "；",
  "(": "（",
  ")": "）"
};

const DEFAULT_UNIT_SUFFIXES = [
  "Gbps",
  "Mbps",
  "Kbps",
  "Tbps",
  "bps",
  "GHz",
  "MHz",
  "kHz",
  "Hz",
  "TiB",
  "GiB",
  "MiB",
  "KiB",
  "TB",
  "GB",
  "MB",
  "KB",
  "kg",
  "mg",
  "km",
  "cm",
  "mm",
  "ms",
  "min",
  "fps",
  "dpi",
  "ppm",
  "ppb",
  "mL",
  "px",
  "TB/s",
  "GB/s",
  "MB/s",
  "KB/s",
  "W",
  "kW",
  "MW",
  "L",
  "h",
  "d",
  "g",
  "m",
  "s"
];

const FULLWIDTH_DIGIT_OFFSET = "０".charCodeAt(0) - "0".charCodeAt(0);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toHalfwidthNumberForms(text) {
  return text.replace(/[０-９％]/g, (char) => {
    if (char === "％") {
      return "%";
    }
    return String.fromCharCode(char.charCodeAt(0) - FULLWIDTH_DIGIT_OFFSET);
  });
}

function getPreviousVisibleChar(text, startIndex) {
  for (let index = startIndex; index >= 0; index -= 1) {
    const char = text[index];
    if (char !== " " && char !== "\t") {
      return char;
    }
  }
  return "";
}

function getNextVisibleChar(text, startIndex) {
  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char !== " " && char !== "\t") {
      return char;
    }
  }
  return "";
}

function getAsciiSentenceSegmentBefore(text, endIndex) {
  let startIndex = endIndex - 1;
  while (startIndex >= 0 && /[A-Za-z0-9 "'(),:;/-]/.test(text[startIndex])) {
    startIndex -= 1;
  }
  return text.slice(startIndex + 1, endIndex).trim();
}

function looksLikeStandaloneEnglishSentence(segment) {
  if (!segment || !/[A-Za-z]/.test(segment) || HAN_RE.test(segment)) {
    return false;
  }

  if (/[,:;]/.test(segment)) {
    return true;
  }

  const lowercaseWords = segment.match(/\b[a-z]{2,}\b/g);
  return Boolean(lowercaseWords && lowercaseWords.length >= 2);
}

function shouldConvertAsciiPunctuation(text, index, char) {
  const previousChar = getPreviousVisibleChar(text, index - 1);
  const nextChar = getNextVisibleChar(text, index + 1);

  if (!previousChar && !nextChar) {
    return false;
  }

  if ((char === "." || char === "," || char === ":") && /\d/.test(previousChar) && /\d/.test(nextChar)) {
    return false;
  }

  if ((char === "." || char === "!" || char === "?") && /[A-Za-z]/.test(previousChar)) {
    const englishSegment = getAsciiSentenceSegmentBefore(text, index);
    if (looksLikeStandaloneEnglishSentence(englishSegment)) {
      return false;
    }
  }

  if (CHINESE_CONTEXT_RE.test(previousChar) || CHINESE_CONTEXT_RE.test(nextChar)) {
    return true;
  }

  if ((char === "." || char === "!" || char === "?") && !nextChar) {
    const clauseStart = Math.max(
      text.lastIndexOf("\n", index - 1),
      text.lastIndexOf("。", index - 1),
      text.lastIndexOf("！", index - 1),
      text.lastIndexOf("？", index - 1),
      text.lastIndexOf(".", index - 1),
      text.lastIndexOf("!", index - 1),
      text.lastIndexOf("?", index - 1)
    );
    const clauseText = text.slice(clauseStart + 1, index);
    return HAN_RE.test(clauseText) && !/["']/.test(clauseText);
  }

  return false;
}

function convertAsciiPunctuationInChineseContext(text) {
  let output = "";

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (ASCII_TO_FULLWIDTH[char] && shouldConvertAsciiPunctuation(text, index, char)) {
      output += ASCII_TO_FULLWIDTH[char];
      continue;
    }
    output += char;
  }

  return output;
}

function normalizeChineseQuotes(text) {
  return text
    .replace(/‘([^‘’\n]*\p{Script=Han}[^‘’\n]*)’/gu, "『$1』")
    .replace(/“([^“”\n]*\p{Script=Han}[^“”\n]*)”/gu, "「$1」")
    .replace(/"([^"\n]*\p{Script=Han}[^"\n]*)"/gu, "「$1」");
}

function normalizeSpacing(text, options) {
  const unitSuffixes = [...new Set(options.unitSuffixes || DEFAULT_UNIT_SUFFIXES)].sort(
    (left, right) => right.length - left.length
  );
  const unitPattern = unitSuffixes.map(escapeRegex).join("|");

  text = text.replace(new RegExp(`(${HAN})[ \\t]*(${LATIN})`, "gu"), "$1 $2");
  text = text.replace(new RegExp(`(${LATIN})[ \\t]*(${HAN})`, "gu"), "$1 $2");
  text = text.replace(new RegExp(`(${HAN})[ \\t]*([0-9])`, "gu"), "$1 $2");
  text = text.replace(new RegExp(`([0-9])[ \\t]*(${HAN})`, "gu"), "$1 $2");
  text = text.replace(new RegExp(`([0-9]+(?:\\.[0-9]+)?[%°])[ \\t]*(${HAN})`, "gu"), "$1 $2");

  if (unitPattern) {
    text = text.replace(
      new RegExp(
        `([0-9]+(?:\\.[0-9]+)?)[ \\t]*(${unitPattern})(?=$|[ \\t]|[${HAN}，。！？：；、）】》」』,.;:!?])`,
        "gu"
      ),
      "$1 $2"
    );
  }

  return text;
}

function removeSpacesAroundChinesePunctuation(text) {
  return text
    .replace(/[ \t]*([，。！？：；、）】》」』])/gu, "$1")
    .replace(/([（【《「『])[ \t]*/gu, "$1")
    .replace(/[ \t]*([，。！？：；、])/gu, "$1")
    .replace(/([，。！？：；、])[ \t]*/gu, "$1");
}

function collapseRepeatedPunctuation(text) {
  return text.replace(/([，。！？：；、])\1+/gu, "$1");
}

function normalizeMixedTypography(text, options = {}) {
  let output = String(text ?? "");
  const normalizeCornerQuotes = options.normalizeCornerQuotes !== false;

  output = toHalfwidthNumberForms(output);
  if (normalizeCornerQuotes) {
    output = normalizeChineseQuotes(output);
  }
  output = normalizeSpacing(output, options);
  output = convertAsciiPunctuationInChineseContext(output);
  output = removeSpacesAroundChinesePunctuation(output);
  output = collapseRepeatedPunctuation(output);
  output = output.replace(/[ \t]{2,}/g, " ");

  return output.trim();
}

function selfTest() {
  return normalizeMixedTypography("手机还有50%电量，传输速度为20Gbps。");
}

module.exports = {
  DEFAULT_UNIT_SUFFIXES,
  normalizeMixedTypography,
  selfTest
};
