const path = require('path')
const packagesDir = require(__dirname, 'packages')
console.log(packagesDir, '====')
const masterVersion = require('./package.json').version
// const outputConfigs = {
//   'esm-bundler': {
//     file: resolve(`dist/${name}.esm-bundler.js`),
//     format: `es`
//   },
//   'esm-browser': {
//     file: resolve(`dist/${name}.esm-browser.js`),
//     format: `es`
//   },
//   cjs: {
//     file: resolve(`dist/${name}.cjs.js`),
//     format: `cjs`
//   },
//   global: {
//     file: resolve(`dist/${name}.global.js`),
//     format: `iife`
//   },
//   // runtime-only builds, for main "vue" package only
//   'esm-bundler-runtime': {
//     file: resolve(`dist/${name}.runtime.esm-bundler.js`),
//     format: `es`
//   },
//   'esm-browser-runtime': {
//     file: resolve(`dist/${name}.runtime.esm-browser.js`),
//     format: 'es'
//   },
//   'global-runtime': {
//     file: resolve(`dist/${name}.runtime.global.js`),
//     format: 'iife'
//   }
// }

export default {}
