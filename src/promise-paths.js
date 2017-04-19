'use strict';
import path from 'path';
export default source => {
  return new Promise((resolve, reject) => {
    try {
      resolve(path.dirname(source));
    } catch (error) {
      reject(error)
    }
  });
}
