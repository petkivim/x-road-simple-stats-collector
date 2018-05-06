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
const axios = require('axios')
const cfg = require('./config.js')
const stringSearcher = require('string-search')
const xmldoc = require('xmldoc')
const crypto = require('crypto')
const fs = require('fs')
const url = require('url')

module.exports = {
  readConfAnchor: function(path) {
    console.log("Execute 'readConfAnchor'.")
    // Check that the given file exists
    if(!fs.existsSync(path)) {
      console.log('No such file or directory.')
      return null
    }
    // Read configuration anchor from file
    const data = fs.readFileSync(path, 'utf8')
    const xml = new xmldoc.XmlDocument(data)
    // Get the values of downloadURL and verificationCert elements, and
    // return an object that contains them
    return {
      downloadURL: xml.valueWithPath("source.downloadURL"),
      verificationCert: xml.valueWithPath("source.verificationCert")
    }
  },
  getDirectory: function(configURL, verificationCert) {
    console.log("Execute 'getDirectory'.")
    // Get configuration directory from the defined URL
    axios.get(configURL)
      .then(function(response){
        // If verification certificate is available, verify the certificate
        // and the signature. If not, jump reading data.
        if(verificationCert !== undefined) {
          verifyCertificateHash(response.data, configURL, verificationCert)
        } else {
          console.log("Skip 'verifyCertificateHash' and 'verifySignature'. No certificate available.")
          readSharedParamsInfo(response.data, configURL)
        }
      }).catch(function(error) {
        console.log(error)
      })
  }
}

function verifyCertificateHash(directory, configURL, verificationCert) {
  console.log("Execute 'verifyCertificateHash'.")
  stringSearcher.find(directory, cfg.verificationCertificateHash)
    .then(function(resultArr) {
      // Get verification certificate hash from the directory
      const verificationCertHash = resultArr[0].text.match(/: (.+);/)[1].trim()
      // Base64 decode verification certificate read from configuration anchor
      const decodedVerificationCert = Buffer.from(verificationCert, 'base64')
      // Calculate hash for verification certificate read from configuration anchor
      const decodedVerificationCertHash = crypto.createHash('sha512').update(decodedVerificationCert, 'utf8').digest('base64').trim()
      // Verify hash
      if(decodedVerificationCertHash !== verificationCertHash) {
        throw "Verification certificate hashes do not match!"
      }
      // Get signature
      const signature = directory.split("\n")[resultArr[0].line + 1].trim()

      verifySignature(directory, configURL, verificationCert, signature)
  }).catch(function(error) {
    console.log(error)
  })
}

function verifySignature(directory, configURL, verificationCert, signature) {
  console.log("Execute 'verifySignature'.")
  try {
      // Read directory content included in the signature.
      // The content starts from the boundary of the first part that
      // contains the expire date.
      const signedData = directory.match(/^Content-Type: multipart\/mixed.+?boundary=(.+?)$[\W\w]+?(^--\1[\W\w]+\1(--|)[\n\r]*?)[\n\r]{0,2}--/mi)[2]

      // Create a Verify object
      const verify = crypto.createVerify('RSA-SHA512')
      // Add data to be signed
      verify.write(signedData);
      verify.end();
      // Add headers to the certificate
      const publicKey = '-----BEGIN CERTIFICATE-----\n' + verificationCert + '\n-----END CERTIFICATE-----'
      // Verify signature
      if(!verify.verify(publicKey, signature, 'base64')) {
        throw "Verifiying the directory signature failed!"
      }
      readSharedParamsInfo(directory, configURL)
  } catch(error) {
    console.log(error)
  }
}

