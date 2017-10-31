
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    dbUri: 'mongodb://localhost:27017/mydb',
    endpoints: {
      messages: o({
        _type: carbon.carbond.Endpoint,
        get: function(req) {
          return this.getService().db.getCollection('messages').find().toArray()
        },
        post: function(req) {
          return this.getService().db.getCollection('messages').insert(req.body)
        }
      })
    }
  })
})
