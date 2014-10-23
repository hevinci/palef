require('es6-promise').polyfill();

var http = module.exports = {};
var isNavigatorOnline = navigator.onLine;

document.body.addEventListener('online', function () {
  isNavigatorOnline = true;

  if (http.onlineCallback) {
    http.onlineCallback();
  }
});

document.body.addEventListener('offline', function () {
  isNavigatorOnline = false;
});

http.onlineCallback = null;

http.NotJsonResponse = NotJsonResponse;
http.NotSuccessResponse = NotSuccessResponse;
http.RequestFailure = RequestFailure;
http.NavigatorOffline = NavigatorOffline;

http.sendTraces = function (traces) {
  return postAsJson('./traces', traces);
};

function postAsJson(url, data) {
  return new Promise(function (resolve, reject) {
    if (!isNavigatorOnline) {
      return reject(new NavigatorOffline);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // requests failing due to connectivity problems have a status code 0
        // in all browsers except IE, which uses special codes (>= 12000)
        // (http://msdn.microsoft.com/en-us/library/aa383770%28VS.85%29.aspx)
        if (xhr.status && xhr.status < 12000) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (error) {
              reject(new NotJsonResponse(error.message));
            }
          } else {
            reject(new NotSuccessResponse(xhr.status));
          }
        } else {
          reject(new RequestFailure);
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });
}

function NotJsonResponse(message) {
  this.name = 'NotJsonResponse';
  this.message = 'Cannot parse response as JSON: ' + message;
}

function NotSuccessResponse(message) {
  this.name = 'NotSuccessResponse';
  this.message = 'Response status is: ' + message;
}

function RequestFailure() {
  this.name = 'RequestFailure';
  this.message = 'Request failed: offline, timeout or host not reachable';
}

function NavigatorOffline() {
  this.name = 'NavigatorOffline';
  this.message = 'Navigator is offline';
}

NotJsonResponse.prototype = new Error();
NotSuccessResponse.prototype = new Error();
RequestFailure.prototype = new Error();
NavigatorOffline.prototype = new Error();

NotJsonResponse.prototype.constructor = NotJsonResponse;
NotSuccessResponse.prototype.constructor = NotSuccessResponse;
RequestFailure.prototype.constructor = RequestFailure;
NavigatorOffline.prototype.constructor = NavigatorOffline;
