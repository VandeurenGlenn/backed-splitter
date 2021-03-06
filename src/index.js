'use strict';
import promiseContent from './promise-content';
import promisePaths from './promise-paths';
import promiseImports from './promise-imports';
import promiseHTML from './promise-html';
import promiseWriteLinks from './promise-write-links';

/**
 * @module backed-splitter
 * by default uses the source as output, so index.html, becomes index.js, index.css & index.html
 *
 * @param {string} entry The file to read
 */
export default ({entry = null, exclude = ['bower_components/**/*', '**/*.css'], include = ''}) => {
  return new Promise((resolve, reject) => {
    if (entry === null) {
      return console.warn('entry::undefined');
    }

    async function run() {
      try {
        const content = await promiseContent(entry);
        const dirname = await promisePaths(entry);
        const {html, js, css, imports, bundleHref, scripts, importees, external} = await promiseImports({content: content, entry: entry, location: dirname, exclude: exclude, include: include});

        let index = await promiseHTML(content, imports);
        let app = await promiseHTML(html, imports);

        index = await promiseWriteLinks(index, bundleHref, Boolean(js), Boolean(css));

        // scripts contains the splitted script files
        resolve({app: app, index: index, js: js, css: css, scripts: scripts, imports: importees, bundleHref: bundleHref, external: external});
      } catch (error) {
        throw console.error(error);
      }
    }

    run();
  });
};
