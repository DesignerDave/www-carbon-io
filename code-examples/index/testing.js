__(function() {
  module.exports = o({
    _type: testtube.HttpTest,
    name: "HttpTests",
    description: "Http tests",
    baseUrl: "http://localhost:8888",
    tests: [
      {
        reqSpec: {
          url: "/hello",
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: "Hello world!"
        }
      },
    ]
  })
})