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
  const uri = url.parse(req.url).pathname
  const filename = path.join(__filename, uri)
  path.exists(filename, (exists) => {
    if (!exists) {
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
  server.listen(1337)
}

function stop () {
  server.close()
}

module.exports = {
  start,
  stop
}
