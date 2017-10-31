
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    dbUri: 'mongodb://localhost:27017/mydb',
    endpoints: {
      articles: o({
        _type: carbon.carbond.mongodb.MongoDBCollection,
        collection: 'articles'
      })
    }
  })
})
