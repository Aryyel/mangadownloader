// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

window.addEventListener("load", () => {

    const toggleSelectedRow = row => {
        
        if (row && row.classList.contains("table-active"))
            row.classList.remove("table-active");
        else
            row.classList.add("table-active");
    }   

    const selectTableRow = event => {
        event.stopPropagation();
        const { target } = event;
        const { parentElement } = target;

        if (target.tagName !== "TD")
            return;

        toggleSelectedRow(parentElement);
        parentElement.querySelector("td[class='mangaName']");
    }

    const searchForMangas = async () => {
        const results = await window.api.receive("get-mangas-by-name", document.getElementById("nameInput").value);
        clearTableBody();
        insertResults(results);
    }
    
    const clearTableBody = () => {
        const tableTBody = document.getElementsByTagName("tbody") ? document.getElementsByTagName("tbody")[0] : null;
        if (!tableTBody || !tableTBody.length)
            return;
        
        tableTBody.innerHTML = null;
    }

    const insertResults = results => {
        const table = document.getElementsByTagName("table") ? document.getElementsByTagName("table")[0] : null;
        const tableTBody = document.getElementsByTagName("tbody") ? document.getElementsByTagName("tbody")[0] : null;

        if (!results || !table || !tableTBody)
            return;
        
        for (const result of results) {
            const newRow = tableTBody.insertRow();
            newRow.innerHTML = `<tr>
                                    <td class="mangaName">${result.mangaName}</td>
                                    <td class="mangaDescription">${result.mangaDescription}</td>
                                </tr>`;
        }
    }

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
     
    const searchButton = document.getElementById("searchButton");
    const table = document.getElementsByTagName("table")[0];
    searchButton.addEventListener("click", searchForMangas);
    table.addEventListener("click", selectTableRow);


    loadLanguages();

});
