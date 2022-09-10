const axios = require("axios");
const path = require("path")
const fs = require("fs");
const util = require("util");
const stream = require("stream");
const pipeline = util.promisify(stream.pipeline);


const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";

const downloadMangaIntoDirectory = async (directory, mangaDownloadData) => {

    const completePath = path.join(
            directory, 
            mangaDownloadData.mangaName, 
            mangaDownloadData.mangaChapter);

    const downloaded = 0;

    try {

        if (!fs.existsSync(completePath))
            await fs.mkdir(completePath, { recursive: true });

        for (const mangaURL of mangaDownloadData.mangaURLs) {

            const mangaImageName = mangaURL.split("/")[4];
            
            const { data } = await axios.get(`${mangaURL}`, {
                headers: {
                    "User-Agent": USER_AGENT,
                    responseType: "stream",
                }
            });

            await pipeline(data, fs.createWriteStream(`${completePath}/${mangaImageName}`))
            downloaded++;
        }

    } catch (error) {
        console.error(error);
    }

    return downloaded;

}

module.exports = {
    downloadMangaIntoDirectory
}