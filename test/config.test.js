const chai = require("chai");

chai.should();
const testCaseFactory = require("./test-case-factory");

describe("Config", () => {
    it("should pass cucumberArgs as additional CLI parameters to cucumber", () => {
        return testCaseFactory
            .create("config-cucumber-args-test", {
                nightwatchClientAsParameter: true,
                cucumberArgs: "--format progress --format-options {\"colorsEnabled\":false}"
            })
            .feature("addition")
            .scenario("small numbers")
            .given("User is on the simple calculator page", (client) => {
                client.init();
            })
            .and("User enter 4 in A field", (client) => {
                client.setValue("#a", 4);
            })
            .and("User enter 5 in B field", (client) => {
                client.setValue("#b", 5);
            })
            .when("User press Add button", (client) => {
                client.click("#add");
            })
            .then("The result should contain 9", (client) => {
                client.assert.containsText("#result", 9);
            })
            .scenario("big numbers")
            .given("User is on the simple calculator page")
            .and("User enter 4 in A field")
            .and("User enter 5 in B field")
            .when("User press Add button")
            .then("The result should contain 9")
            .run()
            .then((result) => {
                result.output.should.contain("..........");
            });
    });
});
