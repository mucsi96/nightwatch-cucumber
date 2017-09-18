## Parallel execution

For speeding up the execution of tests you can run them parallely. Here is an example Nightwatch configuration file. [More details](http://nightwatchjs.org/guide#via-workers).

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  ...
})

module.exports = {
  "test_workers": true,
  ...
}
```

![alt-tag](res/img/nightwatch-cucumber-parallel-test-output.png)
