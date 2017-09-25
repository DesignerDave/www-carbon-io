__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    dbUris: {
      english: "mongodb://localhost:27017/hello-world-en",
      french: "mongodb://localhost:27017/hello-world-fr"
    }

    endpoints : {
      english: _o({
        _type: carbon.carbond.Endpoint,
        get: {
          service: function(req) {
            return this.getService().dbs['english'].getCollection('hello').findOne()
          }
        }
      }),
      french: _o({
        _type: carbon.carbond.Endpoint,
        get: {
          service: function(req) {
            return this.getService().dbs['french'].getCollection('hello').findOne()
          }
        }
      })
    }
  })
})