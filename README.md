
# Carbon.io Marketing Site
You can find the website at [carbon.io](https://carbon.io/).

## To run the site locally...
### Make sure you have [Harp](http://http://harpjs.com/) installed
```bash
$ npm install -g harp
```

### Start the harp server
``` bash
# Runs the site locally at http://localhost:9000/
$ harp server src/ --port=9000
```

## To compile the production site...
### Make sure you have [UglifyJS](http://lisperator.net/uglifyjs/) installed
```bash
$ npm install uglify-js -g
```

### Compile the source
```bash
# Run this script from the project root directory.
$ . ./compile.sh
```

*Note: The site is run with GitHub pages, and will automatically update once it is pushed to GitHub.*
