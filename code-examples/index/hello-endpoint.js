
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

module.exports = o({
  _type: carbon.carbond.Endpoint,
  acl: o({
    _type: carbon.carbond.security.EndpointAcl,
    groupDefinitions: { // This ACL defines a group called 'role'.
      role: 'role'      // We define a group called 'role' based on the user property named 'role'.
    },
    entries: [
      {
        user: { role: 'Writer' },
        permissions: {
          get: true,
          post: true
        }
      },
      {
        user: { role: 'Reader' },
        permissions: {
          get: true,
          post: false
        }
      }
    ]
  }),
  get: function(req) {
    return { msg: 'Hello World!' }
  },
  post: function(req) {
    return { msg: `Hello ${req.body.message}!` }
  }
})
