// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

document.addEventListener("keydown", function (e) {
    var appVersion = require('electron').remote.app.getVersion();
    var electrionVersion = process.versions.electron;
    //var electrionVersion = 'hello';
    if (e.which === 114) {
        require('remote').getCurrentWindow().openDevTools();
    } else if (e.which === 116) {
        location.reload();
    } else if (e.which === 112) {
        alert('Version: ' + appVersion + ' Electron version: ' + electrionVersion);    
    } else if (e.which == 113){
        alert('Version: ' + appVersion + ' Electron version: ' + electrionVersion);    
        //remote.getCurrentWindow().maximize();    
    }
});