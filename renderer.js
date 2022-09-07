// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// window.api.receive('get-languages', ( event, data ) => function( event, data ) {
//     console.log( data )
// }, event)

// ipcRenderer.on('get-languages', (event, arg) => {
//     console.log("aa")
//     console.log(arg)
//  })

// window.api.receive("get-languages", (event, arg) => {
//     console.log("a");
// })

// window.api.receive("get-mangas-by-name", (event, arg) => {
//     console.log("a");
// })

// const func = async () => {
//     const response = await window.api.getMangasByName();
//     console.log(response);
// }

const loadLanguages = async () => {
    const response = await window.api.receive("get-languages");
    if (!response || !response.languages)
        return;
    
    window.languages = response.languages;
    window.activeLanguageCode = "en-US";
    insertTranslations(window.languages.filter(language => language.code === window.activeLanguageCode)[0].translations);
}

const insertTranslations = (translations) => {
    const title = document.getElementById("title");
    const nameInput = document.getElementById("nameInput");
    const nameInputLabel = document.getElementById("nameInputLabel");
    const searchButton = document.getElementById("searchButton");
    const resultsTitle = document.getElementById("resultsTitle");
    const downloadButton = document.getElementById("downloadButton");
    const tableHeaderName = document.getElementById("tableHeaderName");
    const tableHeaderDescription = document.getElementById("tableHeaderDescription");

    title.innerText = translations.TITLE;
    nameInput.placeholder = translations.NAME_INPUT_PLACEHOLDER;
    nameInputLabel.innerText = translations.NAME_INPUT_LABEL;
    searchButton.innerText = translations.SEARCH_BUTTON_TEXT;
    resultsTitle.innerText = translations.RESULTS_TITLE;
    downloadButton.innerText = translations.DOWNLOAD_BUTTON_TEXT;
    tableHeaderName.innerText = translations.TABLE_HEADER_NAME;
    tableHeaderDescription.innerText = translations.TABLE_HEADER_DESCRIPTION;

}
 
loadLanguages();
