const fs = require("fs");

const getLanguagesJSON = () => {

    const rawdata = fs.readFileSync("languages/languages.json");
    var languages = [];
  
    if (rawdata)
      languages = JSON.parse(rawdata);
  
    return languages;
}

module.exports = {
    getLanguagesJSON
}