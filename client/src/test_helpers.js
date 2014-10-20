require('es6-promise').polyfill();
require('document-register-element');

var assert = require('assert');
var helpers = module.exports = {};
var testContainer = document.querySelector('#test-container');
var defaultElement = testContainer;
var waitTime = 10;

helpers.setWaitTime = function (time) {
  waitTime = time;
};

helpers.setDefaultElement = function (element) {
  defaultElement = element;
};

helpers.appendElement = function (element) {
  testContainer.appendChild(element);
};

helpers.clean = function () {
  testContainer.innerHTML = '';
};

helpers.select = function (selector) {
  var element = defaultElement.querySelector(selector);

  if (element) {
    return element;
  }

  throw new Error ('No element matches the selector "' + selector + '"');
};

helpers.click = function (selector) {
  return new Promise(function (resolve, reject) {
    try {
      var element = helpers.select(selector);
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
};

helpers.createEvent = function (name) {
  var event = document.createEvent('Event');
  event.initEvent(name, true, true);

  return event;
}

helpers.assertElement = function (element, shouldBeFilled) {
  assert.ok(element instanceof HTMLElement);

  if (shouldBeFilled) {
    assert.ok(element.innerHTML !== '');
  } else {
    assert.ok(element.innerHTML === '');
  }
};

