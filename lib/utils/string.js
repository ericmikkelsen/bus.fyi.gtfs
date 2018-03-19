const path = require('path');

exports.cleanString = (str) => {
    return str.replace(/\s+/g, '-').toLowerCase();
};

exports.fileName = (src) => {
    fileObject = path.parse(src);
    return fileObject.name;
}

exports.stringBytes = (str) => {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

exports.paginateByFileSize = ( {props} ) => {
    // needs return statement
    const defaultProps = {
        footer: '</body></html>',
        header: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>:root{font:1.5em/1.5 sans-serif;font:calc(1em + .75vw)/1.5 sans-serif;color:#fff;background-color:#000;letter-spacing:.1em;box-sizing:border-box}*{font-size:1em;line-height:1.5}*+*{margin-top:1.5em}body{max-width:30em;margin:0 auto;padding:0 5% 5%}a{color:inherit;text-decoration:none;border-bottom:.1875rem solid #737373}.nav,.nav *{list-style-type:none;padding:0;margin:0}.nav li+li{margin:1.5em 0 0}.header{display:flex;justify-content:space-between;margin:0}.header *{display:inline-block;padding-top:25%;margin:0}.header-logo{font-weight:700;margin-right:3em}.action,.linkList a{font-weight:800;font-size:2em}.details{margin-top:0;padding:.75em 0}.label{color:#737373;font-size:1em;margin-top:3em}</style></head><body>',
        src: [],
        pageinateView: false,
        listView: false,
        size: 10000
    }
    props = Object.assign({}, defaultProps, props);
    const baseSize = stringBytes( props.header + props.footer );
    const limit = props.size - baseSize;
    console.log(limit);
}