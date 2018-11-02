#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const H = require('highland')
const JSONStream = require('JSONStream')
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    o: 'output',
    b: 'buurt'
  },
  string: ['b']
})

const GeoJSON = {
  open: '{"type":"FeatureCollection","features":[',
  close: ']}\n',
  separator: ',\n'
}

if (process.stdin.isTTY && !argv._[0]) {
  return console.error(`Usage: index.js [-b buurten] [-o file] FILE\n` +
    `  -b, --buurt  comma seperated list with buurt identifiers, e.g. 03630000000433,03630000000640\n` +
    `  -o, --output   Path to output file, if not given, stdout is used`)
}

const buurtIds = argv.buurt && argv.buurt.split(',')

const rows = H(fs.createReadStream('buildings-amsterdam.csv'))
  .pipe(csv({
    separator: ',',
    quote: '"',
    escape: '"'
  }))

H(rows)
  .filter((row) => buurtIds ? buurtIds.includes(row.buurt_id) : true)
  .map((row) => ({
    type: 'Feature',
    properties: {
      id: row.id,
      bouwjaar: parseInt(row.bouwjaar),
      buurt: {
        id: row.buurt_id,
        naam: row.buurtnaam
      },
      straat: row.openbareruimtenaam,
      nummer: row.huisnummer,
      letter: row.huisletter,
      toevoeging: row.huisnummertoevoeging
    },
    // Use regular expression to strip unneeded coordinate precision
    // See: https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
    geometry: JSON.parse(row.geojson.replace(/(\d+).(\d{0,7})(\d*)/g, "$1.$2"))
  }))
  .pipe(JSONStream.stringify(GeoJSON.open, GeoJSON.separator, GeoJSON.close))
  .pipe(argv.output ? fs.createWriteStream(argv.output, 'utf8') : process.stdout)
