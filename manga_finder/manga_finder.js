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
            // $(".cap").each((index, element) => {
            //     console.log($(element).find("a.btn-caps.w-button").attr("id"))
            //  });
            console.log($(element).children("a").text());
            console.log($(element).children("a").attr("id"));
            results.push({
                chapterNumber: `${$(element).find("a.btn-caps.w-button").attr("id")}`
            });
        });
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

module.exports = {
    getMangaByName,
    getChapterByMangaURL
}