## Getting Started

### Step 1

First you need to have Nightwatch.js and Cucumber.js to be installed locally.

```bash
$ npm install --save-dev nightwatch cucumber
```

or shorter

```bash
$ npm i -D nightwatch cucumber
```

If you are new to Nightwatch.js you can read the [developer guide](http://nightwatchjs.org/guide).

### Step 2

Install `nightwatch-cucumber`

```bash
$ npm install --save-dev nightwatch-cucumber
```

or shorter

```bash
$ npm i -D nightwatch-cucumber
```

### Step 3

In project root create a JavaScript configuration file for Nightwatch.js. Use `nightwatch.conf.js` instead of `nightwatch.json`. [More details](http://nightwatchjs.org/guide#settings-file) You don't need to specify `src_folders`.
```javascript
// nightwatch.conf.js

module.exports = {
  ...
}
```

### Step 4

Require `nightwatch-cucumber` at the top of the configuration file.
```javascript
// nightwatch.conf.js

require('nightwatch-cucumber')({
  /* other configuration options */
})

module.exports = {
  ...
}
```
For more examples check out the [example repository](https://github.com/mucsi96/nightwatch-cucumber-example) or the [examples folder](https://github.com/mucsi96/nightwatch-cucumber/tree/master/examples)

### Step 5

Run the tests by executing.

```bash
node_modules/.bin/nightwatch
```
