// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { getLanguagesJSON } = require("./languages/languages");
const { getMangaByName, getChapterByMangaURL, getMangaFilesByChapter } = require("./manga_finder/manga-finder");
const { downloadMangaIntoDirectory } = require("./manga_finder/manga-downloader");

if (require("electron-squirrel-startup")) return app.quit();

let win;
const MANGA_HOST = "https://mangahosted.com/find/";
const MANGA_HOST_IMAGES = "https://img-host.filestatic3.xyz/mangas_files/my-wife-is-a-demon-queen/310/";

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true
    }
  });

  mainWindow.setIcon(path.join(__dirname, "icon/icon.ico"));
  mainWindow.removeMenu();

  ipcMain.handle("get-manga-files-by-chapter", async (event, mangaChapterData) => {
    const mangaChapterFiles = await getMangaFilesByChapter(mangaChapterData);
    const downloaded = await downloadMangaIntoDirectory(mangaChapterData.directory, mangaChapterFiles, mainWindow);
    // showNotification(mangaChapterData.mangaName);
    return downloaded;
  });

  ipcMain.handle("get-chapters", (event, args) => getChapterByMangaURL(args));

  ipcMain.handle("get-mangas-by-name", (event, args) => getMangaByName(args));

  ipcMain.handle("get-languages", (event, args) => getLanguagesJSON());

  ipcMain.handle("open-downloaded-results", (event, args) => shell.openPath(args));

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  win = mainWindow;

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
