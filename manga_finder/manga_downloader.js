const axios = require("axios");
const path = require("path")
const fs = require("fs");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";

const downloadMangaIntoDirectory = async (directory, mangaDownloadData) => {

    const completePath = path.join(
            directory, 
            mangaDownloadData.mangaName, 
            mangaDownloadData.chapter);

    let downloaded = 0;

    try {
        let createDir = null;
        if (!fs.existsSync(completePath))
            createDir = await fs.promises.mkdir(completePath, { recursive: true });
        else
            createDir = completePath;

        if (!createDir)
            throw new Error("Dir was not created");

        for (const mangaURL of mangaDownloadData.mangaURLs) {

            const mangaImageName = mangaURL.split("/").slice(-1)[0];

            const { data } = await axios({
                method:"GET",
                url: `${mangaURL}`,
                "User-Agent": USER_AGENT,
                responseType: "stream"
            });
            const pf = await new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(`${completePath}/${mangaImageName}`);
                data.pipe(writer);
                writer.on("finish", resolve("success"));
                writer.on("error", reject(error));
                
            });

            if (!pf)
                throw pf;

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