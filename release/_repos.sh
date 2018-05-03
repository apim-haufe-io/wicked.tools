#!/bin/bash

baseRepos="wicked.portal \
    wicked.portal-api \
    wicked.portal-chatbot \
    wicked.portal-env \
    wicked.portal-kong-adapter \
    wicked.portal-mailer \
    wicked.portal-kickstarter \
    wicked.portal-auth \
    wicked.k8s-init"

jsRepos="${baseRepos} \
    wicked.portal-test"

versionDirs="${baseRepos} \
    wicked.portal-test/portal-api \
    wicked.portal-test/portal-kong-adapter"

repos="${jsRepos} \
    wicked.kong \
    wicked.k8s-tool"

sourceRepos="${repos} \
    wicked.node-sdk \
    wicked-sample-config"

imageRepos="${baseRepos} \
    wicked.kong \
    wicked.k8s-tool"

imageBases=$(for r in ${imageRepos}; do echo ${r:7}; done)

alpineImageBases="portal-env \
    portal-api \
    portal-chatbot \
    portal \
    portal-kong-adapter \
    portal-mailer \
    portal-kickstarter"
