"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


function normalizeText(str) {
  // 规则1：全角中文字符与半角英文字符之间，应有一个半角空格
  str = str.replace(/([\u4e00-\u9fa5])([A-Za-z])/g, '$1 $2');
  str = str.replace(/([A-Za-z])([\u4e00-\u9fa5])/g, '$1 $2');

  // 规则2：全角中文字符与半角阿拉伯数字之间，有没有半角空格都可，所以不处理

  // 规则3：半角的百分号，视同阿拉伯数字，所以不处理

    // 规则4: 英文单位若不翻译，单位前的阿拉伯数字与单位符号之间，应留出一个半角空格
    // 调整规则以确保百分号不受影响
    str = str.replace(/(\d)(?![%])([A-Za-z])/g, '$1 $2');
    str = str.replace(/([A-Za-z])(\d)/g, '$1 $2');

    // 规则5: 半角英文字符和半角阿拉伯数字，与全角标点符号之间不留空格
    // 此处排除半角的百分号
    str = str.replace(/([^%])([，。、！？：；])/g, '$1$2');
    str = str.replace(/([，。、！？：；])([^%])/g, '$1$2');

  // 规则6: 中文语句的标点符号，均应该采取全角符号
  // 规则7: 如果整句为英文，则该句使用英文/半角标点
  // 这两条规则可能需要上下文来确定处理的细节，所以略去，如果需要，也可以添加定制逻辑
  
  return str;
}

function normalize(input) {

  if (popclip.modifiers.shift) {
    // 不知道为何，这里无法判断shift键被按下，代码没问题。
    const text = input.text.concat('\n\n', normalizeText(input.text)).trim();
    popclip.pasteText(text);
  }
  else {
    popclip.pasteText(normalizeText(input.text).trim());
  }
}


exports.actions = [{
  title: "规范处理中英文混排",
  regex: "(?=.*\\p{IsHan})(?=.*[\\p{IsLatin}\\p{IsCommon}&&[^\\p{Punct}]])",
  requirements: ["text", "paste"],
  code: normalize
}];
