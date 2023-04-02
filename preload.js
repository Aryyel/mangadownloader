// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  receive: (channel, args) => {
    const validChannels = ["get-languages", "get-mangas-by-name", "get-chapters", "get-manga-files-by-chapter"];
    var result = null;
    if (validChannels.includes(channel))
      result = ipcRenderer.invoke(channel, args);
    
    return result;
  },
  send: (channel, args) => {
    const validChannels = ["open-downloaded-results"];
    if (validChannels.includes(channel))
      ipcRenderer.invoke(channel, args);
  }
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
