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

http.NOTJSON = 'NotParsableJSON';
http.NOT200 = 'Not200Status';
http.FAILED = 'XHRFailure';
http.OFFLINE = 'NavigatorOffline';

http.onlineCallback = null;

http.sendTraces = function (traces) {
  return postAsJson('./traces', traces);
};

function postAsJson(url, data) {
  return new Promise(function (resolve, reject) {
    if (!isNavigatorOnline) {
      reject(makeError(http.OFFLINE, 'Navigator is offline'));
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
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
              reject(makeError(
                http.NOTJSON,
                'Cannot parse JSON response: ' + error.message
              ));
            }
          } else {
            reject(makeError(http.NOT200, 'XHR status: ' + xhr.status));
          }
        } else {
          reject(makeError(
            http.FAILED,
            'XHR failed: offline, timeout or host not reachable'
          ));
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });
}

function makeError(type, message) {
  var error = Error(message);
  error.name = type;

  return error;
}
