const request = require('request');
const async = require('async');

if (process.argv.length < 4) {
    console.error('Usage: node create-github-release.js <owner/repo> <tag>');
    console.error('The env var GITHUB_TOKEN must be set to a valid access token.');
    process.exit(1);
}

if (!process.env.GITHUB_TOKEN) {
    console.error('ERROR: The env var GITHUB_TOKEN is not set.');
    process.exit(1);
}

const repo = process.argv[2];
const tag = process.argv[3];
const accessToken = process.env.GITHUB_TOKEN;

const BASE_URL = 'https://api.github.com/repos/' + repo;
const HEADERS = {
    'User-Agent': 'wicked Releaser 0.0.1',
    'Accept': 'application/json'
};

console.log(`Creating release ${tag} for repo ${repo}`);

function checkIfAlreadyPresent(callback) {
    console.log('Checking if release is already there...');
    request.get({
        url: `${BASE_URL}/releases/tags/${tag}`,
        headers: HEADERS
    }, function (err, res, body) {
        if (err)
            return callback(err);
        const releaseJson = JSON.parse(body);
        if (res.statusCode === 200)
            return callback(null, releaseJson); // Already there
        else if (res.statusCode === 404)
            return callback(null, null); // Not present
        return callback(new Error(`checkIfAlreadyPresent() - Unknown status code ${res.statusCode}`));
    });
}

function deleteIfPresent(releaseJson, callback) {
    if (!releaseJson)
        return callback(null, true); // Continue please
    // Let's delete it first, now we need the access token
    console.log('Deleting previously existing release...')
    request.delete({
        url: `${BASE_URL}/releases/${releaseJson.id}?access_token=${accessToken}`,
        headers: HEADERS
    }, function (err, res, body) {
        if (err)
            return callback(err);
        if (res.statusCode === 204)
            return callback(null, true);
        return callback(new Error(`deleteIfPresent() - Unexpected status code ${res.statusCode}`));
    });
}

function createRelease(success, callback) {
    console.log(`Creating release ${tag}...`);
    request.post({
        url: `${BASE_URL}/releases?access_token=${accessToken}`,
        headers: HEADERS,
        json: true,
        body: {
            tag_name: tag,
            target_commitish: 'master',
            name: tag,
            body: `Release ${tag} of wicked.haufe.io\n\nSee [wicked.haufe.io release notes](https://github.com/Haufe-Lexware/wicked.haufe.io/blob/master/doc/release-notes.md) for more information`,
            draft: false,
            prerelease: false
        }
    }, function (err, res, body) {
        if (err)
            return callback(err);
        if (res.statusCode === 201)
            return callback(null, `Release ${tag} successfully created.`);
        return callback(new Error(`createRelease() - Unexpected status code ${res.statusCode}`));
    });
}

async.waterfall([
    checkIfAlreadyPresent,
    deleteIfPresent,
    createRelease
], function (err, result) {
    if (err) {
        console.error('ERROR: Operation failed.');
        console.error(err);
        process.exit(1);
    }
    console.log(result);
});
