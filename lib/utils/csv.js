const {writeJson}       = require('./file');
const {writeNdJson}     = require('./file');
const {fileName}        = require('./string');

const csvtojson         = require('csvtojson');
const fs                = require('fs');
const os                = require('os');

const getJsonFromCsv = (src) => {
    return new Promise(function(resolve, reject) {
        if( !fs.existsSync(src) ){
            console.log('lib/utils.csv.js getJsonFromCsv(): file doesn\'t exist: ' + src);
            reject(src);
        };
        const json = [];
        csvtojson()
        .fromFile(src)
        .on('json',(jsonObj, rowIndex)=>{
            json.push(jsonObj);
        })
        .on('done',(error)=>{
            if(!error){
                resolve(json);
            } else {
                reject(error);
            }
        });
    });
}

const indexCsv = ( props ) => {
    // props src, location, index, locationKey
    const folder = props.location + fileName(props.src) + '/';
    const index = props.index;
    const keys = [];
    for (let key in index) {
        keys.push(key);
    }
    return new Promise(function(resolve, reject) {
        console.log(props.src);
        csvtojson()
        .fromFile(props.src)
        .on('json',(jsonObj, rowIndex) => {
            if (
                keys.length > 0 && !props.test || 
                keys.length > 0 && rowIndex < props.test
            ){
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = jsonObj[key];
                    
                    // check for filter, and if it exists, 
                    if( index[key].hasOwnProperty('_filter') ){
                        jsonObj = index[key]._filter(jsonObj);
                    }

                    if( !index[key].hasOwnProperty(value) ) index[key][value] = [];
                    index[key][value].push( jsonObj[props.locationKey] );
                }
                const location = props.folder + jsonObj[props.locationKey] + '.json';
                if(props.ndJson){
                    writeNdJson(location, jsonObj);
                } else {
                    writeJson(location, jsonObj);
                }
            }                
        })
        .on('done',(error)=>{
            if(!error){
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if( !index[key].hasOwnProperty('_filter') ){
                        delete index[key]._filter;
                    }
                    const location = props.folder + '_' + key + '.json';
                    writeJson(location, index[key]);
                }
                resolve(props.src);
            } else {
                console.log('lib/utils.csv.js indexCsv(): Something went wrong');
                reject(error);
            }
        });
    });
}

module.exports = {
  getJsonFromCsv:   getJsonFromCsv,
  indexCsv:         indexCsv
};