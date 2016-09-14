# wicked.haufe.io

This repository is part of the OSS API Portal/API Management system "wicked" by Haufe-Lexware. For more information on the API Portal, see the repository

[wicked.haufe.io](https://github.com/Haufe-Lexware/wicked.haufe.io)

## What's in this repository?

This repository contains/will contain sample code for deploying, or generally interacting with the API Portal.

In the `local-kong` directory, you will find a simple Docker Compose file to run only Kong locally on your Docker host.

## Exporting Configuration

To test the deployment end points (see also documentation on this), do the following (you will need a recent node.js installation on your machine):

```bash
$ git clone https://github.com/Haufe-Lexware/wicked.portal-tools
...
$ cd wicked.portal-tools
$ npm install
...
$ export PORTAL_CONFIG_KEY=<the deployment key of your API Portal instance>
$ node deploy/export-config.js https://api.yourcompany.com/deploy/v1 archive.tgz.enc
...
```

The URL `api.yourcompany.com` must point to the API Gateway of your API Portal installation, **not to the Portal UI**.
