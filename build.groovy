void YarnInstall() {
    bat "yarn install"
}

void YarnBuild() {
    bat "yarn ${YARN_BUILD}"
}

void ZipResult() {
    bat "yarn zip-dist"
}

return this;