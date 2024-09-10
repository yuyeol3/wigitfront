// const marked = require('marked');
// const katex = require('katex');

import {marked} from 'marked';
import katex from 'katex';

export const renderer = new marked.Renderer();

function mathsExpression(expr) {
  expr = expr.text;
//   expr = expr.replace(/&?lt;/g, "<");
//   expr = expr.replace(/&?gt;/g, ">");
//   expr = expr.replace(/&?amp;/g, "");
  if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
    expr = expr.substr(2, expr.length - 4);
    return katex.renderToString(expr, { displayMode: true });
  } else if (expr.match(/^\$[\s\S]*\$$/)) {
    expr = expr.substr(1, expr.length - 2);
    return katex.renderToString(expr, { isplayMode: false });
  }
}

const rendererCode = renderer.code;
renderer.code = function(code, lang, escaped) {

  if (!lang) {

    // console.log(code);
    const math = mathsExpression(code.text);
    if (math) {
      return math;
    }
  }

  return rendererCode(code, lang, escaped);
};

const rendererCodespan = renderer.codespan;
renderer.codespan = function(text) {
  const math = mathsExpression(text);

  if (math) {
    return math;
  }

  return rendererCodespan(text);
};

// const md = '`$$c=\sqrt{a^2 + b^2}$$`';

// console.log(marked(md, { renderer: renderer }));