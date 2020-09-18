"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util = require("util");
function getAllTsFiles(rootDir, includeDeclarationFiles, result = [], relativeDir = undefined) {
    const currentDir = (relativeDir == undefined) ?
        rootDir :
        rootDir + "/" + relativeDir;
    for (const path of fs.readdirSync(currentDir)) {
        const fullPath = currentDir + "/" + path;
        if (fs.lstatSync(fullPath).isDirectory()) {
            getAllTsFiles(rootDir, includeDeclarationFiles, result, (relativeDir == undefined) ?
                path :
                relativeDir + "/" + path);
        }
        else if (path.endsWith(".ts") &&
            (includeDeclarationFiles ||
                !path.endsWith(".d.ts"))) {
            if (relativeDir == undefined) {
                continue;
            }
            result.push(currentDir + "/" + path);
        }
    }
    return result;
}
exports.getAllTsFiles = getAllTsFiles;
function log(...args) {
    const result = [];
    for (const arg of args) {
        result.push(util.inspect(arg, {
            depth: 10,
            colors: true,
            maxArrayLength: 100,
        }));
    }
    console.log(result.join(", "));
}
exports.log = log;
//# sourceMappingURL=util.js.map