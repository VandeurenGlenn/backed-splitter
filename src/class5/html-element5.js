'use strict';
import { parse } from 'parse5';

export default class HTMLElement5 {
  constructor(value) {
    if (value && !value.nodeName) {
      value = parse(value);
    }
    this.value = value;
  }

  get tagName() {
    return this.value.tagName;
  }

  get childNodes() {
    return this.value.content ? this.value.content.childNodes : this.value.childNodes;
  }

  set childNodes(value) {
    const _value = this.value;
    if (_value.content ) _value.content.childNodes = value;
    else _value.childNodes = value;
  }

  hasTagName(name) {
    return this.value.tagName === name;
  }

  getInnerHTML(children, content) {
    if (children) {
        for (let child of children) {
          if (this.isTextNode(child) && !child.value.includes('\n')) {
            content += child.value;
          } else if (this.isTextNode(child)) {
            content += child.value;
          } else {
            let endTag = true;
            const tagName = child.tagName;
            switch (tagName) {
              case 'link':
              case 'img':
                endTag = false;
                break;
            }
            if (child.value) {
              content += `<${tagName}>${child.value}${endTag ? `</${tagName}>` : ''}`;
            } else if (child.content || child.tagName === 'link' || child.childNodes && child.childNodes.length > 0) {
              // when a document, return head, body & head also
              if (child.tagName === 'body' || child.tagName === 'html' || child.tagName === 'head') {
                if (this.isDocument) {
                  content += new HTMLElement5(child).outerHTML;
                }
                content = this.getInnerHTML(child.childNodes, content);
              } else {
                content += new HTMLElement5(child).outerHTML;
              }
            } else if (child.childNodes && child.childNodes.length === 0) {
              content += new HTMLElement5(child).outerHTML;
            }
          }

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
    if (this.value.attrs) {
      for (let attr of this.value.attrs) {
        attributes += ` ${this.serializeAttribute(attr.name, attr.value)}`;
      }
    }
    return attributes;
  }

  appendChild(node) {
    let childNodes = this.childNodes;
    childNodes.push(node);
    this.childNodes = childNodes;
    return this.childNodes;
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
