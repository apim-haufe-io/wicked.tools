'use strict';

var request = require('request');
var https = require('https');
var fs = require('fs');

var utils = function () { };

utils.getJson = function (ob) {
    if (ob instanceof String || typeof ob === "string")
        return JSON.parse(ob);
    return ob;
};

utils.checkForConfigKey = function () {
    if (process.env.PORTAL_CONFIG_KEY) {
        utils.apiKey = process.env.PORTAL_CONFIG_KEY;
        return true;
    }
    console.error('The environment variable PORTAL_CONFIG_KEY is not set.');
    return false;
};

utils.makeApiUrl = function (url) {
    if (url.endsWith('/'))
        return url;
    return url + '/';
};

utils.agent = null;
utils.configureAgent = function (deployUrl) {
    if (deployUrl.startsWith('https://')) {
        console.log('Enabling insecure communication via https.');
        var agentOptions = { rejectUnauthorized: false };
        utils.agent = new https.Agent(agentOptions);
    }
};

function getAgent() {
    return utils.agent;
}

function handleResult(desc, expectedStatusCode, bodyTransform, callback) {
    return function (err, apiRes, apiBody) {
        if (err)
            return callback(err);
        if (apiRes.statusCode != expectedStatusCode) {
            err = new Error(desc + ' failed. Unexpected status code ' + apiRes.statusCode + ' vs expected ' + expectedStatusCode);
            return callback(err);
        }

        var jsonBody = null;
        if (apiRes.statusCode != 204 && apiBody)
            jsonBody = utils.getJson(apiBody);

        if (bodyTransform)
            return callback(null, bodyTransform(jsonBody));
        return callback(null, jsonBody);
    };
}

utils.postExport = function (deployUrl, done) {
    console.log('Requesting new export job...');
    request.post({
        url: deployUrl + 'export',
        headers: { 'Authorization': utils.apiKey },
        agent: getAgent()
    }, handleResult('POST /deploy/export', 201,
        function (jsonBody) {
            var exportId = jsonBody.exportId;
            console.log('Received Export ID: ' + exportId); 
            return exportId; 
        }, // Body Transform
        done));
};

utils.awaitDone = function (deployUrl, operation, jobId, done) {
    console.log('Awaiting ' + operation + ' to finish...');
    // Aw man, fuck closures. This sort of hurts and feels good
    // at the same time. As a C/C++ developer, this totally fucks
    // with your head.
    var checkIsDone = function (tryCount) {
        if (tryCount > 50) {
            return done(new Error('While waiting for ' + operation + ' to finish, the try count exceeded 50.'));
        }

        request.get({
            url: deployUrl + operation + '/' + jobId + '/status',
            headers: { 'Authorization': utils.apiKey },
            agent: getAgent()
        }, function (err, apiRes, apiBody) {
            if (err)
                return done(err);
            if (apiRes.statusCode > 299)
                return done(new Error('While getting status of ' + operation + ', an unexpected status was returned: ' + apiRes.statusCode));

            if (apiRes.statusCode == 200) {
                // Success!
                console.log('The ' + operation + ' is done.');
                return done(null, jobId);
            }

            console.log('The ' + operation + ' is not yet done, retrying in 2s...');
            // Try again
            setTimeout(checkIsDone, 2000, tryCount + 1);
        });
    };

    // Wait 500ms before trying the first time.
    setTimeout(checkIsDone, 500, 0);
};

utils.downloadArchive = function (deployUrl, exportId, outputFileName, done) {
    console.log('Downloading to ' + outputFileName);
    request.get({
        url: deployUrl + 'export/' + exportId + '/data',
        headers: { 'Authorization': utils.apiKey },
        agent: getAgent()
    })
    .on('error', function (err) {
        console.error('Download failed.');
        console.error(err);
        done(err);
    })
    .pipe(fs.createWriteStream(outputFileName))
    .on('finish', function () {
        console.log('Download finished.');
        done(null, exportId);
    });
};

utils.cancelExport = function (deployUrl, exportId, done) {
    console.log('Resetting export status.');
    request.delete({
        url: deployUrl + 'export/' + exportId,
        headers: { 'Authorization': utils.apiKey },
        agent: getAgent()
    }, handleResult('DELETE /export/' + exportId, 204,
        function (jsonBody) { return exportId; },
        done));
};

module.exports = utils;