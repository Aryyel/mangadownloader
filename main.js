// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { getLanguagesJSON } = require("./languages/languages");
let win;
let mangahost = "https://mangahosted.com/find/";
let mangahostimages = "https://img-host.filestatic3.xyz/mangas_files/my-wife-is-a-demon-queen/310/";

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  ipcMain.handle("get-mangas-by-name", (event, args) => {
    console.log(`${args}`)
    return args;
  });

  ipcMain.handle("get-languages", (event, args) => getLanguagesJSON());

  mainWindow.loadFile('index.html')

  win = mainWindow;

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("get-languages", (event, args) => {
  // win.webContents.send("send-languages", `test_${String(getLanguagesJSON())}`);
  // win.webContents.send("send-languages", getLanguagesJSON());
  
  console.log("main");
  console.log(args);
  event.sender.send("send-languages", getLanguagesJSON());
});

// ipcMain.on("get-mangas-by-name", (event, args) => {
//   // win.webContents.send("send-languages", `test_${String(getLanguagesJSON())}`);
//   // win.webContents.send("send-languages", getLanguagesJSON());
  
//   console.log("main");
//   console.log(args);
//   event.sender.send("send-mangas", getLanguagesJSON());
// });