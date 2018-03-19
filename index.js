const {cleanString} = require('./lib/utils/string');

const {prepareGTFS} = require('./lib/bus.fyi/prepare');
const {index}       = require('./lib/bus.fyi/indexData');

const {agencies}    = require('./config');
const {folderNames} = require('./config');

for (let i = 0; i < agencies.length; i++) {
    let agency = agencies[i];
    let slug = cleanString(agency.name);
    let location = folderNames.zip + slug + '.zip';
    prepareGTFS(agency)
    .then(index)
    .catch( (err)=>{ console.log(err) } );
}