## Running with NPM scripts

![alt-tag](res/img/nightwatch-cucumber-output.png)

Using NPM scripts its more easy. Let's assume you have following `package.json`.

```json
{
  ...
  "scripts": {
    "e2e-test": "nightwatch",
    ...
  }
  ...
}
```

You can run the tests by executing

```bash
npm run e2e-test
```
