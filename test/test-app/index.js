"use strict";

const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mimeTypes = {
    html: "text/html",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    js: "text/javascript",
    css: "text/css"
};

const server = http.createServer((req, res) => {
    let uri = url.parse(req.url).pathname;

    if (uri === "/") {
        uri = "/index.html";
    }

    const filename = path.join(__dirname, uri);

    fs.exists(filename, (exists) => {
        var mimeType,
            fileStream;

        if (!exists) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("404 Not Found\n");
            res.end();
            return;
        }
        mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, { "Content-Type": mimeType });

        fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    });
});

const start = function() {
    server.listen(8087);
};

const stop = function() {
    server.close();
};

if (require.main === module) {
    console.log("Server listening on port 8087");
    start();
}

module.exports = {
    start,
    stop
};
