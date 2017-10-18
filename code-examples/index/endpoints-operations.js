
var carbon = require('carbon-io')
var __  = carbon.fibers.__(module)
var _o  = carbon.bond._o(module)
var o = carbon.atom.o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,

        get: {
          parameters: { 
            who: {
              location: 'query',  //parameters can be passed via query, header, path, or body
              required: false,
              default: 'world',
              schema: { type: 'string' } 
            }           
          },
          responses: [
            {
              statusCode: 200,
              description: "Success",
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                },
                required: [ 'msg' ],
                additionalProperties: false
              }
            }
          ],
          
          service: function(req, res) {
            return { msg: `Hello ${req.parameters.who}!` }
          }
        }
      })
    }
  })
})
