// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

/* IIFE function restructure*/
((experimental) => {
    'use strict'
    let mainObject = {
        activeTranslations: {},
        selectedMangas: [],
        languages: [],
        activeLanguageCode: ""
    }

    const title = document.getElementById("title");
    const nameInput = document.getElementById("nameInput");
    const nameInputLabel = document.getElementById("nameInputLabel");
    const searchButton = document.getElementById("searchButton");
    const selectedAmount = document.getElementById("selectedAmount");
    const resultsTitle = document.getElementById("resultsTitle");
    const downloadButton = document.getElementById("downloadButton");
    const table = document.getElementsByTagName("table")[0];
    const tableHeaderName = document.getElementById("tableHeaderName");
    const tableHeaderDescription = document.getElementById("tableHeaderDescription");
    const tableHeaderChapters = document.getElementById("tableHeaderChapters");
    const tableTBody = document.getElementsByTagName("tbody")[0];
    const pathInputLabel = document.getElementById("pathInputLabel");
    const pathInput = document.getElementById("pathInput");
    const closeButton = document.getElementById("closeButton");
    const deselectAllButton = document.getElementById("deselectAllButton");
    const selectAllButton = document.getElementById("selectAllButton");
    const downloadSelectedButton = document.getElementById("downloadSelectedButton");
    const searchAlert = document.getElementById("searchAlert"); 
    const modalAlert = document.getElementById("modalAlert");
    const modalTitle = document.getElementById("modalTitle");
    const modalChapters = document.getElementById("chapters");
    const toastStack = document.getElementById("toastStack");
    
    const ONLY_ALPHANUMERICAL_CHARACTERS = /[^a-zA-Z0-9 ]/g;

    const init = async () => {
        await setLanguages();
        bindEvents([
            { element: searchButton, eventType: "click", event: getMangas },
            { element: table, eventType: "click", event: selectTableRow },
            { element: deselectAllButton, eventType: "click", event: deselectAllChapters },
            { element: selectAllButton, eventType: "click", event: selectAllChapters },
            { element: downloadSelectedButton, eventType: "click", event: downloadSelectedChapters }
        ]);
    }

    const bindEvents = bindings => bindings.forEach(({ element, eventType, event }) => element.addEventListener(eventType, event));

    const validateSearchFields = () => {
        let valid = true;
        
        toggleAlert(searchAlert, true);

        if (!nameInput.value || !pathInput.value){
            toggleAlert(searchAlert);
            searchAlert.innerText = getObjectAttributeByName("activeTranslations").SEARCH_ALERT_ERROR_EMPTY_FIELDS;
            valid = false;
        }
        
        return valid;
    }

    const toggleAlert = (element, override = false) => 
        element && element.classList.contains("d-none") && !override
        ? element.classList.remove("d-none") : element.classList.add("d-none"); 

    const getMangas = async () => {   
        if (!validateSearchFields()) return;
        const results = await window.api.receive("get-mangas-by-name", nameInput.value);

        toggleElementButton(searchButton);
        setElementInnerHTML(tableTBody, null);
        toggleElementButton(searchButton);
        setMangas(results);
    }

    const getChaptersByURL = async event => {

        setElementInnerHTML(modalChapters, null);
        
        const response = await window.api.receive("get-chapters", event.target.getAttribute("manga"));
        const mangaName = event.target.closest("tr").querySelector(".mangaName").innerText;
    
        if (!response || !mangaName) return;

        
        setChapters(response);
        setElementInnerHTML(modalTitle, mangaName);
    }

    const getCurrentLanguage = () => getObjectAttributeByName("languages").filter(language => language.code === getObjectAttributeByName("activeLanguageCode"))[0].translations

    const getObjectAttributeByName = attributeName => mainObject[attributeName];

    const setObjectAttributeByName = (attributeName, object) => mainObject[attributeName] = object;

    const setLanguages = async () => {
        const response = await window.api.receive("get-languages");
        if (!response || !response.languages) return;
        
        setObjectAttributeByName("languages", response.languages);
        setObjectAttributeByName("activeLanguageCode", "pt-BR");
        setTranslations(getObjectAttributeByName("languages").filter(language => language.code === getObjectAttributeByName("activeLanguageCode"))[0].translations);
    }

    const setElementInnerHTML = (element, html) => element.innerHTML = html;

    const setTranslations = translations => {
        setObjectAttributeByName("activeTranslations", translations);
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
    }

    const setMangas = results => {
        if (!results || !table || !tableTBody) return;
        
        for (const result of results) {
            const newRow = tableTBody.insertRow();
            newRow.innerHTML = `<tr>
                                    <td class="mangaName">${result.mangaName}</td>
                                    <td class="mangaDescription">${result.mangaDescription}</td>
                                    <td class="mangaHeaderChapters">
                                        <button type="button" class="btn btn-success" 
                                        manga="${result.mangaURL}"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#chaptersModal">${getObjectAttributeByName("activeTranslations").TABLE_HEADER_SELECT_CHAPTERS_BUTTON}</button>
                                    </td>
                                    <td class="d-none">${result.mangaURL}</td>
                                </tr>`;

            const newRowButton = newRow.querySelector("button");
            newRowButton.addEventListener("click", getChaptersByURL);
        }
        
    }

    const setChapters = results => {
        if (!results || !results.chapterNumbers || !modalChapters || !modalTitle) return;
        
        for (const result of results.chapterNumbers) {
            const newChapterButton = htmlToElement(`
                <a class="btn btn-primary mb-1" style="width: 65px;" type="submit" chapter="${result.chapterURL}">${result.chapterNumber}</a>
            `); //data-bs-toggle="button" to use bootstrap's version
            
            modalChapters.append(newChapterButton);
            newChapterButton.addEventListener("click", toggleChapter);
        }

        modalTitle.setAttribute("manga-url", results.url);
    }

    const setButtonText = (element, text) => element.innerHTML = text;

    const setSelectedAmount = amount => {
        const newAmount = parseInt(selectedAmount.getAttribute("amount")) + amount;
        selectedAmount.innerText = `${getObjectAttributeByName("activeTranslations").SELECTED_AMOUNT_TEXT}: ${newAmount}`
        selectedAmount.setAttribute("amount", newAmount);
    }

    const removeDeselectedChapters = (mangaName, chapterNumber) => {
        const selectedManga = getObjectAttributeByName("selectedMangas").find(selectedManga => selectedManga.mangaName === mangaName);

        if (selectedManga)
            getObjectAttributeByName("selectedMangas").find(selectedManga => selectedManga.mangaName === mangaName).chapters = selectedManga.chapters.filter(chapter => chapter !== chapterNumber);
    }

    const addSelectedChapters = (mangaName, chapterNumber) => {
        const selectedManga = getObjectAttributeByName("selectedMangas").find(selectedManga => selectedManga.mangaName === mangaName);

        if (selectedManga){
            getObjectAttributeByName("selectedMangas").find(selectedManga => selectedManga.mangaName === mangaName).chapters.push(chapterNumber);
        }
        else {
            getObjectAttributeByName("selectedMangas").push({
                mangaName,
                chapters: [ chapterNumber ]
            }); 
        }
    }   

    const deselectAllChapters = () => {
        for (const chapter of document.querySelectorAll("#chapters a")){
            chapter.classList.remove("active");
            chapter.setAttribute("aria-pressed", "false");
            removeDeselectedChapters(modalTitle.innerText, chapter.innerText);
        }
    }

    const selectAllChapters = () => {
        for (const chapter of document.querySelectorAll("#chapters a")){
            chapter.classList.add("active");
            chapter.setAttribute("aria-pressed", "true");
            addSelectedChapters(modalTitle.innerText, chapter.innerText);
        }
    }

    const toggleChapter = event => {
        if (event.target.classList.contains("active")){
            event.target.classList.remove("active");
            event.target.setAttribute("aria-pressed", "false");
            removeDeselectedChapters(modalTitle.innerText, event.target.innerText);
        }
        else {
            event.target.classList.add("active");
            event.target.setAttribute("aria-pressed", "true");
            addSelectedChapters(modalTitle.innerText, event.target.innerText);
        } 

    }

    const downloadSelectedChapters = async () => {
        const directory = pathInput.value;
        const mangaName = modalTitle.innerText;
        const url = modalTitle.getAttribute("manga-url");
        const selectedManga = getObjectAttributeByName("selectedMangas").find(selectedManga => selectedManga.mangaName === mangaName);
        const translations = {
            spinnerTranslation: getObjectAttributeByName("activeTranslations").DOWNLOADING_TEXT,
            buttonTextTranslation: getObjectAttributeByName("activeTranslations").MODAL_DOWNLOAD_BUTTON
        };
        const chaptersToDownload = {
            directory,
            mangaName,
            url,
            chapter: null
        };

        if (!downloadSelectedButton|| !directory || !mangaName || !url || !selectedManga){
            toggleAlert(modalAlert);
            modalAlert.innerText = getObjectAttributeByName("activeTranslations").MODAL_ALERT_ERROR_EMPTY_FIELDS;
            return;
        }
        
        toggleElementButton(downloadSelectedButton, translations);
        for (const chapter of selectedManga.chapters) {
            chaptersToDownload.chapter = chapter;
            await window.api.receive("get-manga-files-by-chapter", chaptersToDownload);
            createNotificationToast(chaptersToDownload.mangaName, chaptersToDownload.chapter);
        };
        toggleElementButton(downloadSelectedButton, translations);
        
        window.api.send("open-downloaded-results", createValidPath(directory, mangaName));
    }

    const htmlToElement = html =>  {
        const template = document.createElement("template");
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    const toggleElementButton = element => {
        element && element.disabled 
            ? element.removeAttribute("disabled") 
            : element.setAttribute("disabled", "disabled");
        
        toggleLoading(element);
    }

    const toggleLoading = (element) => 
        element && element.disabled 
            ? element.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>${getObjectAttributeByName("activeTranslations").LOADING_TEXT}</span>`
            : element.innerHTML = getObjectAttributeByName("activeTranslations").SEARCH_BUTTON_TEXT;

    const toggleSelectedRow = row => {
        
        if (!row) return;

        let amountToUpdate = 0;

        if (row.classList.contains("table-active")){
            amountToUpdate--;
            row.classList.remove("table-active");
            setObjectAttributeByName("selectedMangas", getObjectAttributeByName("selectedMangas").filter(selectedManga => selectedManga.mangaName !== row.querySelector("td[class='mangaName']").innerText)); 
        }
        else{
            amountToUpdate++;
            row.classList.add("table-active");
            getObjectAttributeByName("selectedMangas").push({
                mangaName: row.querySelector("td[class='mangaName']").innerText,
                chapters: []
            }); 
        }

        setSelectedAmount(amountToUpdate);
    }   

    const selectTableRow = event => {
        event.stopPropagation();
        const { target } = event;
        const { parentElement } = target;

        if (target.tagName !== "TD") return;

        toggleSelectedRow(parentElement);
    }

    const createValidPath = (directory, mangaName) => directory && mangaName ? `${directory}\\${mangaName.replace(ONLY_ALPHANUMERICAL_CHARACTERS, "")}` : "";

    const createNotificationToast = (mangaName, mangaChapter) => {

        const html = htmlToElement(
                        `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <i class="bi bi-cloud-download" style="margin-right: 5px;"></i>
                                <strong class="me-auto">${mangaName}</strong>
                                <small class="text-body-secondary">${getCurrentLanguage().CHAPTER_DOWNLOADED_TIME}</small>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">${getCurrentLanguage().CHAPTER_DOWNLOADED_1} ${mangaChapter} ${getCurrentLanguage().CHAPTER_DOWNLOADED_2}</div>
                        </div>`
                    );

        toastStack.append(html);
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(html);
        toastBootstrap.show();
    }

    experimental.init = init || {};

})(window.experimental = window.experimental || {}); 

window.addEventListener("load", window.experimental.init);