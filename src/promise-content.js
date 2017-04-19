'use strict';
import {readFile} from 'fs';
export default source => {
  return new Promise((resolve, reject) => {
    // if (source.includes('.html') || source.includes('.js'))
      readFile(source, 'utf-8', (error, content) => {
        if (error) reject(error);
        else resolve(content);
      });
    // else resolve(source);
  });
}
