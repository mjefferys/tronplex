// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

document.addEventListener("keydown", function (e) {
    if (e.which === 114) {
        require('remote').getCurrentWindow().openDevTools();
    } else if (e.which === 116) {
        location.reload();
    } else if (e.which === 112) {
        var appVersion = require('electron').remote.app.getVersion();
        alert('Version: ' + appVersion);
    } else if (e.which == 113){
        
    }
});