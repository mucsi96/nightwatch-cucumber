## Creating dynamic sections

You can create sections dynamically by using the modified Nightwatch `Section`
constructor exported by Nightwatch Cucumber.  Consider the following example
using nightwatch to test Wikipedia.

```javascript
//page-objects/wikipedia.js
const { Section } = require('nightwatch-cucumber')
module.exports = {
  url: 'https://en.wikipedia.org/wiki/Cucumber_(software)',
  elements: {
    toc: 'div#toc'
  },
  commands: [{
    getHeading: function(heading) {
      const props = {
        parent: this,
        selector: `//h2/*[text()="${heading}"]/..`,
        using: 'xpath',
        elements: {
          editLink: {
            selector: '//*[@class="mw-editsection"]//a[text()="edit"]',
            locateStrategy: 'xpath'
          }
        },
        commands: [{
          verifyEditSection: function() {
            return Promise.resolve(true);
          }
        }]
      }
      return new Section(props);
    },
    getSectionTitles: function() {
      return Promise.resolve([/* MAGIC! */]);
    }
  }]
}
```

Now we can use the `getHeading` command to test each of the edit links to ensure
that they edit the appropriate section.

```javascript
//step-definitions/yahoo.js

const { client } = require('nightwatch-cucumber');
const { Given, Then, When } = require('cucumber');
const wikipedia = client.page.wikipedia();

Given(/^I open each section's edit link$/, () => {
  wikipedia.navigate();
  return Promise.all(
    wikipedia.getSectionTitles()
      .map((title) =>  wikipedia.getHeading(title).verifyEditSection())
    );
});
```
The advantage of creating sections of the fly like this that your page object
code can be much DRYer, especially when there are many similar objects on the
page that you want to test.
