
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    authenticator: o({
      _type: carbon.carbond.security.MongoDBApiKeyAuthenticator,
      apiKeyParameterName: 'api_key',
      apiKeyLocation: 'header', // can be 'header' or 'query'
      userCollection: 'users',  // MongoDB collection where user objects are stored
      apiKeyField: 'apiKey'     // field that contains user api keys
    }),
    dbUri: 'mongodb://localhost:27017/mydb',
    endpoints : {
      <mark js-highlighted-code="hello-service-1">hello: <mark js-inline-highlight="hello-service-1">_o</mark>('./HelloEndpoint')</mark>
    }
  })
})
