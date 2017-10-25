## Cucumber output

From version 3.0.0 of Cucumber.js the pretty formatter has been removed. The default formatter is the dot fromatter.
To get back the original output you can use the [cucumber-pretty](https://github.com/kozhevnikov/cucumber-pretty) package.

```bash
npm install cucumber-pretty --save-dev
```

Include the `--format node_modules/cucumber-pretty` command line arguments in `nightwatch.conf.js`

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--format', 'node_modules/cucumber-pretty',
    'features'
  ]
})

module.exports = {
  ...
}
```

![alt-tag](res/img/nightwatch-cucumber-pretty-output.png)
