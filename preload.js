// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer, ipcMain } = require("electron");

// contextBridge.exposeInMainWorld(
//   "api", {
//       send: (channel, data) => {
//           // whitelist channels
//           let validChannels = ["send-languages"];
//           if (validChannels.includes(channel)) {
//               console.log("send language");
//               ipcRenderer.send(channel, data);
//           }
//       },
//       receive: (channel, func) => {
//           // whitelist channels
//           let validChannels = ["get-languages"];
//           if (validChannels.includes(channel)) {
//             console.log("teste funcionou")
//             console.log(func)
//               // Deliberately strip event as it includes `sender` 
//               ipcRenderer.on(channel, (event, ...args) => func(...args));
//           }
//       }
//   }
// );

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
})

window.addEventListener("DOMContentLoaded", () => {

  console.log("inicio");
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type])
  }

})
