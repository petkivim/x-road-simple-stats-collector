/**
 * The MIT License
 *
 * Copyright (c) 2018 Nordic Institute for Interoperability Solutions (NIIS)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
const tools = require('./functions.js')
const cfg = require('./config.js')

module.exports.collectAndStore = (event, context, callback) => {
  console.time('x-road-simple-stats-collector')
  console.log('Event object:')
  console.log(event)

  const anchorPath = event.anchorPath || process.env.ANCHOR_PATH || cfg.anchorPath
  const url = event.url || process.env.URL || cfg.url

  if (anchorPath) {
    console.log('Use configuration anchor path.')
    const anchorData = tools.readConfAnchor(anchorPath)
    tools.getDirectory(anchorData.downloadURL, anchorData.verificationCert)
  } else if (url) {
    console.log('Use URL.')
    tools.getDirectory(url)
  } else {
    console.log('No \'cfg.anchorPath\' or \'cfg.url\' configured - nothing to do here.')
  }

  console.timeEnd('x-road-simple-stats-collector')
  callback(null)
}
