const http          = require('http');
const https         = require('https');
const fs            = require('fs');
const path          = require('path');
const decompress    = require('decompress');
const crypto        = require('crypto');

/**
 * download()
 * @param {*} src where this file is coming from
 * @param {*} location where this file is going on your file system
 */

const download = (src, location) => {
    const dirName = path.dirname(location);
    if((!isDir(dirName)) && dirName) mkdirp( dirName );
    return new Promise(function(resolve, reject) {
        const file = fs.createWriteStream(location);
        if(src.substring(0,6) === 'https:') {
            const request = https.get(src, function(response) {
                response.pipe(file);
            });
        } else if(src.substring(0,5) === 'http:'){
            const request = http.get(src, function(response) {
                response.pipe(file);
            });
        }
        console.log('lib/utils/file.js: donwload(): starting' + src);

        file.on('finish', () => {
            console.log(`lib/utils/file.js: donwload() ${src} finished downloading`);
            console.log(`                              and is located ${location}`);
            resolve(location, src);
        });
        file.on('error', (err) => {
            console.log('lib/utils/file.js: download() had an issue');
            reject(err);
        });
    });
};

const hashFile = (src) => {
    return new Promise(function(resolve, reject) {
        const srcExists = fs.existsSync(src);

        if(srcExists){
            const hash = crypto.createHash('md5');
            const fileStream = fs.createReadStream(src);
            fileStream.on('data', function (data) {
                hash.update(data, 'utf8')
            })
            fileStream.on('end', function () {               
                resolve(hash.digest('hex'));
            })
        } else {
            reject('nope');
        }

    });   
}

const getJson = (src) => {
    const dirName = path.dirname(src);
    if( (!isDir(dirName)) && dirName){
        return {};
    } else {
        try {
            const json = fs.readFileSync(src);
            return JSON.parse(json);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return {}
            } else {
                throw err;
            }
        }
    }
}

/**
 * isDir() check to see if a directory exists easily
 */
const isDir = (dpath) => {
    try {
        return fs.lstatSync(dpath).isDirectory();
    } catch(e) {
        return false;
    }
}

/**
 * mkdirp: makes all the folders in a directory path if they aren't present
 */
const mkdirp = (dirname) => {

    dirname = path.normalize(dirname).split(path.sep);
    dirname.forEach((isdir,index) => {
        var pathInQuestion = dirname.slice(0,index+1).join(path.sep);
        if((!isDir(pathInQuestion)) && pathInQuestion) fs.mkdirSync(pathInQuestion);
    });
}

const unzip = (src, location = '') => {
    return new Promise(function(resolve, reject) {
        if(!location) location = path.dirname(src);
        if((!isDir(location))) mkdirp(location);
        decompress(src, location)
        .then( files => {
            console.log( `lib/utils/file.js: unzip() unzipped ${src} to ${location}` );
            resolve( files );
        })
        .catch((err) => {
            console.log( 'lib/utils/file.js: unzip() had an issue' )
            reject( err );
        });
    });
};

const writeFile = (location, fileData) => {
    const dirName = path.dirname(location);
    if((!isDir(dirName)) && dirName) mkdirp( dirName );
    
    return new Promise(function(resolve, reject) {
        fs.writeFile(location, fileData, (err) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

const writeJson = (location, json) => {
    const dirName = path.dirname(location);
    if((!isDir(dirName)) && dirName) mkdirp( dirName );
    fs.writeFileSync(location, JSON.stringify(json), null, '\t');
}

const writeNdJson = (location, json) => {
    // ND JSON is new line deliniated Json
    const dirName = path.dirname(location);
    if((!isDir(dirName)) && dirName) mkdirp( dirName );
    
    let str = JSON.stringify(json);
    if (fs.existsSync(location)) {
        str = fs.readFileSync(location, 'utf8') + '\n' + str;
    }
    fs.writeFileSync(location, str, null, '\t');
}

module.exports = {
  download:     download,
  getJson:      getJson,
  hashFile:     hashFile,
  isDir:        isDir,
  mkdirp:       mkdirp,
  unzip:        unzip,
  writeFile:    writeFile,
  writeJson:    writeJson,
  writeNdJson:  writeNdJson
};