const shouldInstrumentCode = 'INSTRUMENT_CODE' in process.env

module.exports = {
  "presets": ["next/babel"],
  "plugins": shouldInstrumentCode ? ["istanbul"] : []
}

console.dir(module.exports, {depth: null})