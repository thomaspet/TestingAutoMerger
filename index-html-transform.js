module.exports = (targetOptions, indexHtml) => {
    return indexHtml.replace(/%VERSION_GUID%/g, new Date().getTime());
};