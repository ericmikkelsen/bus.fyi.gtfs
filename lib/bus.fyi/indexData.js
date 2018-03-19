const csvtojson     = require('csvtojson');
const jsondir       = require('jsondir');
const fs            = require('fs');

const {indexCsv}    = require('../utils/csv');
const {writeJson}   = require('../utils/file');
const {fileName}    = require('../utils/string');

const {folderNames} = require('../../config');
const {fileNames}   = require('../../config');

if (fs.existsSync('../../' + fileNames.manifest)) {
  var manifest = require('../../' + fileNames.manifest);
} else {
  var manifest = {}
}

const routes = {
  _filter: false,
  index: {
    route_type: {}
  },
  ndJson: false,
  locationKey: "route_id",
  src: 'routes.txt',
  test: false,
}

const stop_times = {
  _filter: false,
  index: {
    stop_id: {}
  },
  ndJson: true,
  locationKey: "trip_id",
  src: 'stop_times.txt',
  test: false,
};

const stopFilter = (stop) => {
  if(stop.hasOwnProperty('stop_lat') && stop.hasOwnProperty('stop_lon')){
    stop._xy = parseFloat(stop.stop_lat).toFixed(4) + 'x' + parseFloat(stop.stop_lon).toFixed(4);
  }
  return stop;
};

const stops = {
  _filter: stopFilter,
  index: {
    _xy: {}
  },
  ndJson: false,
  locationKey: "stop_id",
  src: 'stops.txt',
  test: false,
};

const trips =   {
  _filter: false,
  index: {
    route_id: {},
    service_id: {}
  },
  ndJson: false,
  locationKey: "trip_id",
  src: 'trips.txt',
  test: false,
};

const indexGtfsProps = [
  routes,
  stop_times,
  stops,
  trips
];

const indexGtfs = (agency) => {
  const srcFolder = folderNames.unzip + agency.id + '/';
  const locationFolder = folderNames.data + agency.id + '/';

  return new Promise(function( resolve, reject ){
    const promises = [];
    for (let i = 0; i < indexGtfsProps.length; i++) {
      let props = indexGtfsProps[i];
      props.src = srcFolder + props.src;
      props.folder = locationFolder + fileName(props.src) + '/';
      promises.push = indexCsv( props );
    }
    Promise.all(promises)
    .then( resolve(agency) )
    .catch( (err) => { reject(err) } );
  });
};

const index = (agency) => {
  return new Promise(function( resolve, reject  ){
    if (agency.build) {
        indexGtfs(agency)
        .then(() => {resolve(agency)})
        .catch(reject('build(): reject'));
    } else {
        console.log('build(): no build today');
        resolve(agency);
        reject(agency);
    }
  });
}

module.exports = {
  index: index,
};