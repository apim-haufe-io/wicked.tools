#!/bin/bash

set -e

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

expectedNodeVersion="8"
expectedNpmVersion="5"

trap failure ERR

function failure {
    echo "=========================="
    echo "ERROR: An error occurred, script exiting."
    echo "=========================="
}

if [ -z "$1" ] || [[ $1 =~ --* ]]; then
    echo "Usage: $0 <branch> [--pull] [--install]" #  [--create]"
    echo "  The script checks whether the wicked repositories exist parallel to this repository (../..),"
    echo "  and checks out the given branch. It will only do that if there are no open changes, and/or there"
    echo "  are no unpushed or uncommitted changes."
    echo "  Specify --pull to also pull the latest changes from the origin."
    exit 1
fi

branch=$1
doPull=false
doCreate=false
doInstall=false
ignoreVersions=false
shift 1
while [[ ! -z "$1" ]]; do
    case "$1" in
        "--pull")
            doPull=true
            echo "INFO: Will try pull all repositories."
            ;;
        # "--create")
        #     echo "INFO: Will create branch in all repositories if not already present."
        #     doCreate=true
        #     ;;
        "--install")
            doInstall=true
            echo "INFO: Will run an npm install on JavaScript repos afterwards"
            ;;
        "--ignore-versions")
            ignoreVersions=true
            echo "INFO: Will ignore node/npm version mismatches."
            ;;
        *)
            echo "ERROR: Unknown option: $1"
            exit 1
            ;;
    esac
    shift 1
done

# Sanity check node and npm
nodeVersion=$(node -v)
npmVersion=$(npm -v)
if [[ ${nodeVersion} =~ ^v${expectedNodeVersion}\.* ]]; then
    echo "INFO: Detected node ${nodeVersion}, this is fine."
else
    if [[ ${ignoreVersions} == false ]]; then
        echo "ERROR: wicked assumes node 8, you are running ${nodeVersion}."
        echo "To ignore this, use the --ignore-versions option."
        exit 1
    else
        echo "WARNING: wicked assumes node 8, you are running ${nodeVersion}, ignoring due to --ignore-versions."
    fi
fi
if [[ ${npmVersion} =~ ^${expectedNpmVersion}\.* ]]; then
    echo "INFO: Detected npm v${npmVersion}, this is fine."
else
    if [[ ${ignoreVersions} == false ]]; then
        echo "ERROR: wicked assumes npm 5, you are running npm ${npmVersion}."
        echo "To ignore this, use the --ignore-versions option."
        exit 1
    else
        echo "WARNING: wicked assumes npm 5, you are running npm ${npmVersion}, ignoring due to --ignore-versions."
    fi
fi

fallbackBranch=next
baseUrl="https://github.com/apim-haufe-io/"

pushd ${currentDir} > /dev/null
. ../release/_repos.sh
pushd ../../ > /dev/null

function cloneRepo {
    echo "=====================" >> ./wicked.portal-tools/development/git-clone.log
    echo "Cloning repo $1" >> ./wicked.portal-tools/development/git-clone.log
    echo "=====================" >> ./wicked.portal-tools/development/git-clone.log
    git clone "${baseUrl}$1" >> ./wicked.portal-tools/git-clone.log
}

function checkoutBranch {
    thisRepo=$1
    branchName=$2
    pushd ${thisRepo} > /dev/null

    local gitStatus gitCherry currentBranch

    git fetch

    # Check if branch is present
    if [ -z "$(git branch -r | sed 's/^..//' | grep origin/${branchName})" ]; then
        echo "WARNING: Repository ${repo} doesn't have branch ${branchName}, falling back to ${fallbackBranch}."
        branchName=${fallbackBranch}
    fi
    currentBranch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "${currentBranch}" == "${branchName}" ]]; then
        echo "INFO: Current branch in repository ${repo} already is ${branchName}."
    else
        echo "INFO: Attempting to switch branch to ${branchName} in repository ${repo}"
        gitStatus="$(git status -s)"
        if [ ! -z "${gitStatus}" ]; then
            echo "ERROR: Repository ${thisRepo} has an unclean status:"
            echo "${gitStatus}"
            return 1
        fi
        gitCherry="$(git cherry -v)"
        if [ ! -z "${gitCherry}" ]; then
            echo "ERROR: Repository ${thisRepo} has unpushed commits:"
            echo "${gitCherry}"
            return 1
        fi
        git checkout ${branchName}
        echo "INFO: Success, ${thisRepo} is now at branch ${branchName}"
    fi

    [[ ${doPull} == true ]] && git pull

    popd > /dev/null
    return 0
}

function runNpmInstall {
    thisRepo=$1
    pushd ${thisRepo} > /dev/null
    echo "INFO: Running npm install for repository ${thisRepo}"
    npm install > /dev/null
    popd
}

for repo in ${sourceRepos}; do
    if [ ! -d ${repo} ]; then
        # Repo doesn't exist already
        cloneRepo ${repo}
    fi
    checkoutBranch ${repo} ${branch}
done

if [[ ${doInstall} == true ]]; then
    runNpmInstall wicked.portal-env
    pushd wicked.portal-env > /dev/null
    ./local-update-portal-env.sh
    popd > /dev/null
    for repo in ${versionDirs}; do
        if [[ ${repo} != wicked.portal-env ]]; then
            runNpmInstall ${repo}
        fi
    done
fi

popd > /dev/null # ../..
popd > /dev/null # ${currentDir}

echo "=========================="
echo "SUCCESS"
echo "=========================="
