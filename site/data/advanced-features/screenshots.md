## Screenshots

You can enable screenshot generation on step failure using following Nightwatch configuration

```javascript
module.exports = {
  test_settings: {
    default: {
      screenshots : {
        enabled : true,
        on_failure : true,
        path: 'screenshots/default'
      },
      ...
    }
  },
  ...
}
```
