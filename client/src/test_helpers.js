require('es6-promise').polyfill();
require('document-register-element');

var assert = require('assert');
var testContainer = document.querySelector('#test-container');
var defaultElement = testContainer;
var waitTime = 10;

function setWaitTime(time) {
  waitTime = time;
}

function setDefaultElement(element) {
  defaultElement = element;
}

function appendElement(element) {
  testContainer.appendChild(element);
};

function clean() {
  testContainer.innerHTML = '';
}

function select(selector) {
  var element = defaultElement.querySelector(selector);

  if (element) {
    return element;
  }

  throw new Error ('No element matches the selector "' + selector + '"');
}

function click(selector) {
  return new Promise(function (resolve, reject) {
    try {
      var element = select(selector);
    } catch (error) {
      reject(error);
    }

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click', true, true, window, 0, 0, 0, 0, 0,
      false, false, false, false, 0, element
    );

    element.dispatchEvent(event);
    setTimeout(resolve, waitTime);
  });
}

function assertElement(element, shouldBeFilled) {
  assert.ok(element instanceof HTMLElement);

  if (shouldBeFilled) {
    assert.ok(element.innerHTML !== '');
  } else {
    assert.ok(element.innerHTML === '');
  }
};

module.exports = {
  click: click,
  setWaitTime: setWaitTime,
  setDefaultElement: setDefaultElement,
  appendElement: appendElement,
  clean: clean,
  select: select,
  assertElement: assertElement
};