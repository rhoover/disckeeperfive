const fs = require('fs');
const cache = require('./cacheName.js');

function dealWithContent(callback) {
  fs.readFile('src/_eleventy/utilities/service-worker-base.js', 'utf8', (err, data) => { 
    if(err) { 
      throw err; 
    } else {
      callback(null, data);
    };
  });
};

dealWithContent((err, content) => {

  let newFile = `(() => {
    "use strict";

    let cacheName = '${cache}';

    ${content};

    })();
    `;
  
  fs.writeFile('./disckeeper-service-worker.js', newFile, (err) => {
    if (err) {
      console.log('error writing:', err);
    } else {
      console.log('success writing');
    }
  });
});
