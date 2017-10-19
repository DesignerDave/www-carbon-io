
o({
  _type: carbon.carbond.Service,
  port: 8888,
  authenticator: o({
    _type: carbon.carbond.security.MongoDBApiKeyAuthenticator,
    apiKeyParameterName: 'api_key',
    apiKeyLocation: 'header',   // can be 'header' or 'query'
    userCollection: 'users',    // mongodb collection where user objects are stored
    apiKeyUserField: 'apiKey'   // field that contains user api keys
  }),
  endpoints: {
    hello: o({
      _type: carbon.carbond.Endpoint,
      <mark class="no-highlight">get</mark>: function(req) {
        return { msg: `Hello ${req.user.email}!`}
      }
    })
  }
})
