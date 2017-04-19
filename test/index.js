'use strict';
const assert = require('assert');
const splitter = require('./../lib/splitter-node.js');

describe('backed-splitter test suite', () => {
  it('test defaults (ignores duplicates, imports in imports)', done => {
    splitter({entry: 'test/templates/index.html'}).then(result => {
      assert.equal(JSON.stringify(result).length, 736);
      done();
    })
  });
});
