function HttpClient() {
  this.isOnline = navigator.onLine;
}

HttpClient.prototype.initListeners = function () {
  window.addEventListener('online', function () {
    this.isOnline = true;
    console.log('online event');
  });
  window.addEventListener('offline', function () {
    this.isOnline = false;
    console.log('offline event');
  });
};

HttpClient.prototype.postAsJson = function (url, data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.overrideMimeType('application/json');

  xhr.timeout = 3000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState == this.DONE) {
      // requests failing due to connectivity problems have a status code 0
      // in all browsers except IE, which uses special codes (>= 12000)
      // (http://msdn.microsoft.com/en-us/library/aa383770%28VS.85%29.aspx)
      if (xhr.status && xhr.status < 12000) {
        if (xhr.status === 200) {
          console.log('200 ok');
        } else {
          // must be re-issued
          console.log('response with status', xhr.status);
        }
      } else {
        // same
        this.isOnline = false;
        console.log('failed request (offline or timeout or host not reachable)', xhr.status);
      }
    }
  };

  xhr.onerror = function (e) {
    console.log('xhr error', this, e);
  };

  xhr.onabort = function () {
    console.log('xhr abort');
  };

  xhr.ontimeout = function () {
    console.log('xhr timeout')
  };

  xhr.send(JSON.stringify(data));
};

module.exports = HttpClient;
