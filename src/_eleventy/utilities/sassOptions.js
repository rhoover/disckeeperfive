const path = require('path');

module.exports = {
  compileOptions: {
    permalink: function(contents, inputPath) {
      // ignore the critical css files
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith('critical')) {
        return false
      }
      // directory instructions
      return (data) => data.page.filePathStem.replace(/^\/sass\//, "/css/") + ".css";
    }
  },
  sass: {
    style: "compressed"
  },
  rev: true
};