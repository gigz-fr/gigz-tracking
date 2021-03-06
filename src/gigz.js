
import { ConsentString } from 'consent-string';
import gdprModals from './gdpr-modal.js';

const apiUrl = 'https://gigz-log.simbals.com';
let distinct_id = null;
let campaign = null;
let token = null;
let proxy = null;
let coords = null;
let enabled = true;

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
  disable: function(disable) {
    enabled = !disable;
  },
  getGdprAuthorizations: function(callback) {
    const consentCookie = this._getCookie("consentstring");
    if (consentCookie) {
      callback(new ConsentString(consentCookie));
    }
    else {
      // Get from modal
      gdprModals(consentData => {
        this._setCookie("consentstring", consentData.getConsentString());

        if (callback) {
          callback(consentData);
        }
      });
    }
  },
  _init: function() {
    // Get distinct id from cookies
    distinct_id = this._getCookie("gigz-tracking-distinctid");

    if (!distinct_id) {
      distinct_id = this._generateDistinctId();
      this._setCookie("gigz-tracking-distinctid", distinct_id);
    }

    // Get UTM campaign from URL
    const params = window.location.search.slice(1).split('&').reduce((container, param) => {
      const splittedParam = param.split('=');
      container[splittedParam[0]] = splittedParam[1];
      return container;
    }, {});

    if (params.utm_campaign) {
      campaign = params.utm_campaign;
    }

    // Insert Xandr pixel
    const xandrPixel = document.createElement('img');
    xandrPixel.width = 1;
    xandrPixel.height = 1;
    xandrPixel.src = `https://secure.adnxs.com/getuid?https://backstage.gigz.fr/mapuserid?user_id=$UID&distinct_id=${distinct_id}`;

    if (document.body) {
      document.body.appendChild(xandrPixel);
    }
    else {
      document.onload = () => document.body.appendChild(xandrPixel);
    }
  },
  _generateDistinctId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  _getCookie(name) {
    var selectedCookie = document.cookie.split(';').map(c => c.split('=')).filter(c => c[0].trim() == name);

    return selectedCookie.length ? selectedCookie[0][1].trim() : null;
  },
  _setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
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
  setUserLocation(latitude, longitude) {
    coords = {latitude, longitude};
  },
  track: function(eventName, parameters, retry = 0) {
    if (!enabled) {
      return;
    }

    var xhr = new XMLHttpRequest();
    
    if (token == null && proxy == null) {
      throw new Error('Invalid API token');
    }

    if (proxy != null && proxy.token == null) {
      if (retry > 10) {
        throw new Error('Unable to retrieve a token');
      }

      // Wait that the token is recovered (relaunch the function once the current tasks are finished)
      return setTimeout(async () => await this.track(eventName, parameters, retry++), 100);
    }

    xhr.open('POST', `${apiUrl}/log/${token || proxy.token}/track`);

    xhr.setRequestHeader('Content-Type', 'application/json');

    if (parameters == null) {
      parameters = {};
    }

    if (campaign) {
      parameters.campaign = campaign;
    }

    var body = {
      action: eventName,
      distinct_id: distinct_id,
      location: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
      agent: navigator.userAgent,
      properties: parameters
    };

    xhr.send(JSON.stringify(body));
  },
  engage: function(userId, firstName, email, creationTime, retry = 0) {
    if (!enabled) {
      return;
    }

    var xhr = new XMLHttpRequest();

    if (token == null && proxy == null) {
      throw new Error('Invalid API token');  
    }

    if (proxy != null && proxy.token == null) {
      if (retry > 10) {
        throw new Error('Unable to retrieve a token');
      }

      // Wait that the token is recovered (relaunch the function once the current tasks are finished)
      return setTimeout(async () => await this.engage(userId, firstName, email, creationTime, retry++), 100);
    }

    xhr.open('POST', `${apiUrl}/log/${token || proxy.token}/engage`);

    xhr.setRequestHeader('Content-Type', 'application/json');

    var body = {
      distinct_id: distinct_id,
      location: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
      user_id: userId,
      name: firstName,
      email: email,
      created: creationTime / 1000
    };

    xhr.send(JSON.stringify(body));

    distinct_id = userId;
    this._setCookie("gigz-tracking-distinctid", distinct_id);
  },
  reset: function() {
    distinct_id = this._generateDistinctId();
  }
};