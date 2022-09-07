// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer, ipcMain } = require("electron");

contextBridge.exposeInMainWorld("api", {
  receive: (channel, args) => {
    const validChannels = ["get-languages", "get-mangas-by-name"];
    var result = null;
    if (validChannels.includes(channel))
      result = ipcRenderer.invoke(channel, args);
    
    return result;
  },
  getLanguages: () =>  ipcRenderer.invoke("get-languages"),
  getMangasByName: name => ipcRenderer.invoke("get-mangas-by-name", name)
});

window.addEventListener("DOMContentLoaded", () => {

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type])
  }

})
