'use strict';
const assert = require('assert');
const splitter = require('./../lib/splitter-node.js');

let bundle;

describe('backed-splitter test suite', () => {
  it('splitter returns without error', done => {
    splitter({entry: 'test/templates/index.html', exclude: ['**/*.css', '*.json'], external: ['some.js', 'bower_components/**/*']}).then(result => {
      bundle = result;
      done();
    })
  });

  it('bundleHref is defined correctly for app mode', () => {
    assert.equal(bundle.bundleHref, 'imported-app.html');
  });

  it('bundle contains expected imports', () => {
    assert.equal(Object.keys(bundle.imports).length, 3);
  });

  it('bundle contains expected scripts', () => {
    assert.equal(Object.keys(bundle.scripts).length, 3);
  });

  it('bundle contains expected external', () => {
    assert.equal(Object.keys(bundle.external).length, 2);
  });

});

describe('backed-splitter element test suite [default]', () => {

  it('splitter returns without error', done => {
    splitter({entry: 'test/templates/app.html'}).then(result => {
      bundle = result;
      done();
    })
  });

  it('bundleHref is defined correctly for element mode', () => {
    return assert.equal(bundle.bundleHref, 'none');
  });

  it('bundle contains expected imports', () => {
    assert.equal(Object.keys(bundle.imports).length, 0);
  });

  it('bundle contains expected scripts', () => {
    assert.equal(Object.keys(bundle.scripts).length, 3);
  });

  it('bundle contains expected external', () => {
    assert.equal(Object.keys(bundle.external).length, 0);
  });
});
