#!/bin/bash

set -e

branch="master"
if [ -z "$1" ]; then
  echo "INFO: Branch not given, assuming 'master'."
else
  branch=$1
  echo "INFO: Checking branch '${branch}'."
fi

if [ -d tmp ]; then
  echo "INFO: Cleaning up tmp dir."
  rm -rf tmp
fi

if docker rm tmp_image &> /dev/null; then
  echo "INFO: Cleaned up dangling docker image."
fi

echo ""

repos="wicked.portal \
  wicked.portal-api \
  wicked.portal-kong-adapter \
  wicked.portal-mailer \
  wicked.portal-chatbot \
  wicked.kong \
  wicked.k8s-tool \
  wicked.k8s-init"

mkdir tmp
pushd tmp &> /dev/null
  echo "INFO: Retrieving HEAD of portal-env..."
  git init &> /dev/null
  git remote add github https://github.com/apim-haufe-io/wicked.portal-env.git &> /dev/null
  envBranchHead=$(git ls-remote github refs/heads/${branch} | cut -f 1)
  echo "INFO: portal-env ${branch} HEAD: ${envBranchHead}"
popd
rm -rf tmp

failed=0
for alpine in "-alpine" ""; do
  for repo in $repos; do
    mkdir tmp
    echo ""
    echo "Verifying ${repo}:${branch}${alpine}..."
    pushd tmp &> /dev/null
      git init &> /dev/null
      git remote add github https://github.com/apim-haufe-io/${repo}.git &> /dev/null
      branchHead=$(git ls-remote github refs/heads/${branch} | cut -f 1)
      echo "- ${branch} HEAD ref: ${branchHead}"
      echo "- Pulling docker images..."
      imageName=haufelexware/${repo}:${branch}${alpine}
      isNotEnvBased=0
      if [[ "wicked.kong" == "$repo" ]] || [[ "wicked.k8s-init" == "$repo" ]] || [[ "wicked.k8s-tool" == "$repo" ]]; then
        imageName=haufelexware/${repo}:${branch}
        isNotEnvBased=1
      fi
      docker pull ${imageName} &> docker.log
      docker create --name tmp_image ${imageName} &> /dev/null
      docker cp tmp_image:/usr/src/app/git_last_commit .
      dockerCommit=$(head -1 git_last_commit | cut -d ' ' -f 2)
      echo "- Docker image commit: ${dockerCommit}"
      if [[ ${dockerCommit} != ${branchHead} ]]; then
        echo "ERROR: Mismatch!"
        failed=1
      fi
      if [[ $isNotEnvBased == 0 ]]; then
        docker cp tmp_image:/usr/src/portal-env/git_last_commit env_git_last_commit
        dockerEnvCommit=$(head -1 env_git_last_commit | cut -d ' ' -f 2)
        echo "- portal-env commit: ${dockerEnvCommit}"
        if [[ ${dockerEnvCommit} != ${envBranchHead} ]]; then
          echo "ERROR: Mismatch in env commit!"
          failed=1
        fi
      fi
      docker rm tmp_image &> /dev/null
    popd &> /dev/null

    rm -rf tmp
  done
done

if [[ $failed == 1 ]]; then
  echo "ERROR: Commit version check failed. See log."
  exit 1
fi

echo "========================="
echo "SUCCESS."
echo "========================="
