const fs = require("fs");
const path = require("path");

const getLanguagesJSON = () => {

  const rawdata = fs.readFileSync(path.join(__dirname, "languages.json"));
  var languages = [];

  if (rawdata)
    languages = JSON.parse(rawdata);

  return languages;
}

module.exports = {
    getLanguagesJSON
}