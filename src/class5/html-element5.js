'use strict';
import { parse } from 'parse5';

export default class HTMLElement5 {
  constructor(value) {
    if (value && !value.nodeName) {
      value = parse(value);
    }
    this.value = value;
  }

  get childNodes() {
    return this.value.content ? this.value.content.childNodes : this.value.childNodes;
  }

  getInnerHTML(children, content) {
    for (let child of children) {
      if (child.value) {
        content += child.value;
      } else if (child.childNodes.length > 0) {
        content = this.getInnerHTML(child.childNodes, content);
      }
    }
    return content;
  }

  get innerHTML() {
    const content = this.getInnerHTML(this.childNodes, '');
    return content;
  }

  get outerHTML() {
    const attributes = this.serializeAttributes();
    const tagName = this.value.tagName;
    let endTag = true;
    switch (tagName) {
      case 'link':
      case 'img':
        endTag = false;
        break;
    }
    return `<${tagName}${attributes}>${this.innerHTML ? `\n  ${this.innerHTML}\n` : ''}${endTag ? `</${tagName}>` : ''}`
  }

  get attributes() {
    return this.value.attrs;
  }

  isTextNode(node) {
    return Boolean(node.nodeName === '#text');
  }

  indexOfAttribute(attribute, node = {}) {
    try {
      const attrs = node.attrs || this.attributes;
      for (let attr of attrs) {
        if (attr.name.toLowerCase() === attribute.toLowerCase()) {
          return attrs.indexOf(attr);
        }
      }
      return -1;
    } catch (error) {
      console.error(error);
    }
  }

  hasAttribute(attribute, node) {
    try {
      return Boolean(this.indexOfAttribute(attribute, node || this.value) !== -1);
    } catch (error) {
      console.error(error);
    }
  }

  getAttribute(attribute) {
    try {
      attribute = this.attributes[this.indexOfAttribute(attribute)].value;
      if (attribute === '') {
        attribute = null;
      }
      return attribute;
    } catch (error) {
      console.error(error);
    }
  }

  serializeAttribute(name, value) {
    return `${name}="${value}"`;
  }

  serializeAttributes() {
    let attributes = '';
    for (let attr of this.value.attrs) {
      attributes += ` ${this.serializeAttribute(attr.name, attr.value)}`;
    }
    return attributes;
  }

  removeChild(node) {
    const parent = node.parentNode;
    if (parent && parent.childNodes) {
      const index = parent.childNodes.indexOf(node);
      parent.childNodes.splice(index, 1);
    }
    node.parentNode = undefined;
    return parent.childNodes;
  }
}
