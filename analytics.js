const electron = require('electron');
const app = electron.app;
const ua = require('universal-analytics');
const uuid = require('uuid/v4');
const { JSONStorage } = require('node-localstorage');
const nodeStorage = new JSONStorage('./ls');
const userId = nodeStorage.getItem('userid') || uuid();
nodeStorage.setItem('userid', userId);
const usr = ua('UA-130548886-1', userId);
usr.set("ds", "app")
trackEvent('Application', 'Startup');
trackScreenView('ApplicationStartup');

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
    var appVersion = app.getVersion();
    usr
        .screenview(screenName, "TronPlex", appVersion).send();
}

function getUserid() {
    return userId;
}


module.exports = { trackEvent, trackScreenView, getUserid };