/**
 * The MIT License
 *
 * Copyright (c) 2018 Petteri Kivimäki
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
const config = module.exports = {}

// N.B.! Configure only 1) config.anchorPath OR 2) config.url, but NOT both
// at the same time. In case both are configured config.anchorPath is used.

// Path to locally stored configuration anchor file
config.anchorPath = '/path/to/configuration_anchor.xml'

// Global conf directory URL - "downloadURL" from configuration anchor
// config.url = 'http://xxx.xxx.xxx.xxx/internalconf'

// Shared parameters configuration part name
config.sharedParams = 'SHARED-PARAMETERS'
// Verification certificate hash label name
config.verificationCertificateHash = 'verification-certificate-hash'
// File where the results are saved.
config.resultsFile = 'results.json'
// Use random results file name.
config.randomResultsFile = false
// Print results to console.
config.resultsToConsole = true
