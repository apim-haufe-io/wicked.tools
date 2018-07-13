#!/bin/bash

if [[ $(whoami) != root ]]; then
    echo "ERROR: This script must run as root to modify /etc/hosts:"
    echo "  sudo $0"
    exit 1
fi

# # https://stackoverflow.com/questions/13322485/how-to-get-the-primary-ip-address-of-the-local-machine-on-linux-and-os-x
# localIP=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p' | tail -1)
localIP=$(node js/get-local-ips.js)
if [[ -z $localIP ]]; then
    echo "ERROR: ifconfig did not return a valid IPv4 address for your system."
    echo "       Please connect to a network and try again."
    exit 1
fi

echo "=========================================="
echo "Local IPv4 address: ${localIP}"

if [[ $(uname) == Darwin ]]; then
    sed -i '' '/portal.local/d' /etc/hosts
else
    sed -i '/portal.local/d' /etc/hosts
fi
echo "${localIP}    portal.local,api.portal.local,portal.com,api.portal.com" >> /etc/hosts
echo "=========================================="
echo "Content of /etc/hosts:"
echo "=========================================="

cat /etc/hosts

echo "=========================================="
