'use strict';
const assert = require('assert');
const splitter = require('./../lib/splitter-node.js');

describe('backed-splitter test suite', () => {
  it('test defaults (ignores duplicates, imports in imports)', done => {
    splitter({entry: 'test/templates/index.html', exclude: ['bower_components/**/*', '**/*.css']}).then(result => {
      assert.equal(result.bundleHref, 'imported-app.html');
      assert.equal(Object.keys(result.imports).length, 4);
      assert.equal(Object.keys(result.scripts).length, 4);
      done();
    })
  });
});
