// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

window.addEventListener("load", () => { 

    const removeDeselectedChapters = (mangaName, chapterNumber) => {
        const selectedManga = window.selectedMangas.find(selectedManga => selectedManga.mangaName == mangaName);

        if (selectedManga)
            window.selectedMangas.find(selectedManga => selectedManga.mangaName == mangaName).chapters = selectedManga.chapters.filter(chapter => chapter !== chapterNumber);
        
    }

    const addSelectedChapters = (mangaName, chapterNumber) => {
        const selectedManga = window.selectedMangas.find(selectedManga => selectedManga.mangaName == mangaName);

        if (selectedManga){
            window.selectedMangas.find(selectedManga => selectedManga.mangaName == mangaName).chapters.push(chapterNumber);
        }
        else {
            window.selectedMangas.push({
                mangaName,
                chapters: [ chapterNumber ]
            }); 
        }
    }   

    const deselectAllChapters = () => {
        const modalTitle = document.getElementById("modalTitle");

        for (const chapter of document.querySelectorAll("#chapters a")){
            chapter.classList.remove("active");
            chapter.setAttribute("aria-pressed", "false");
            removeDeselectedChapters(modalTitle.innerText, chapter.innerText);
        }
    }

    const selectAllChapters = () => {
        const modalTitle = document.getElementById("modalTitle");

        for (const chapter of document.querySelectorAll("#chapters a")){
            chapter.classList.add("active");
            chapter.setAttribute("aria-pressed", "true");
            addSelectedChapters(modalTitle.innerText, chapter.innerText);
        }
    }

    const toggleChapter = event => {
        const modalTitle = document.getElementById("modalTitle");
        const chapterElement = event.target;

        if (chapterElement.classList.contains("active")){
            chapterElement.classList.remove("active");
            chapterElement.setAttribute("aria-pressed", "false");
            removeDeselectedChapters(modalTitle.innerText, chapterElement.innerText);
        }
        else {
            chapterElement.classList.add("active");
            chapterElement.setAttribute("aria-pressed", "true");
            addSelectedChapters(modalTitle.innerText, chapterElement.innerText);
        } 

    }

    const downloadSelectedChapters = async () => {

        const modalAlert = document.getElementById("modalAlert");
        const downloadSelectedButton = document.getElementById("downloadSelectedButton");
        const directory = document.getElementById("pathInput").value;
        const mangaName = document.getElementById("modalTitle").innerText;
        const url = document.getElementById("modalTitle").getAttribute("manga-url");
        const selectedManga = window.selectedMangas.find(selectedManga => selectedManga.mangaName == mangaName);
        const translations = {
            spinnerTranslation: window.activeTranslations.DOWNLOADING_TEXT,
            buttonTextTranslation: window.activeTranslations.MODAL_DOWNLOAD_BUTTON
        };
        const chaptersToDownload = {
            directory,
            mangaName,
            url,
            chapter: null
        };

        if (!downloadSelectedButton|| !directory || !mangaName || !url || !selectedManga){
            toggleAlert(modalAlert);
            modalAlert.innerText = window.activeTranslations.MODAL_ALERT_ERROR_EMPTY_FIELDS;
            return;
        }

        
        toggleElementButton(downloadSelectedButton, translations);
        for (const chapter of selectedManga.chapters) {
            chaptersToDownload.chapter = chapter;
            await window.api.receive("get-manga-files-by-chapter", chaptersToDownload);
        };
        toggleElementButton(downloadSelectedButton, translations);
    }

    const htmlToElement = html =>  {
        const template = document.createElement("template");
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    const insertChaptersIntoModal = results => {

        const modalChapters = document.getElementById("chapters");
        const modalTitle = document.getElementById("modalTitle");

        if (!results || !results.chapterNumbers || !modalChapters || !modalTitle)
            return;
        
        for (const result of results.chapterNumbers) {
            const newChapterButton = htmlToElement(`<a class="btn btn-primary mb-1" style="width: 65px;" 
            type="submit">${result.chapterNumber}</a>`); //data-bs-toggle="button" to use bootstrap's version
            
            modalChapters.append(newChapterButton);
            newChapterButton.addEventListener("click", toggleChapter);
        }

        modalTitle.setAttribute("manga-url", results.url);
    }

    const loadChaptersByMangaURL = async event => {
        
        const modalTitle = document.getElementById("modalTitle");
        const mangaName = event.target.closest("tr").querySelector(".mangaName").innerText;
        const chapters = document.getElementById("chapters");
        clearElementInnerHTML(chapters);
        clearElementInnerHTML(modalTitle);
        modalTitle.setAttribute("manga-url", "");
        const response = await window.api.receive("get-chapters", event.target.getAttribute("manga"));

        if (!response)
            return;
        
        insertChaptersIntoModal(response);
        insertElementInnerHTML(modalTitle, mangaName);
    }

    const toggleElementButton = (element, translations) => {
        if (!element)
            return;

        element.disabled 
            ? element.removeAttribute("disabled") 
            : element.setAttribute("disabled", "");
        
        toggleLoading(element, translations);
    }

    const toggleLoading = (element, translations) => 
        element && element.disabled 
            ? element.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>${translations.spinnerTranslation}</span>`
            : element.innerHTML = translations.buttonTextTranslation;
    
    const updateSelectedAmount = amount => {
        const selectedAmount = document.getElementById("selectedAmount");
        const newAmount = parseInt(selectedAmount.getAttribute("amount")) + amount;
        selectedAmount.innerText = `${window.activeTranslations.SELECTED_AMOUNT_TEXT}: ${newAmount}`
        selectedAmount.setAttribute("amount", newAmount);
    }

    const toggleSelectedRow = row => {
        
        if (!row)
            return;

        if (row.classList.contains("table-active")){
            row.classList.remove("table-active");
            window.selectedMangas = window.selectedMangas.filter(selectedManga => selectedManga.mangaName !== row.querySelector("td[class='mangaName']").innerText)
            updateSelectedAmount(-1);
        }
        else{
            row.classList.add("table-active");
            window.selectedMangas.push({
                mangaName: row.querySelector("td[class='mangaName']").innerText,
                chapters: []
            }); 
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

    const toggleAlert = (element, override = false) => 
        element && element.classList.contains("d-none") && !override
        ? element.classList.remove("d-none") : element.classList.add("d-none"); 

    const validateSearchFields = () => {
        const translations = window.activeTranslations;
        const searchAlert = document.getElementById("searchAlert");
        const nameInput = document.getElementById("nameInput");
        const pathInput = document.getElementById("pathInput");
        let errors = false;
        
        toggleAlert(searchAlert, true);

        if (!nameInput.value || !pathInput.value){
            toggleAlert(searchAlert);
            searchAlert.innerText = translations.SEARCH_ALERT_ERROR_EMPTY_FIELDS;
            errors = true;
        }
        
        return errors;
    }

    const searchForMangas = async () => {   
        const errors = validateSearchFields(); 
        if (errors)
            return;

        const searchButton = document.getElementById("searchButton");
        const translations = {
            spinnerTranslation: window.activeTranslations.LOADING_TEXT,
            buttonTextTranslation: window.activeTranslations.SEARCH_BUTTON_TEXT
        };
        toggleElementButton(searchButton, translations);
        const results = await window.api.receive("get-mangas-by-name", document.getElementById("nameInput").value);
        clearElementInnerHTML(document.getElementsByTagName("tbody") ? document.getElementsByTagName("tbody")[0] : null);
        insertMangaResults(results);
        toggleElementButton(searchButton, translations);
    }

    const insertElementInnerHTML = (element, html) => {
        if (!element || !html)
            return;

        element.innerHTML = html;
    }

    const clearElementInnerHTML = element => element.innerHTML = null;

    const insertMangaResults = results => {
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
        const pathInputLabel = document.getElementById("pathInputLabel");
        const pathInput = document.getElementById("pathInput");
        const closeButton = document.getElementById("closeButton");
        const deselectAllButton = document.getElementById("deselectAllButton");
        const selectAllButton = document.getElementById("selectAllButton");
        const downloadSelectedButton = document.getElementById("downloadSelectedButton");
        const searchAlert = document.getElementById("searchAlert");
        
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
        pathInputLabel.innerText = translations.PATH_INPUT_LABEL;
        pathInput.placeholder = translations.PATH_INPUT_PLACEHOLDER;
        closeButton.innerText = translations.MODAL_CLOSE_BUTTON;
        deselectAllButton.innerText = translations.MODAL_DESELECT_ALL_BUTTON;
        selectAllButton.innerText = translations.MODAL_SELECT_ALL_BUTTON;
        downloadSelectedButton.innerText = translations.MODAL_DOWNLOAD_BUTTON;

        window.activeTranslations = translations;
    }

    const searchButton = document.getElementById("searchButton");
    const table = document.getElementsByTagName("table")[0];
    const deselectAllButton = document.getElementById("deselectAllButton");
    const selectAllButton = document.getElementById("selectAllButton");
    const downloadSelectedButton = document.getElementById("downloadSelectedButton");

    searchButton.addEventListener("click", searchForMangas);
    table.addEventListener("click", selectTableRow);
    deselectAllButton.addEventListener("click", deselectAllChapters);
    selectAllButton.addEventListener("click", selectAllChapters);
    downloadSelectedButton.addEventListener("click", downloadSelectedChapters);

    window.selectedMangas = window.selectedMangas ? window.selectedMangas : [];

    loadLanguages();

});
