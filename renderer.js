// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

document.addEventListener("keydown", function (e) {
    var appVersion = require('electron').remote.app.getVersion();
    var electrionVersion = process.versions.electron;
    //var electrionVersion = 'hello';
    if (e.which === 123) {
        require('remote').getCurrentWindow().toggleDevTools();
    } else if (e.which === 116) {
        location.reload();
    } else if (e.which === 112) {
        alert('Version: ' + appVersion + ' Electron version: ' + electrionVersion);    
    } else if (e.which == 113){
        changeSpeed(1)
    } else if (e.which == 114){
        changeSpeed(1.25)  
    } else if (e.which == 115){
        changeSpeed(1.5)
    } else if (e.which == 117){
        changeSpeed(2)
    }
});

function changeSpeed(speed)
{   
    console.log('Setting speed to: ' + speed)
    const webview = document.querySelector('webview');             
    var speedJavaScript = "var videos = document.querySelectorAll('video'); videos.forEach(function(video) { video.playbackRate=" + speed + "; });"
    //console.log(jacascript);
    webview.executeJavaScript(speedJavaScript);
    console.log('Speed to: ' + speed)
}