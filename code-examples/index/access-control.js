o({
  _type: carbon.carbond.Endpoint,
  acl: o({
    _type: carbon.carbond.security.EndpointAcl
      groupDefinitions: { // This ACL defines a groups called 'role'.
        role: 'role'      // We define a group called 'role' based on the user property named 'role'.
      }
      entries: [
        {
          user: { role: "Admin" },
          permissions: {
            "*": true // "*" grants all permissions
          }
        },
        {
          user: { role: "Reader" },
          permissions: { // We could have used "*" here but are being explicit.
            get: true,
            "*": false
          }
        }      
      ]
    }),
    get: function(req) {
      return { msg: "Hello World!" }
    },
    post: function(req) {
      return { msg: `Hello ${req.body}!` } 
    }
  })
})