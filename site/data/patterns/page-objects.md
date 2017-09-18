## Page Objects
For making your tests more readable and maintainable you can use the Page Object pattern. Nightwatch reads the page objects from the folder (or folders) specified in the `page_objects_path` configuration property. [More details](http://nightwatchjs.org/guide#page-objects). Add the following line to Nightwatch.js configuration file.

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* configuration */
})

module.exports = {
  page_objects_path: 'page-objects',
  ...
}
```

```javascript
//page-objects/yahoo.js

module.exports = {
  url: 'http://yahoo.com',
  elements: {
    body: 'body',
    searchBar: 'input[name="p"]'
  }
}
```

Now we can use page objects from step definitions

```javascript
//step-definitions/yahoo.js

const {client} = require('nightwatch-cucumber');
const {defineSupportCode} = require('cucumber');

defineSupportCode(({Given, Then, When}) => {
  Given(/^I open Yahoo's search page$/, () => {
    const yahoo = client.page.yahoo();

    return yahoo
      .navigate()
      .waitForElementVisible('@body', 1000);
  });

  Then(/^the Yahoo search form exists$/, () => {
    const yahoo = client.page.yahoo();

    return yahoo.assert.visible('@searchBar');
  });

});
```
