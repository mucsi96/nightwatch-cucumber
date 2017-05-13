const StringDecoder = require('string_decoder').StringDecoder
const stream = require('stream')
const Transform = stream.Transform

module.exports = class PrefixStream extends Transform {
  constructor (prefix, limit, options) {
    super(options)

    this.prefix = prefix
    this.limit = limit
    this._writableState.objectMode = false
    this._buffer = ''
    this._decoder = new StringDecoder('utf8')
  }

  _transform (chunk, encoding, cb) {
    this._buffer += this._decoder.write(chunk)
    // split on newlines
    const lines = this._buffer.split(/\r?\n/)
    // keep the last partial line buffered
    this._buffer = lines.pop()
    for (let l = 0; l < lines.length; l++) {
      // prefix and push out to consumer stream
      prefixAndLimitLine(this.prefix, this.limit, lines[l], this.push.bind(this))
    }
    cb()
  }

  _flush (cb) {
    // handle the leftovers
    const rem = this._buffer.trim()
    if (rem) {
      // prefix and push out to consumer stream
      prefixAndLimitLine(this.prefix, this.limit, rem, this.push.bind(this))
    }
    cb()
  }
}

function prefixAndLimitLine (prefix, limit, text, push) {
  let remainingPart = text
  while (remainingPart.length) {
    const line = remainingPart.slice(0, limit)
    remainingPart = remainingPart.slice(limit)
    push(`${prefix}${line}\n`)
  }
}
