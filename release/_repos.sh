#!/bin/bash

baseRepos="wicked.ui \
    wicked.api \
    wicked.chatbot \
    wicked.env \
    wicked.kong-adapter \
    wicked.mailer \
    wicked.kickstarter \
    wicked.auth \
    wicked.k8s-init"

jsRepos="${baseRepos} \
    wicked.test"

versionDirs="${baseRepos} \
    wicked.test/portal-api \
    wicked.test/portal-kong-adapter"

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

alpineImageBases="env \
    api \
    chatbot \
    ui \
    kong-adapter \
    mailer \
    kickstarter"
