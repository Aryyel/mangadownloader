const axios = require("axios");
const path = require("path")
const fs = require("fs");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";
const ONLY_ALPHANUMERICAL_CHARACTERS = /[^a-zA-Z0-9 ]/g;

const downloadMangaIntoDirectory = async (directory, mangaDownloadData, mainWindow) => {
    
    const completePath = path.join(
            directory, 
            mangaDownloadData.mangaName.replace(ONLY_ALPHANUMERICAL_CHARACTERS, ""), 
            mangaDownloadData.chapter);

    let downloaded = 0;
    let progressBarValue = 0;
    const progressBarValuePerItem = 1 / mangaDownloadData.mangaURLs.length;

    try {
        let createDir = !fs.existsSync(completePath) ? await fs.promises.mkdir(completePath, { recursive: true }) : completePath;

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
            mainWindow.setProgressBar(progressBarValue += progressBarValuePerItem);
        }

    } catch (error) {
        console.error(error);
    }

    mainWindow.setProgressBar(-1);

    return downloaded;

}

module.exports = {
    downloadMangaIntoDirectory
}