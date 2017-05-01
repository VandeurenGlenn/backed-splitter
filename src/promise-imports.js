'use strict';
import {parse} from 'parse5';
import * as dom5 from 'dom5';
import path from 'path';
import promiseContent from './promise-content';
import scriptToImport from './script-to-import';
import promisePaths from './promise-paths';
import Link from './class5/link5.js';
import Script from './class5/script5.js';
import HTMLElement5 from './class5/html-element5.js';
import {readFileSync} from 'fs';

let _set = [];
let _js = [];
let verbose = false;

const bundle = {
  html: '',
  js: '',
  css: '',
  imports: [],
  scripts: [],
  importees: {},
  bundleHref: null
}

const exists = (itterator, against) => {
  for (let item of itterator) {
    if (item === against) return true;
  }
  return false;
}

/**
 * Filter the childNodes (search for link tag), ignores already added imports
 */
const rules = el => {
  let target;
  const tagName = el.tagName;
  if (tagName && tagName === 'link' ||
      tagName && tagName === 'script') {
    if (tagName === 'script') {
      target = new Script(el);
    } else {
      target = new Link(el);
    }
    const current = target.href || target.src;
    if (!exists(_set, current)) {
      // don't push null (when current is null, it isn't an import)
      if (current) {
        if (!bundle.bundleHref && target.rel && target.rel === 'import') {
          bundle.bundleHref = current;
        }
        _set.push(current);
        bundle.imports.push(target.outerHTML);
      }
      return target;
    } else if (verbose) {
      console.warn('ignoring duplicate', target.rel ? target.rel : 'script' + ':', current );
    }
  }
}

const collect = source => {
  return new Promise((resolve, reject) => {
    resolve(dom5.queryAll(parse(source), rules) )
  });
}
let calls = 0;
const handleScript = (target, entry) => {
  return new Promise((resolve, reject) => {
    let imports = [];
    let comments = [];
    let script = {};
    if (target.nodeName) {
      script = new Script(target);
      imports = script.innerHTML.match(new RegExp(`import (.*)`, 'g'))
  		comments = script.innerHTML.match(new RegExp(`// import (.*)`,'g'));
    } else {
      imports = target.match(new RegExp(`import (.*)`, 'g'))
  		comments = target.match(new RegExp(`// import (.*)`,'g'));
    }
		if (imports) {
      if (imports.length > 0 && comments && comments.length > 0) {
  			for (let commentedImport of comments) {
  				commentedImport = commentedImport.match(new RegExp(`import (.*)`, 'g'))
  				let index = imports.indexOf(commentedImport[0]);
  				if (index > -1) {
  					imports.splice(index, 1);
  				}
  			}
  		}
  		if (imports.length > 0) {
  			for (let imp of imports) {
  				let hadExt = true;
  				var id = imp.match(new RegExp(/'(.*)/, 'g'))
  				id = id[0].slice(1, id[0].length - 2)
  				// id = id.replace(new RegExp())
  				if (!id.includes('.js')) {
  					id += '.js';
  					hadExt = false;
  				}
          if (!bundle.scripts[id]) {
    				try {
    					let contents = readFileSync(path.join(entry, id.replace('./', '')), 'utf-8')
              handleScript(contents, path.join(entry, path.dirname(id)));
    					// bundle.js += contents;
    					if (!hadExt) {
    						id = id.replace('.js', '');
    					}
              bundle.importees[id] = contents;
    						// bundle.scripts[id] = contents;
    				} catch (e) {
    					console.error(e);
    				}
          }
  			}

  			resolve();
  		}
    }

    if (script && script.innerHTML) {
      bundle.js += script.innerHTML;
      _js.push(target);
      resolve();
    }
  });
}

const removeScripts = (html, scripts) => {
  // html = '<!DOCTYPE html><html><head></head><body>' + html + '</body></html>';
  const doc = new HTMLElement5(parse(html));
  let children;
  for (let script of dom5.queryAll(doc, rules)) {
    children = doc.removeChild(script);
  }

  html = '';

  for (let child of children) {
    if (child.nodeName !== '#text' && child.tagName !== 'link') {
      html += new HTMLElement5(child).outerHTML;
    }
  }
  return html;
}

const constructContent = (items = [], location = null, entry = null) => {
  return new Promise((resolve, reject) => {
    async function run() {
      try {
        for (let item of items) {
          let content;
          let rel = null;
          if (item.attrs.length > 0) {
            const isLink = Boolean(item.tagName === 'link');
            // when handling a script, rel contains the value of the src attr
            rel = item.attrs[0].value;
            const href = item.attrs[1] ? item.attrs[1].value : null;
            // create absolute path
            const source = path.join(location, isLink ? href : rel);
            // get file content
            content = await promiseContent(source);
            const {contents, scripts} = await scriptToImport(content, source);
            content = contents;
            if (scripts) {
              bundle.scripts = scripts;
            }

            if (isLink) {
              const dirname = await promisePaths(source);
              const collection = await collect(content);
              await constructContent(collection, dirname, entry);
            }
          } else {
            await handleScript(item, entry);
          }
          if (rel === 'import') {
            bundle.html += content;
          } else if (rel === 'stylesheet'){
            bundle.css += content;
          }
        }
        resolve(bundle)
      } catch (error) {
        reject(error)
      }
    }
    run()
  });
}

const promiseImports = (content = null, location = null, entry = null) => {
  async function run() {
    try {
      const collection = await collect(content);
      await constructContent(collection, location, entry);
      bundle.html = await removeScripts(bundle.html, _js);
      return bundle;
    } catch (error) {
      throw error
    }
  }
  return run();
}

export default ({content = null, dirname = null, entry = null}, verbose = false) => {
  return promiseImports(content, dirname, path.dirname(entry))
}
