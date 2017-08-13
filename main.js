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
let updateWindow;

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
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.on('closed', function () {
    mainWindow = null;
    // because we have more than one window, quit the app when the main one is shut
    app.quit();
  });
  return mainWindow;
}

function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, 'icon.png')
  });
  updateWindow.on('close', (e) => {
    e.preventDefault();
    updateWindow.hide();
    log.info('Window hidden');
    return false;
  });
  updateWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return updateWindow;
}

// Function to send statuses from the downloader to the updater window
function sendStatusToUpdateWindow(text) {
  log.info(text);
  updateWindow.webContents.send('message', text);
}

function sednDownloadProgressToUpdateWindow(percent) {
  log.info(percent);
  updateWindow.webContents.send('progress', percent);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToUpdateWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  updateWindow.show();
  sendStatusToUpdateWindow('Update available. Downloading it!');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToUpdateWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToUpdateWindow('Error in auto-updater. Please restart Tronplex. If this continues submit a bug.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sednDownloadProgressToUpdateWindow(progressObj.percent);
  sendStatusToUpdateWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sednDownloadProgressToUpdateWindow(100);      
  sendStatusToUpdateWindow('Update downloaded; Prompting to install.');
});
autoUpdater.on('update-downloaded', (info) => {
  updateWindow.webContents.executeJavaScript('checkInstall();', true)
    .then((result) => {
      console.log(result);
      log.info(result);
      doUpdate(result);
    })

  function doUpdate(result) {
    if (result) {
      sendStatusToUpdateWindow("Updating");
      autoUpdater.quitAndInstall();
    }
    else {
      sendStatusToUpdateWindow("Chose not to update, will automatically update on next restart");
      updateWindow.hide();
    }
  }
});

app.on('ready', function () {
  createMainWindow();
  createUpdateWindow();
  autoUpdater.checkForUpdates();
  //updateWindow.toggleDevTools();
  //updateWindow.show();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // we need to allow the update window to close, so remove the listeners and set it as null;
  updateWindow.removeAllListeners('close');
  updateWindow = null
});

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow();
  }
});