__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,
        get: function(req, res) {
          return { msg: “Hello, world!” }
        }
      })
    }
  })
})
