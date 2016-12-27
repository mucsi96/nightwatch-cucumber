"use strict";

const peerUtils = require("./peer-utils");
const path = require("path");

module.exports = function(packagePath) {
    const packagePathParts = packagePath.split("/");
    const packageName = packagePathParts.shift();
    const m = peerUtils.getPeerDependency(packageName);

    if (!m.path) {
        return false;
    }

    return require(m.path + path.sep + packagePathParts.join(path.sep));
};
