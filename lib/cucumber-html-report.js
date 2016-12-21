"use strict";

const fs = require("fs");
const path = require("path");
const cloneDeep = require("lodash.clonedeep");
const template = require("lodash.template");
const mkdirp = require("mkdirp");

const setStats = function(sourceSuite) {
    let suite = sourceSuite;
    let features = suite.features;

    features.forEach(function(sourceFeature) {
        let feature = sourceFeature;

        feature.passed = 0;
        feature.failed = 0;
        feature.notdefined = 0;
        feature.skipped = 0;

        if (!feature.elements) {
            return 0;
        }

        feature.elements.forEach((sourceElement) => {
            let element = sourceElement;

            element.passed = 0;
            element.failed = 0;
            element.notdefined = 0;
            element.skipped = 0;

            element.steps.forEach((sourceStep) => {
                let step = sourceStep;

                if (typeof step.embeddings !== "undefined") {
                    step.embeddings.forEach(function(embedding) {
                        if (embedding.mime_type === "image/png") {
                            step.image = "data:image/png;base64," + embedding.data;
                        }
                    });
                }

                if (!step.result) {
                    return 0;
                }
                if (step.result.status === "passed") {
                    return element.passed++;
                }
                if (step.result.status === "failed") {
                    return element.failed++;
                }
                if (step.result.status === "undefined") {
                    return element.notdefined++;
                }

                element.skipped++;

                return 0;
            });

            if (element.notdefined > 0) {
                suite.scenarios.notdefined++;
                return feature.notdefined++;
            }

            if (element.failed > 0) {
                suite.scenarios.failed++;
                return feature.failed++;
            }

            if (element.skipped > 0) {
                suite.scenarios.skipped++;
                return feature.skipped++;
            }

            if (element.passed > 0) {
                suite.scenarios.passed++;
                return feature.passed++;
            }

            return 0;
        });

        if (feature.failed > 0) {
            return suite.failed++;
        }
        if (feature.passed > 0) {
            return suite.passed++;
        }

        return 0;
    });

    suite.features = features;

    return suite;
};

const getResource = function(resourceName) {
    return fs.readFileSync(path.join(__dirname, "..", "resources", resourceName), "utf8");
};

const generateReport = function(htmlFilePath, featureOutput, logOutput) {
    let suite = {
        features: cloneDeep(featureOutput),
        passed: 0,
        failed: 0,
        scenarios: {
            passed: 0,
            failed: 0,
            skipped: 0,
            notdefined: 0
        },
        logOutput: logOutput
    };

    mkdirp.sync(path.dirname(htmlFilePath));
    suite = setStats(suite);

    fs.writeFileSync(
    htmlFilePath,
    template(getResource("index.tmpl"))({
        suite,
        time: new Date(),
        features: template(getResource("features.tmpl"))(suite),
        styles: getResource("style.css"),
        script: getResource("script.js"),
        piechart: getResource("piechart.js")
    })
  );
};

module.exports = generateReport;
