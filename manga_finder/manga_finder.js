const axios = require("axios");
const cheerio  = require("cheerio");
const MANGA_HOST_URL = "https://mangahosted.com/find/";
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";

const getMangaByName = async name => {

    const results = [];

    try {
        const { data } = await axios.get(`${MANGA_HOST_URL}${name}`, {
            headers: {
                "User-Agent": USER_AGENT
            }
        } );

        const $ = cheerio.load(data);

		$("td:not([width])").each((index, element) => {
            console.log($(element).find(".entry-title a").attr("href"));
			results.push({
                mangaName: `${$(element).children(".entry-title").text()}`,
                mangaDescription: `${$(element).children(".entry-content").text()}`,
                mangaURL: `${$(element).find(".entry-title a").attr("href")}`
            });
		});
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

const getChapterByMangaURL = async url => {
    const results = [];

    try {
        const { data } = await axios.get(`${url}`, {
            headers: {
                "User-Agent": USER_AGENT
            }
        } );

        const $ = cheerio.load(data);

        $(".cap").each((index, element) => {
            console.log($(element).children("a.btn-caps.w-button").text());
            console.log($(element).children("a.btn-caps.w-button").attr("id"));
            results.push({
                chapterNumber: `${$(element).find("a.btn-caps.w-button").text()}`
            });
        });
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

const getMangaFilesByChapter = async (mangaName, url, chapter) => {
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

        $("img[id^='img_").each((index, element) => {
            //https://img-host.filestatic3.xyz/mangas_files/overlord/67.2/img_or0307221621_0001.jpg
            result.mangaURLs.push({
                chapterUrl: `${$(element).attr("src")}`
            });
        });
        
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