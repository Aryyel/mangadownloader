const axios = require("axios");
const cheerio  = require("cheerio");
// const NEW_MANGA_URL = "https://tsuki-mangas.com/lista-completa&title=";
const NEW_MANGA_URL = "https://mangabr.net/";
const SELECTED_MANGA_URL = "https://tsuki-mangas.com/";
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";

const getMangaByName = async name => {

    const results = [];

    try {
        const { data } = await axios.get(`${NEW_MANGA_URL}${name}`, {
            headers: {
                "User-Agent": USER_AGENT
            }
        } );

        const $ = cheerio.load(data);

		$("a.contentlist").each((index, element) => {;
			results.push({
                mangaName: `${$(element).children(".titlelist b").text()}`,
                mangaDescription: `${$(element).children(".titlelist b").text()}`,
                mangaURL: `${SELECTED_MANGA_URL}${$(element).attr("href")}`
            });
		});
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

const getChapterByMangaURL = async url => {
    const results = {
        url,
        chapterNumbers: []
    };

    try {
        const { data } = await axios.get(`${url}`, {
            headers: {
                "User-Agent": USER_AGENT
            }
        } );

        const $ = cheerio.load(data);

        $(".cap").each((index, element) => {
            results.chapterNumbers.push({
                chapterNumber: `${$(element).find("a.btn-caps.w-button").text()}`
            });
        });
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

const getMangaFilesByChapter = async mangaDownloadData => {
    const { mangaName, chapter, url } = mangaDownloadData;

    const result = {
        mangaName,
        mangaURLs: [],
        chapter,
        url
    };

    try {
        const { data } = await axios.get(`${url}/${chapter}`, {
            headers: {
                "User-Agent": USER_AGENT
            }
        } );

        const $ = cheerio.load(data);

        $("img[id^='img_']").each((index, element) => result.mangaURLs.push(`${$(element).attr("src")}`));
        
    } catch (error) {
        console.error(error);
    }

    return result;
} 

module.exports = {
    getMangaByName,
    getChapterByMangaURL,
    getMangaFilesByChapter
}