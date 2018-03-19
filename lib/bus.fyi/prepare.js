const {folderNames}     = require('../../config');
const {fileNames}       = require('../../config');

const {getJsonFromCsv}  = require('../utils/csv');

const {afterToday}      = require('../utils/date');
const {today}           = require('../utils/date');

const {download}        = require('../utils/file');
const {hashFile}        = require('../utils/file');
const {unzip}           = require('../utils/file');
const {writeJson}       = require('../utils/file');

const {cleanString}     = require('../utils/string');
const {fileName}        = require('../utils/string');

const fs = require('fs');

if (fs.existsSync(fileNames.manifest)) {
  var manifest = require('../../' + fileNames.manifest);
} else {
  console.log('lib/bus.fyi :No current manifest');
  var manifest = {};
}

const downloadGTFS = (agency) => {
  return new Promise( function( resolve, reject  ){
    const slug = cleanString(agency.name);
    const location = folderNames.zip + slug + '.zip';
    const zipExists = fs.existsSync(location);
    agency.location = location;
    agency.id = slug;
    if (zipExists 
        && !agency.download
        || manifest[agency.id]
        && afterToday(manifest[agency.id].end_date)
      ){
      resolve(agency)
      .catch((err)=>{reject(err)});
    } else {
      download(agency.zip, location)
      .then(()=>{
        agency.downloadDate = today();
        resolve(agency);
      })
      .catch(()=>{reject()});
    }

  });
}

const hashGTFS = (agency) => {
  return new Promise(function( resolve, reject  ){
      hashFile(agency.location)
      .then((hash)=>{
        agency.hash = hash;
        if (agency.build 
          || manifest[agency.id] 
          && manifest[agency.id].hash !== hash
        ){
          agency.build = true;
        }
        resolve(agency);
      })
      .catch((err)=>{reject(err)});
  });
};

const unzipGTFS = (agency) => {
    return new Promise(function( resolve, reject  ){
      agency.csv = folderNames.unzip + agency.id;
      
      if( agency.build ) {
        unzip(agency.location, agency.csv)
        .then(() => {
          resolve(agency);
        })
        .catch((err) => {
          reject(err);
        });
      } else {
        resolve(agency);
        reject(err);
      }
    });
}

setExpirationDateGTFS = (agency) => {
  return new Promise(function( resolve, reject  ){
    getJsonFromCsv(agency.csv + '/' +fileNames.calendar)
    .then((calendar)=>{

      let start_date = 0;
      let end_date = 0;

      calendar.forEach(function(service) {
        if( 0 < parseInt(service.start_date) < start_date ){
          start_date = parseInt(service.start_date);
        };
        if( parseInt(service.end_date) > end_date ){
          end_date = parseInt(service.end_date);
        };
      }, this);

      agency.start_date = start_date;
      agency.end_date = end_date;
      if (agency.build 
          || manifest[agency.id] 
          && manifest[agency.id].end_date !== end_date 
          && afterToday(end_date)
      ){
          agency.build = true;
      }

      resolve(agency);
    })
    .catch((error)=>{reject(error)});
  });
}

prepareGTFS = (agency) => {
  return new Promise(function( resolve, reject  ){
    downloadGTFS(agency)
    .then(hashGTFS)
    .then(unzipGTFS)
    .then(setExpirationDateGTFS)
    .then((agency)=>{
      if(agency.build === true){
        agency.buildDate = today();
        manifest[agency.id] = agency;
        writeJson(fileNames.manifest, manifest);
      }
      resolve(agency)
      reject();
    })
    .catch((err)=>{reject(err)});
  });
}



module.exports = {
  prepareGTFS: prepareGTFS,
};