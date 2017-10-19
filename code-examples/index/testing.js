
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

__(function() {
  module.exports = o({
    _type: testtube.HttpTest,
    name: 'HttpTests',
    description: 'Http tests',
    baseUrl: 'http://localhost:8888',
    tests: [
      {
        reqSpec: {
          url: '/hello',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: 'Hello world!'
        }
      },
    ]
  })
})
