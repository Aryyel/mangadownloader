/*
    IIFE function restructure

(() => {
    
    const init = () => {

    }

    const loadLanguages = async () => {
        const response = await window.api.receive("get-languages");
        if (!response || !response.languages)
            return;
        
        window.languages = response.languages;
        window.activeLanguageCode = "pt-BR";
        insertTranslations(window.languages.filter(language => language.code === window.activeLanguageCode)[0].translations);
    }

})(window.init || {}); */