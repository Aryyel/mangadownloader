// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

window.addEventListener("load", () => { 

    const addManyEventListeners = (element, type, callbackFunction) => 
    element.addEventListener(type, callbackFunction)

    const insertChaptersIntoModal = results => {

        const modalChapters = document.getElementById("chapters");

        if (!results || !modalChapters)
            return;
        
        for (const result of results) 
            modalChapters.innerHTML += `<a class="btn btn-primary mb-1" type="submit">${result.chapterNumber}</a>`; 

    }

    const loadChaptersByMangaURL = async event => {
        const response = await window.api.receive("get-chapters", event.target.getAttribute("manga"));

        if (!response)
            return;
        
        clearElementInnerHTML(document.getElementById("chapters"));
        insertChaptersIntoModal(response);
    }

    const toggleSearchButton = () => {
        const searchButton = document.getElementById("searchButton");
        if (!searchButton)
            return;

        searchButton.disabled 
            ? searchButton.removeAttribute("disabled") 
            : searchButton.setAttribute("disabled", "");
        
        toggleLoading();
    }

    const toggleLoading = () => {
        const searchButton = document.getElementById("searchButton");
        searchButton.disabled 
            ? searchButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>${window.activeTranslations.LOADING_TEXT}</span>`
            : searchButton.innerHTML = window.activeTranslations.SEARCH_BUTTON_TEXT;
    }

    const updateSelectedAmount = amount => {
        const selectedAmount = document.getElementById("selectedAmount");
        const newAmount = parseInt(selectedAmount.getAttribute("amount")) + amount;
        selectedAmount.innerText = `${window.activeTranslations.SELECTED_AMOUNT_TEXT}: ${newAmount}`
        selectedAmount.setAttribute("amount", newAmount);
    }

    const toggleSelectedRow = row => {
        
        if (row && row.classList.contains("table-active")){
            row.classList.remove("table-active");
            window.selectedRows = window.selectedRows.filter(selectedRow => selectedRow !== row.querySelector("td[class='mangaName']").innerText)
            updateSelectedAmount(-1);
        }
        else{
            row.classList.add("table-active");
            window.selectedRows.push(row.querySelector("td[class='mangaName']").innerText); 
            updateSelectedAmount(1);
        }
    }   

    const selectTableRow = event => {
        event.stopPropagation();
        const { target } = event;
        const { parentElement } = target;

        if (target.tagName !== "TD")
            return;

        toggleSelectedRow(parentElement);
    }

    const searchForMangas = async () => {
        toggleSearchButton();
        const results = await window.api.receive("get-mangas-by-name", document.getElementById("nameInput").value);
        clearElementInnerHTML(document.getElementsByTagName("tbody") ? document.getElementsByTagName("tbody")[0] : null);
        insertResults(results);
        toggleSearchButton();
    }

    const clearElementInnerHTML = element => {
        if (!element)
            return;
        
        element.innerHTML = null;
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
                                    <td class="mangaHeaderChapters">
                                        <button type="button" class="btn btn-success" 
                                        manga="${result.mangaURL}"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#chaptersModal">${window.activeTranslations.TABLE_HEADER_SELECT_CHAPTERS_BUTTON}</button>
                                    </td>
                                    <td class="d-none">${result.mangaURL}</td>
                                </tr>`;

            const newRowButton = newRow.querySelector("button");
            newRowButton.addEventListener("click", loadChaptersByMangaURL);
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
    
    const insertTranslations = translations => {
        const title = document.getElementById("title");
        const nameInput = document.getElementById("nameInput");
        const nameInputLabel = document.getElementById("nameInputLabel");
        const searchButton = document.getElementById("searchButton");
        const selectedAmount = document.getElementById("selectedAmount");
        const resultsTitle = document.getElementById("resultsTitle");
        const downloadButton = document.getElementById("downloadButton");
        const tableHeaderName = document.getElementById("tableHeaderName");
        const tableHeaderDescription = document.getElementById("tableHeaderDescription");
        const tableHeaderChapters = document.getElementById("tableHeaderChapters");

        title.innerText = translations.TITLE;
        nameInput.placeholder = translations.NAME_INPUT_PLACEHOLDER;
        nameInputLabel.innerText = translations.NAME_INPUT_LABEL;
        searchButton.innerText = translations.SEARCH_BUTTON_TEXT;
        selectedAmount.innerText = `${translations.SELECTED_AMOUNT_TEXT}: ${selectedAmount.getAttribute("amount")}`;
        resultsTitle.innerText = translations.RESULTS_TITLE;
        downloadButton.innerText = translations.DOWNLOAD_BUTTON_TEXT;
        tableHeaderName.innerText = translations.TABLE_HEADER_NAME;
        tableHeaderDescription.innerText = translations.TABLE_HEADER_DESCRIPTION;
        tableHeaderChapters.innerText = translations.TABLE_HEADER_SELECT_CHAPTERS_TITLE;

        window.activeTranslations = translations;
    }
     
    const searchButton = document.getElementById("searchButton");
    const table = document.getElementsByTagName("table")[0];
    searchButton.addEventListener("click", searchForMangas);
    table.addEventListener("click", selectTableRow);

    window.selectedRows = window.selectedRows ? window.selectedRows : [];

    loadLanguages();

});
