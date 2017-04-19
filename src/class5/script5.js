'use strict';
import HTMLElement5 from './html-element5';

export default class Script5 extends HTMLElement5 {
  constructor(value) {
    super(value);
  }

  get src() {
    return this.hasAttribute('src') ? this.getAttribute('src') : null;
  }
}
