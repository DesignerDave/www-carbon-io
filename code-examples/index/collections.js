__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    dbUri: 'mongodb://localhost:27017/mydb',
    endpoints: {
      messages: o({
        _type: carbon.carbond.mongodb.MongoDBCollection,
        collection: 'zipcodes'
      })
    }
  })
})