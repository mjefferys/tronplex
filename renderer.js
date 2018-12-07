const log = require("electron-log");
const electronTitlebarWindows = require("electron-titlebar-windows");
const { remote } = require("electron");
const { BrowserWindow } = require("electron").remote;
const { getGlobal } = remote;
const trackEvent = getGlobal("trackEvent");
const trackScreenView = getGlobal("trackScreenView");
const getUserid = getGlobal("getUserid");
const fail = false;
var failcount = 0;
var trylocal = true;

setInterval(trackActive, 60000);
let titlebar = new electronTitlebarWindows({
  darkMode: true,
  color: "rgb(220, 200, 200)",
  backgroundColor: "rgb(0, 0, 0)",
  draggable: true,
  fullscreen: false
});
titlebar.appendTo(document.getElementById("menu"));
titlebar.on("close", () => {
  console.info("close");
  remote.getCurrentWindow().close();
});
titlebar.on("fullscreen", () => {
  console.info("fullscreen");
  remote.getCurrentWindow().setFullScreen(false);
  remote.getCurrentWindow().maximize();
});
titlebar.on("minimize", () => {
  console.info("minimize");
  remote.getCurrentWindow().minimize();
});
titlebar.on("maximize", () => {
  console.info("maximize");
  log.info("maximise");
  remote.getCurrentWindow().setFullScreen(false);
  remote.getCurrentWindow().maximize();
});

remote.getCurrentWindow().on("enter-full-screen", () => {
  log.info("entering fullscreen");
  document.getElementById("menu").className = "hidden";
  document.getElementById("plexapp").className = "fullscreenwebview";
  trackEvent("Application", "FullScreenEnter");
});
remote.getCurrentWindow().on("leave-full-screen", () => {
  log.info("exiting fullscreen");
  document.getElementById("menu").className = "";
  document.getElementById("plexapp").className = "partialwebview";
  trackEvent("Application", "FullScreenExit");
});

const webview = document.querySelector("webview");
const indicator = document.querySelector(".indicator");
const errorMessage = document.querySelector("#errorMessage");

webview.addEventListener("page-title-updated", titleUpdate);
webview.addEventListener("did-start-loading", loadstart);
webview.addEventListener("did-stop-loading", loadstop);
webview.addEventListener("did-frame-finish-load", frameFinishLoad);
webview.addEventListener("did-fail-load", loadfail);

function loadfail() {
  trackEvent("Application", "PlexLoadFail");
  trackScreenView("PlexFail");
  if (failcount <= 9) {
    if (trylocal == true) {
      errorMessage.innerHTML = "Plex load failed, retrying local url...";
      webview.loadURL("http://127.0.0.1:32400/web/");
      trylocal = false;
    } else {
      errorMessage.innerHTML = "Local plex failed, retrying remote url...";
      webview.loadURL("https://app.plex.tv/");
      trylocal = true;
    }
    failcount++;
  } else {
    indicator.innerHTML =
      "We tried " +
      failcount +
      " times and could not load Plex, either you have no internet connection to app.plex.tv or no Plex server running locally. <br/> Please report this error to the developer.";
  }
}
function frameFinishLoad() {
  trackEvent("Application", "PlexLoadFrame");
}
function loadstart() {
  trackEvent("Application", "PlexLoadStart");

  // fix for getting input events in webview from bpasero https://github.com/electron/electron/issues/14258#issuecomment-416893856
  var contents = webview.getWebContents();
  contents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") {
      return;
    }
    const emulatedKeyboardEvent = new KeyboardEvent("keydown", {
      code: input.code,
      key: input.key,
      shiftKey: input.shift,
      altKey: input.alt,
      ctrlKey: input.control,
      metaKey: input.meta,
      repeat: input.isAutoRepeat
    });
    processKeyboardEvent(emulatedKeyboardEvent);
  });
}
function loadstop() {
  trackEvent("Application", "PlexLoadEnd");
  trackScreenView("PlexApp");
}
function titleUpdate() {
  var title = webview.getTitle();
  if (title != "Plex") {
    document.title = title + " - Plex";
  } else {
    document.title = "Plex";
  }
  trackEvent("Application", "PlexTitleUpdate");
}
function trackActive() {
  if (fail == false) {
    trackScreenView("PlexAppActive");
  }
}

function changeSpeed(speed) {
  // changes the playback speed of the active window
  console.log("Setting speed to: " + speed);
  var speedJavaScript =
    "var videos = document.querySelectorAll('video'); videos.forEach(function(video) { video.playbackRate=" +
    speed +
    "; });";
  webview.executeJavaScript(speedJavaScript);
  console.log("Speed to: " + speed);
  trackEvent("Application", "PlexSpeedChange");
}

function pauseUnpause() {
  var pauseJavaScript =
    "var videos = document.querySelectorAll('video'); videos.forEach(function(video) { video.paused? video.play() : video.pause(); });";
  webview.executeJavaScript(pauseJavaScript);
  trackEvent("Application", "PlexPauseChangeK");
}

function skip(skip) {
  var skipJavaScript =
    "var videos = document.querySelectorAll('video'); videos.forEach(function(video) { video.currentTime = video.currentTime " +
    skip +
    "; });";
  webview.executeJavaScript(skipJavaScript);
  trackEvent("Application", "PlexSkip");
}

function processKeyboardEvent(e) {
  if (e.key === "F11") {
    require("remote")
      .getCurrentWindow()
      .toggleDevTools();
  } else if (e.key === "F5") {
    location.reload();
  } else if (e.key === "F1") {
    var appVersion = require("electron").remote.app.getVersion();
    var electrionVersion = process.versions.electron;
    var uid = getUserid();
    alert(
      "TronPlex Version: " +
        appVersion +
        "\nElectron version: " +
        electrionVersion +
        "\nUid: " +
        uid
    );
    trackEvent("Application", "TronPlexVersionCheck");
  } else if (e.key === "F2") {
    changeSpeed(1);
  } else if (e.key === "F3") {
    changeSpeed(1.25);
  } else if (e.key === "F4") {
    changeSpeed(1.5);
  } else if (e.key === "F6") {
    changeSpeed(2);
  } else if (e.key === "F10") {
    webview.loadURL("https://www.whatsmybrowser.org/");
    trackEvent("Application", "TronPlexBrowserCheck");
  } else if (e.key === "k") {
    pauseUnpause();
  } else if (e.key === "j") {
    skip("-5");
  } else if (e.key === "l") {
    skip("+5");
  }
}

document.addEventListener("keydown", function(e) {
  var appVersion = require("electron").remote.app.getVersion();
  var electrionVersion = process.versions.electron;
  if (e.which === 123) {
    require("remote")
      .getCurrentWindow()
      .toggleDevTools();
  } else if (e.which === 116) {
    location.reload();
  } else if (e.which === 112) {
    alert(
      "TronPlex Version: " +
        appVersion +
        "\nElectron version: " +
        electrionVersion +
        "\nUid: " +
        getUserid()
    );
    trackEvent("Application", "TronPlexVersionCheck");
  } else if (e.which == 113) {
    changeSpeed(1);
  } else if (e.which == 114) {
    changeSpeed(1.25);
  } else if (e.which == 115) {
    changeSpeed(1.5);
  } else if (e.which == 117) {
    changeSpeed(2);
  } else if (e.which == 121) {
    webview.loadURL("https://www.whatsmybrowser.org/");
    trackEvent("Application", "TronPlexBrowserCheck");
  }
});
