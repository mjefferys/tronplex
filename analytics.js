const ua = require('universal-analytics');
const uuid = require('uuid/v4');
const { JSONStorage } = require('node-localstorage');
const nodeStorage = new JSONStorage('./ls');
const userId = nodeStorage.getItem('userid') || uuid();
nodeStorage.setItem('userid', userId);
const usr = ua('UA-130548886-1', userId);
usr.set("ds", "app")
trackEvent('Application', 'Startup');

function trackEvent(category, action, label, value) {
    usr
      .event({
        ec: category,
        ea: action,
        el: label,
        ev: value,
      })
      .send();
  }

  function trackScreenView(screenName) {
    var appVersion = require('electron').remote.app.getVersion();
    usr
      .screenview(screenName, "TronPlex", appVersion)
      .send();
  }

module.exports = { trackEvent };
