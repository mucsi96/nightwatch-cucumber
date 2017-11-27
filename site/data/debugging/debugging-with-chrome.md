## Debugging with Chrome DevTools

Chrome DevTools has a very good integration with latest Node.js versions (8-9)

Here’s how to set up a debugging sesssion.

### 1. Add a new npm script to you project

```json
"scripts": {
    ...
    "e2e-debug": "node --inspect node_modules/nightwatch/bin/nightwatch"
  },
```

### 2. Set a breakpoint in you step definitions or support code (Using `debugger` statement)

```javascript
  Then(/^the title is "(.*?)"$/, (text) => {
    debugger;
    return client.assert.title(text);
  });
```

### 3. Open `about:inspect` in Chrome

![alt-tag](res/img/chrome-devtools-inspect.png)

### 4. Click the `Open dedicated DevTools for Node` link.

![alt-tag](res/img/chrome-devtools-nodejs.png)

### 5. Run the `e2e-debug` npm script

```bash
npm run e2e-debug
```

```bash
yarn e2e-debug
```

The debugging session should stop the execution on the `debugger` statement you set.

![alt-tag](res/img/chrome-devtools-breakpoint.png)

### 6. Close the dedicated DevTools for Node to stop debugging session.
