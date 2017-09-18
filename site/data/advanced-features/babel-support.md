## Babel support

You can write tests using latest ECMAScript features using [Babel](https://babeljs.io/). Using `async` function is especially useful.
For that you need install `babel-core`, setup `.babelrc` and add Babel as compiler
```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  cucumberArgs: ['--compiler', 'js:babel-core/register', '--require', 'features/step_definitions', 'features']
})
...
```

```javascript
// features/step_definitions/google.js

import { client } from 'nightwatch-cucumber';
import { defineSupportCode } from 'cucumber';

defineSupportCode(({ Given, Then, When }) => {
  Given(/^I open Google's search page$/, async () => {
    await client.url('http://google.com')
    await client.waitForElementVisible('body', 1000);
  });

  Then(/^the title is "([^"]*)"$/, async (title) => {
    await client.assert.title(title);
  });

  Then(/^the Google search form exists$/, async () => {
    await client.assert.visible('input[name="q"]');
  });

});
```

For complete working example check out the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples/babel-example)
