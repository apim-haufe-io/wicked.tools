#!/bin/bash

if [[ $(whoami) != root ]]; then
    echo "ERROR: This script must run as root to modify /etc/hosts:"
    echo "  sudo $0"
    exit 1
fi

# https://stackoverflow.com/questions/13322485/how-to-get-the-primary-ip-address-of-the-local-machine-on-linux-and-os-x
localIP=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')

echo "=========================================="
echo "Local IPv4 address: ${localIP}"

if [[ $(uname) == Darwin ]]; then
    sed -i '' '/portal.local/d' /etc/hosts
else
    sed -i '/portal.local/d' /etc/hosts
fi
echo "${localIP}    portal.local,api.portal.local" >> /etc/hosts
echo "=========================================="
echo "Content of /etc/hosts:"
echo "=========================================="

cat /etc/hosts

echo "=========================================="
