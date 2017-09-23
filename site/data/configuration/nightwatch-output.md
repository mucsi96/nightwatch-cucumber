## Nightwatch output

By default every passed Nightwatch assertion fill log a message on output. To disable that set `nightwatchOutput: false` in configuration object.

```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  ...
  nightwatchOutput: false
})

module.exports = {
  ...
}
```
