module.exports = {
  reporter: function (results, done) {
    console.log(JSON.stringify(results, null, 2))
    done()
  }
}
