require('es6-promise').polyfill();
require('document-register-element');

var assert = require('assert');
var helpers = module.exports = {};
var testContainer = document.querySelector('#test-container');
var defaultElement = testContainer;
var waitTime = 10;

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
      return reject(error);
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
};

helpers.makeWaitPromise = function (delay, resolvedValue) {
  return function () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(resolvedValue);
      }, delay);
    });
  }
};

helpers.makeTestFailure = function (message) {
  return function () {
    throw new Error(message);
  };
};

helpers.makeAssertError = function (expectedError) {
  return function (error) {
    if (!(error instanceof expectedError)) {
      console.error(
        'Test failure: expected this error:\n\n', expectedError,
        '\n\nbut received this one:\n\n', error
      );
    }
    assert.ok(error instanceof expectedError);
  };
};
