const axios = require("axios");
const cheerio  = require("cheerio");
const MANGA_HOST_URL = "https://mangahosted.com/find/";

const getMangaByName = async name => {

    const results = [];

    try {
        const { data } = await axios.get(`${MANGA_HOST_URL}${name}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36"
            }
        } );

        const $ = cheerio.load(data);

		$("td:not([width])").each((index, element) => {
			results.push({
                mangaName: `${$(element).children(".entry-title").text()}`,
                mangaDescription: `${$(element).children(".entry-content").text()}`
            });
		});
        
    } catch (error) {
        console.error(error);
    }

    return results;
}

module.exports = {
    getMangaByName
}