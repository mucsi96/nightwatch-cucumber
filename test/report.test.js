/* eslint-disable no-invalid-this, no-unused-expressions */
const chai = require("chai");

chai.should();
const testCaseFactory = require("./test-case-factory");
const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");

const getCucumberHtmlReportWindow = function(testCasePath) {
    return new Promise((resolve, reject) => {
        jsdom.env({
            file: path.join(testCasePath, "reports", "cucumber.html"),
            done: (err, window) => {
                if (err) {
                    reject(err);
                }
                resolve(window);
            }
        });
    });
};

const getJUnitXmlReport = function(testCasePath) {
    return fs.readFileSync(path.join(testCasePath, "reports", "junit.xml"), "utf8");
};

describe("Reporting features", () => {
    it("should generate cucumber HTML report", () => {
        return testCaseFactory
            .create("cucumber-html-report-test")
            .feature("addition")
            .scenario("small numbers")
            .given("User is on the simple calculator page", function() {
                this.init();
            })
            .and("User enter 4 in A field", function() {
                this.setValue("#a", 4);
            })
            .and("User enter 5 in B field", function() {
                this.setValue("#b", 5);
            })
            .when("User press Add button", function() {
                this.click("#add");
            })
            .then("The result should contain 9", function() {
                this.assert.containsText("#result", 9);
            })
            .scenario("big numbers")
            .given("User is on the simple calculator page")
            .and("User enter 4 in A field")
            .and("User enter 5 in B field")
            .when("User press Add button")
            .then("The result should contain 9")
            .feature("subtraction")
            .scenario("small numbers")
            .given("User is on the simple calculator page")
            .and("User enter 9 in A field", function() {
                this.setValue("#a", 9);
            })
            .and("User enter 3 in B field", function() {
                this.setValue("#b", 3);
            })
            .when("User press Subtract button", function() {
                this.click("#subtract");
            })
            .then("The result should contain 6", function() {
                this.assert.containsText("#result", 6);
            })
            .scenario("big numbers")
            .given("User is on the simple calculator page")
            .and("User enter 4 in A field")
            .and("User enter 5 in B field")
            .when("User press Subtract button")
            .then("The result should contain -1", function() {
                this.assert.containsText("#result", -1);
            })
            .run()
            .then((result) => getCucumberHtmlReportWindow(result.testCasePath))
            .then((window) => {
                window.document.querySelector(".navbar-header .label-success").textContent.should.equal("Passed: 2");
                window.document.querySelector(".navbar-header .label-danger").textContent.should.equal("Failed: 0");
            });
    });

    it("should generate JUnit XML report for Continuous Integration (CI) servers", () => {
        return testCaseFactory
            .create("cucumber-junit-report-test", { junitReport: true })
            .feature("addition")
            .scenario("small numbers")
            .given("User is on the simple calculator page", function() {
                this.init();
            })
            .and("User enter 4 in A field", function() {
                this.setValue("#a", 4);
            })
            .and("User enter 5 in B field", function() {
                this.setValue("#b", 5);
            })
            .when("User press Add button", function() {
                this.click("#add");
            })
            .then("The result should contain 9", function() {
                this.assert.containsText("#result", 9);
            })
            .scenario("big numbers")
            .given("User is on the simple calculator page")
            .and("User enter 4 in A field")
            .and("User enter 5 in B field")
            .when("User press Add button")
            .then("The result should contain 9")
            .feature("subtraction")
            .scenario("small numbers")
            .given("User is on the simple calculator page")
            .and("User enter 9 in A field", function() {
                this.setValue("#a", 9);
            })
            .and("User enter 3 in B field", function() {
                this.setValue("#b", 3);
            })
            .when("User press Subtract button", function() {
                this.click("#subtract");
            })
            .then("The result should contain 6", function() {
                this.assert.containsText("#result", 6);
            })
            .scenario("big numbers")
            .given("User is on the simple calculator page")
            .and("User enter 4 in A field")
            .and("User enter 5 in B field")
            .when("User press Subtract button")
            .then("The result should contain -1", function() {
                this.assert.containsText("#result", -1);
            })
            .run()
            .then((result) => getJUnitXmlReport(result.testCasePath))
            .then((report) => {
                const expectedReport = fs.readFileSync("test/expected/junit.xml", "utf8");

                report.should.equal(expectedReport);
            });
    });

    it("should attach screenshots for failing scenarios", () => {
        return testCaseFactory
            .create("screenshot-attachement-test", { screenshots: true })
            .feature("addition")
            .scenario("small numbers")
            .given("User is on the simple calculator page", function() {
                this.init();
            })
            .and("User enter 4 in A field", function() {
                this.setValue("#a", 4);
            })
            .and("User enter 5 in B field", function() {
                this.setValue("#b", 5);
            })
            .when("User press Add button", function() {
                this.click("#add");
            })
            .then("The result should contain 8", function() {
                this.assert.containsText("#result", 8);
            })
            .run()
            .then((result) => getCucumberHtmlReportWindow(result.testCasePath))
            .then((window) => {
                const feature = window.document.querySelector("[href$=\"Feature0\"]");
                const featureMatch = feature.textContent.match(/^\s*(.*?):(.*?)\s*.*\s*$/);

                featureMatch.should.not.to.be.null;
                featureMatch[1].should.equal("Feature");
                featureMatch[2].should.equal("addition");
                feature.querySelector(".label-danger").textContent.should.equal("1");

                const scenario = window.document.querySelector("[href$=\"Scenario00\"]");
                const scenarioMatch = scenario.textContent.match(/^\s*(.*?):(.*?)\s*.*\s*.*\s*$/);

                scenarioMatch.should.not.to.be.null;
                scenarioMatch[1].should.equal("Scenario");
                scenarioMatch[2].should.equal("small numbers");
                scenario.querySelector("[title=\"Passed\"]").textContent.should.equal("4");
                scenario.querySelector("[title=\"Failed\"]").textContent.should.equal("1");

                const screenshot = window.document.querySelector("#collapseScenario00 img.screenshot");

                screenshot.src.startsWith("data:image/png;base64,iVBOR").should.equal(true);
            });
    });
});
