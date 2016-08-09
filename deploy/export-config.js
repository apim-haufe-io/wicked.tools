'use strict';

var request = require('request');
var async = require('async');
var utils = require('./utils');

// COMMAND LINE PROCESSING

var success = utils.checkForConfigKey();
if (success && process.argv.length < 4)
    success = false;

if (!success) {
    printUsage();
    console.error('Exiting.');
    process.exit(1);
}

// deployUrl will end with /
var deployUrl = utils.makeApiUrl(process.argv[2]);
var outputFileName = process.argv[3];

// MAIN

utils.configureAgent(deployUrl);

async.waterfall([
    function (callback) {
        utils.postExport(deployUrl, callback);
    }, function (exportId, callback) {
        utils.awaitDone(deployUrl, 'export', exportId, callback);
    }, function (exportId, callback) {
        utils.downloadArchive(deployUrl, exportId, outputFileName, callback);
    }, function (exportId, callback) {
        utils.cancelExport(deployUrl, exportId, callback);
    }
], function (err, result) {
    if (err) {
        console.error('An error occurred.');
        console.error(err.stack);
        process.exit(1);
    }

    console.log('Export ID: ' + result);
    process.exit(0);
});

// SUBROUTINES

function printUsage() {
    console.log('');
    console.log('Usage: node export-config.js <https://api.yourcompany.com/deploy/v1> <output.enc>');
    console.log('');
    console.log('  The environment variable PORTAL_CONFIG_KEY has to contain the deployment');
    console.log('  key which was used when creating the configuration repository and');
    console.log('  deploying the API Portal.');
    console.log('');
    console.log('  The output file <output.enc> will have been encrypted using AES256, using');
    console.log('  openssl, having applied the key passed in PORTAL_CONFIG_KEY.');
    console.log('');
    console.log('  To decrypt the file, use the following command line:');
    console.log('');
    console.log('  openssl enc -d -aes-256-cbc -k "$PORTAL_CONFIG_KEY" -in <output.enc> -out archive.tgz');
}