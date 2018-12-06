const log = require('electron-log');
const electronTitlebarWindows = require('electron-titlebar-windows');
const { remote } = require('electron');
const { getGlobal } = remote;
const trackEvent = getGlobal('trackEvent');
const trackScreenView = getGlobal('trackScreenView');

let titlebar = new electronTitlebarWindows({
    darkMode: true,
    color: 'rgb(220, 200, 200)',
    backgroundColor: 'rgb(0, 0, 0)',
    draggable: true,
    fullscreen: false
});
titlebar.appendTo(document.getElementById('menu'));
titlebar.on('close', () => {
    console.info('close');
    remote.getCurrentWindow().close();
});
titlebar.on('fullscreen', () => {
    console.info('fullscreen');
    remote.getCurrentWindow().setFullScreen(false);
    remote.getCurrentWindow().maximize();
});
titlebar.on('minimize', () => {
    console.info('minimize');
    remote.getCurrentWindow().minimize();
});
titlebar.on('maximize', () => {
    console.info('maximize');
    log.info('maximise');
    remote.getCurrentWindow().setFullScreen(false);
    remote.getCurrentWindow().maximize();
});

remote.getCurrentWindow().on('enter-full-screen', () => {
    log.info('entering fullscreen');
    document.getElementById('menu').className = 'hidden';
    document.getElementById('plexapp').className = 'fullscreenwebview';
    trackEvent("Application", "FullScreenEnter");
});
remote.getCurrentWindow().on('leave-full-screen', () => {
    log.info('exiting fullscreen');
    document.getElementById('menu').className = '';
    document.getElementById('plexapp').className = 'partialwebview';
    trackEvent("Application", "FullScreenExit");
});

const webview = document.querySelector('webview');
const indicator = document.querySelector('.indicator');
webview.addEventListener('page-title-updated', titleUpdate);
webview.addEventListener('did-start-loading', loadstart);
webview.addEventListener('did-stop-loading', loadstop);
webview.addEventListener('did-frame-finish-load', frameFinishLoad);
webview.addEventListener('did-fail-load', loadfail);

function loadfail(){
    trackEvent("Application", "PlexLoadFail");
    indicator.innerHTML = 'Plex Load Failed, please press F5 to try again';    
    trackScreenView("PlexFail");
}
function frameFinishLoad(){   
    trackEvent("Application", "PlexLoadFrame");
}
function loadstart() {
    trackEvent("Application", "PlexLoadStart");
}
function loadstop() {
    trackEvent("Application", "PlexLoadEnd");
    trackScreenView("PlexApp");
}
function titleUpdate() {
    const webview = document.querySelector('webview');
    var title = webview.getTitle();
    if (title != "Plex") {
        document.title = title + " - Plex";
    }
    else {
        document.title = "Plex";
    }
    trackEvent("Application", "PlexTitleUpdate");
}
document.addEventListener("keydown", function (e) {
    var appVersion = require('electron').remote.app.getVersion();
    var electrionVersion = process.versions.electron;
    if (e.which === 123) {
        require('remote').getCurrentWindow().toggleDevTools();
    } else if (e.which === 116) {
        location.reload();
    } else if (e.which === 112) {
        alert('Version: ' + appVersion + ' Electron version: ' + electrionVersion);   
        trackEvent("Application", "PlexVersionCheck"); 
    } else if (e.which == 113){
        changeSpeed(1)
    } else if (e.which == 114){
        changeSpeed(1.25)  
    } else if (e.which == 115){
        changeSpeed(1.5)
    } else if (e.which == 117){
        changeSpeed(2)
    } else if (e.which == 121){
        const webview = document.querySelector('webview');           
        webview.loadURL("https://www.whatsmybrowser.org/");        
    }
});

function changeSpeed(speed)
{   
    console.log('Setting speed to: ' + speed)
    const webview = document.querySelector('webview');             
    var speedJavaScript = "var videos = document.querySelectorAll('video'); videos.forEach(function(video) { video.playbackRate=" + speed + "; });"
    webview.executeJavaScript(speedJavaScript);    
    console.log('Speed to: ' + speed)
    trackEvent("Application", "PlexSpeedChange");
}