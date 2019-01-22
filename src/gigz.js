const uuidv4 = require('uuid/v4');

const apiUrl = 'https://gigz.simbals.com';
let distinct_id = null;
let token = null;
let proxy = null;

module.exports = {
  initToken: function(newToken) {
    this._init();
    token = newToken;
  },
  initProxy: async function(getTokenUrl, checkTokenUrl) {
    this._init();

    try {
      proxy = {
        getToken: getTokenUrl,
        checkToken: checkTokenUrl,
        token: null
      };

      // Get token from cookies
      var proxyToken = this._getCookie("gigz-tracking-token");

      if (!proxyToken || !(await this._checkProxyToken(proxyToken))) {
        proxyToken = await this._getProxyToken();
        this._setCookie("gigz-tracking-token", proxyToken);
      }

      proxy.token = proxyToken;
    }
    catch(e) {
      proxy = null;
    }
  },
  _init: function() {
    // Get distinct id from cookies
    distinct_id = this._getCookie("gigz-tracking-distinctid");

    if (!distinct_id) {
      distinct_id = uuidv4();
      this._setCookie("gigz-tracking-distinctid", distinct_id);
    }
  },
  _getCookie(name) {
    var selectedCookie = document.cookie.split(';').map(c => c.split('=')).filter(c => c[0].trim() == name);

    return selectedCookie.length ? selectedCookie[0][1].trim() : null;
  },
  _setCookie(name, value) {
    document.cookie = `${name}=${value}`;
  },
  _getProxyToken() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      
      xhr.open('GET', proxy.getToken);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          var result = JSON.parse(xhr.responseText);
          if (result.status == 1) {
            resolve(result.result.session_key);
          }
          else {
            reject();
          }
        }
      }

      xhr.send();
    });
  },
  _checkProxyToken(proxyToken) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', proxy.checkToken.replace("{0}", proxyToken));
      xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          resolve(xhr.response.status == 1);
        }
      }

      xhr.send();
    });
  },
  track: function(eventName, parameters) {
    var xhr = new XMLHttpRequest();
    
    if (token == null && proxy == null) {
      throw new Error('Invalid API token');  
    }

    if (proxy != null && proxy.token == null) {
      // Wait that the token is recovered (relaunch the function once the current tasks are finished)
      return setTimeout(async () => await this.track(eventName, parameters), 0);
    }

    xhr.open('POST', `${apiUrl}/log/${token || proxy.token}/track`);

    xhr.setRequestHeader('Content-Type', 'application/json');

    var body = {
      action: eventName,
      distinct_id: distinct_id,
      agent: navigator.userAgent,
      properties: parameters != null ? parameters : {}
    };

    xhr.send(JSON.stringify(body));
  },
  engage: function(userId, firstName, email, creationTime) {
    var xhr = new XMLHttpRequest();

    if (token == null && (proxy == null || proxy.token == null)) {
      throw new Error('Invalid API token');  
    }

    xhr.open('POST', `${apiUrl}/log/${token || proxy.token}/engage`);

    xhr.setRequestHeader('Content-Type', 'application/json');

    var body = {
      distinct_id: distinct_id,
      user_id: userId,
      name: firstName,
      email: email,
      created: creationTime / 1000
    };

    xhr.send(JSON.stringify(body));
  },
  reset: function() {
    distinct_id = uuidv4();
  }
};