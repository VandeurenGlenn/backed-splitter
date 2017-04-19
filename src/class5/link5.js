'use strict';
import HTMLElement5 from './html-element5';

export default class Link5 extends HTMLElement5 {
  constructor(value) {
    super(value);
  }

  get href() {
    return this.getAttribute('href');
  }

  get rel() {
    return this.getAttribute('rel');
  }
}
