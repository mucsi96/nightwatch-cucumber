## Passing additional CLI options for Cucumber.js.

For that you can use the `cucumberArgs` configuration property. For available Cucumber.js CLI options see the [Cucumber.js docs](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md)

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'hooks.js',
    '--require', 'features/step_definitions',
    '--format-options', '{"colorsEnabled":false}',
    'features'
  ]
})

module.exports = {
  ...
}
```

The default configuration object is.
```javascript
{
  cucumberArgs: [
    '--require', 'features/step_definitions',
    '--format', 'json:reports/cucumber.json',
    'features'
  ],
  nightwatchOutput: true
}
```
