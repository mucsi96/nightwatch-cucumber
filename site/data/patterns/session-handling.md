## Session handling

If you test a site which uses cookies, localStorage or sessionStorage its a good practise to clear them after each test case.
Not doing so will make the test cases not isolated.
Which can lead to not reliable, failing test where would be very hard to find the root cause of the issue.
Creating a new webdriver session for every test case is not necessary.
A proper cleanup and page refresh should be sufficient in most cases.
As starter you can use the following support code.

```javascript
const { client } = require('nightwatch-cucumber');
const { After } = require('cucumber');

After(() => client.execute(`
  localStorage.clear();
  sessionStorage.clear();
`).deleteCookies().refresh());
```
