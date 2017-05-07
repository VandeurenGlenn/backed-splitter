'use strict';
import HTMLElement5 from './class5/html-element5';
import * as dom5 from 'dom5';

/**
 * Filter the childNodes (search for link tag), ignores already added imports
 */
const rules = el => {
  const tagName = el.tagName;
  if (tagName && tagName === 'head') {
    return el;
  }
}

export default (source, href, js, css) => {
  let head = dom5.query(new HTMLElement5(source).value, rules);
  if (css) source = source.replace('</head>', `  <link rel="stylesheet" href="${href.replace('.html', '.css')}">
  </head>`);
  source = source.replace('</head>', `  <link rel="import" href="${href}">
  </head>`);
  if (js) source = source.replace('</body>', `  <script src="${href.replace('.html', '.js')}"></script>
  </body>`);
  return source;
}
