'use strict';
import HTMLElement5 from './class5/html-element5';
import * as dom5 from 'dom5';
import {parse} from 'parse5';
import path from 'path';
// import promisWrite from './promise-write';
import utils from './../node_modules/backed-utils/dist/utils-es.js';

let calls = 0;
let scripts = [];
const queryScript = el => {
  const tagName = el.tagName;
  if (tagName && tagName === 'script') {
    el = new HTMLElement5(el);
    if (!el.hasAttribute('src')) return el;
  }
}

export default (content, location) => {
  return new Promise((resolve, reject) => {
    async function run() {
      try {
        const doc = new HTMLElement5(parse(content));
        const script = dom5.query(doc, queryScript);
        const file = {
          name: utils.toJsProp(path.basename(location, '.html')),
          path: location.replace('.html', '.js'),
          innerHTML: ''
        }

        if (content && script && file.path) {
          calls += 1;
          for (let child of script.childNodes) {
            if (child.value) {
              file.innerHTML += child.value;
            } else if (child && child.childNodes.length > 0) {
              file.innerHTML = script.getInnerHTML(child.childNodes, innerHTML);
            }
          }
          file.path = file.path.replace(new RegExp(/\\/, 'g'), '/')
          scripts.push({path: file.path, contents: file.innerHTML});
          // TODO: create cli for writing rsults
          // await promisWrite(file.path, file.innerHTML);
          if (calls !== 1) {
            doc.removeChild(script)
            doc.appendChild({nodeName: 'script', tagName: 'script', value: `import ${file.name} from '${file.path}';\n  `})
          }
          content = doc.innerHTML;
        }

        resolve({contents: content, scripts: scripts});
      } catch (error) {
        reject(error);
      }
    }
    run();
  });
}
