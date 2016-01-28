var objectAssign = require('object-assign');
var assert = require('assert');
var closeSessionOptions = ['afterScenario', 'afterFeature', 'never'];

module.exports = function(providedOptions) {
    var options = objectAssign({
        runner: 'nightwatch',
        featureFiles: 'features',
        stepDefinitions: 'features/step_definitions',
        closeSession: 'afterFeature'
    }, providedOptions);

    assert(closeSessionOptions.indexOf(options.closeSession) !== -1, "Bad configuration for nightwatch-cucumber. closeSession should be " + closeSessionOptions.join(' or ') );

    if (options.runner === 'cucumber') {
        return require('./cucumber-runner')(options);
    }

    return require('./nightwatch-runner')(options);
};
