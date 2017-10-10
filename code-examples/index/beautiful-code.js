
var carbon = require('carbon-io')  
var __ = carbon.fibers.__(module) 
var _o = carbon.bond._o(module) 
var o = carbon.atom.o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    dbUri: "mongodb://localhost:27017/zipcodes",
    endpoints : {
      zipcodes: o({
        _type: carbon.carbond.mongodb.MongoDBCollection,
        collection: "zipcodes",

        // JSON schema objects managed by this endpoint must
        // conform to. 
        schema: {
          type: "object",
          properties: {
            _id: { type: "string", pattern: "^[0-9]{5}$" },
            state: { type: "string", pattern: "^[A-Z]{2}$" },
          },
          required: ["_id", "state"],
          additionalProperties: false
        }
      })
    }
  })
})
