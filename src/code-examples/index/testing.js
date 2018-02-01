const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main

__(function() {
  module.exports = o({
<mark js-highlighted-code="testing-1">    _type: testtube.<mark js-inline-highlight="testing-1">HttpTest</mark>,</mark>
    name: 'HttpTests',
    description: 'Http tests',
    baseUrl: 'http://localhost:8888',
<mark js-highlighted-code="testing-2">    <mark js-inline-highlight="testing-2">tests</mark>: [</mark>
      {
<mark js-highlighted-code="testing-3">        <mark js-inline-highlight="testing-3">reqSpec</mark>: {</mark>
          url: '/hello',
          method: 'GET'
        },
<mark js-highlighted-code="testing-4">        <mark js-inline-highlight="testing-4">resSpec</mark>: {</mark>
          statusCode: 200,
          body: 'Hello world!'
        }
      },
    ]
  })
})