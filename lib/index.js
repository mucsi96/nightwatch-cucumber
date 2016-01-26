var objectAssign = require('object-assign');

module.exports = function(providedOptions) {
    var options = objectAssign({
        runner: 'nightwatch',
        featureFiles: 'features/**/*.feature',
        stepDefinitions: 'features/step_definitions/**/*.js'
    }, providedOptions);

    // if (options.runner === 'cucumber') {
    //
    // }

    return require('./nightwatch-runner')(options);
};
