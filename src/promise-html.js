'use strict';
export default (content, imports) => {
  return new Promise((resolve, reject) => {
    for (let item of imports) {
      content = content.replace(new RegExp(`(.*)${item}(.*)\r?\n|\r`, 'g'), '');
    }
    resolve(content);
  });
}
