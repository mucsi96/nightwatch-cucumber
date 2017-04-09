'use strict'

const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')
const mimeTypes = {
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  js: 'text/javascript',
  css: 'text/css'
}

const server = http.createServer((req, res) => {
  let uri = url.parse(req.url).pathname

  if (uri === '/') uri = '/index.html'

  const filename = path.join(__dirname, uri)
  fs.access(filename, fs.constants.R_OK, err => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404 Not Found\n')
      res.end()
      return
    }
    var mimeType = mimeTypes[path.extname(filename).split('.')[1]]
    res.writeHead(200, {'Content-Type': mimeType})

    var fileStream = fs.createReadStream(filename)
    fileStream.pipe(res)
  })
})

function start () {
  server.listen(8087)
}

function stop () {
  server.close()
}

if (require.main === module) {
  console.log('Server listening on port 8087')
  start()
}

module.exports = {
  start,
  stop
}
