const nightwatch = require("nightwatch");

nightwatch.runner({
    // Run single feature file
    _: [],
    config: "nightwatch.conf.js",
    env: "default",
    filter: "",
    tag: ""
}, () => {
    console.log("done");
});
