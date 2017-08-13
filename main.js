const electron = require('electron');
const { Menu, protocol, ipcMain } = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const autoUpdater = require("electron-updater").autoUpdater;
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
let mainWindow
let win;

require('electron-context-menu')({
  prepend: (params) => [{
    label: 'Rainbow',
    // Only show it when right-clicking images
    //visible: params.mediaType === 'image'
  }]
});

log.info('App starting...');

function createMainWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 1024,
    height: 768,
    icon: path.join(__dirname, 'icon.png')
  })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.on('closed', function () {
    mainWindow = null;
    // because we have more than one window, quit the app when the main one is shut
    app.quit();
  })
}

function createUpdateWindow() {
  win = new BrowserWindow({
    show: false
  });
  win.on('close', (e) => {
    // this is stopping the app from dieing completly, need a work around
    e.preventDefault();
    win.hide();
    console.log('Window hidden');
    return false;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function downloadProgress(percent) {
  log.info(percent);
  win.webContents.send('progress', percent);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  win.show();
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  downloadProgress(progressObj.percent);
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; Prompting to install.');
});
autoUpdater.on('update-downloaded', (info) => {
  win.webContents.executeJavaScript('checkInstall();', true)
    .then((result) => {
      console.log(result);
      log.info(result);
      doUpdate(result);
    })

  function doUpdate(result) {
    if (result) {
      sendStatusToWindow("Updating");
      autoUpdater.quitAndInstall();
    }
    else {
      sendStatusToWindow("Chose not to update, will automatically update on next restart");
      win.hide();
    }
  }
});

app.on('ready', function () {
  createMainWindow();
  createUpdateWindow();  
  autoUpdater.checkForUpdates();
  //win.toggleDevTools();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // we need to allow the update window to close, so remove the listeners and set it as null;
  win.removeAllListeners('close');
  win = null
});

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow();
  }
});