## Hooks

Hooks can be provided using Cucumber.js support files. Support files are specified using `supportFiles` configuration option.
[More details](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md)
For more examples check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: [
    '--require', 'hooks.js',
    '--require', 'features/step_definitions',
    'features'
  ]
})

module.exports = {
  ...
}
```

```javascript
// hooks.js
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Before, After}) => {
  Before(() => new Promise(resolve => {
    console.log('Before start');
    setTimeout(() => {
      console.log('Before end');
      resolve();
    }, 1000);
  }));

  After(() => new Promise(resolve => {
    console.log('After start');
    setTimeout(() => {
      console.log('After end');
      resolve();
    }, 1000);
  }));
})
```