function readSharedParamsInfo(directory, configURL) {
  console.log("Execute 'readSharedParamsInfo'.")
  stringSearcher.find(directory, cfg.sharedParams)
    .then(function(resultArr) {
      // Get the line number of "configurationPart"
      const lineNumber = resultArr[0].line
      // Get instance identifier
      const instanceIdentifier = resultArr[0].text.match(/instance=['"](.+)['"]/)[1]
      // Split configuration directory to lines
      const lines = directory.split("\n")
      // Get "SHARED-PARAMETERS" URL
      // Line format: "Content-location: /V2/xxxxxxx.xml"
      const path = lines[lineNumber].split(":")[1].trim()
      // Get configuration part hash
      const hash = lines[lineNumber + 3].trim()
      // Create an object containing path and hash
      const sharedParamsInfo = {
        path: path,
        hash: hash,
        instanceIdentifier: instanceIdentifier
      }
      getSharedParams(sharedParamsInfo, configURL)
  }).catch(function(error) {
    console.log(error)
  })
}

function getSharedParams(sharedParamsInfo, configURL) {
  console.log("Execute 'getSharedParams'.")
  // Construct shared params URL
  const baseURL = url.parse(configURL)
  const sharedParamsInfoURL = baseURL.protocol + '//' + baseURL.host + sharedParamsInfo.path
  console.log("Configuration part URL: " + sharedParamsInfoURL)
  axios.get(sharedParamsInfoURL)
    .then(function(response){
      // Calculate hash of the downloaded shared-params.xml file
      const hash = crypto.createHash('sha512').update(response.data, 'utf8').digest('base64').trim()
      // Verify hash
      if(hash !== sharedParamsInfo.hash) {
        throw "Hashes of \"shared-params.xml\" do not match!"
      }
      parseSharedParams(response.data, sharedParamsInfo)
    }).catch(function(error) {
      console.log(error)
    })
}

function parseSharedParams(sharedParams, sharedParamsInfo) {
  console.log("Execute 'parseSharedParams'.")
  // Read shared-params.xml document
  const xml = new xmldoc.XmlDocument(sharedParams);
  // Read 'globalSettings' element
  const globalSettings = xml.childNamed('globalSettings')
  // Get all the 'memberClass' elements
  const memberClasses = globalSettings.childrenNamed('memberClass')
  const memberClassMemberCount = new Object()
  // Init an associative array with all the member class codes
  memberClasses.forEach(function(item) {
    memberClassMemberCount[item.valueWithPath('code')] = 0
  })
  // Get all the 'member' elements and member count
  const members = xml.childrenNamed('member')
  const memberCount = members.length
  // Get all the 'securityServer' elements and security server count
  const securityServers = xml.childrenNamed('securityServer')
  const securityServerCount = securityServers.length
  // Get all the 'subsystem' elements and subsystem count
  let subsystemCount = 0
  members.forEach(function(item) {
    const subsystems = item.childrenNamed('subsystem')
    subsystemCount += subsystems.length
    memberClassMemberCount[item.valueWithPath('memberClass.code')]++
  })

  // Transfer member class member count to a normal array for serialization
  const memberClassArr = [];
  for(var key in memberClassMemberCount) {
    memberClassArr.push({memberClass: key, memberCount: memberClassMemberCount[key]});
  }
  // Create an object that contains the result
  const results = {
    instanceIdentifier: sharedParamsInfo.instanceIdentifier,
    members: memberCount,
    subsystems: subsystemCount,
    securityServers: securityServerCount,
    memberClasses: memberClassArr
  }
  // Stringify results
  const json = JSON.stringify(results, null, 4)
  // Print results to console
  if(cfg.resultsToConsole && cfg.resultsToConsole === true) {
    console.log(json)
  }
  // Log results
  if(cfg.resultsFile) {
    writeToFile(json)
  }
}

function writeToFile(content) {
  console.log("Execute 'writeToFile'.")
  console.log('Save results to file \'' + cfg.resultsFile + '\'.')
  fs.writeFile(cfg.resultsFile, content, 'utf8', function (err) {
      if (err) {
          return console.log(err)
      }
      console.log('The file was saved!')
  })
}