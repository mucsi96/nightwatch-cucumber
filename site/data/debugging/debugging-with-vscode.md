## Debugging with Visual Studio Code

Visual Studio Code provides good debugging capabilities for Node.js

Here’s how to set up a debugging sesssion.

### 1. Add the following configuration to your project launch.json

```json
{
  ...
  "configurations": [
    ...
    {
      "type": "node",
      "request": "launch",
      "name": "Nightwtach",
      "program": "${workspaceRoot}/node_modules/nightwatch/bin/nightwatch",
      "args": []
    }
  ]
}
```

### 2. Set a breakpoint in your step definitions or support code
### 3. Start debugging using the newly created launch configuration

![alt-tag](res/img/vscode-breakpoint.png)

For more details read the [VSCode documentation](https://code.visualstudio.com/docs/editor/debugging)
