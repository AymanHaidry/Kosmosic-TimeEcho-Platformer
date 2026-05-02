const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true
  });

  // LOAD YOUR GAME (hosted version)
  win.loadURL('https://echotime.vercel.app');
}

app.whenReady().then(createWindow);
