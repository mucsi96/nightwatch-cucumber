/* global client */
const testCaseFactory = require('../test/test-case-factory')
const examples = {
  background,
  group,
  hooks,
  multi,
  outlines,
  pageObject,
  paralell,
  programmatical,
  simple,
  tag,
  babel,
  pendingWithNoStrict
}

function background () {
  return testCaseFactory
    .create('background-example')
    .feature('Background support')
    .background()
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .scenario('Addition')
    .when('I search for "500+120"', (text) => {
      return client
        .setValue('input[name=q]', text)
        .submitForm('input[name=q]')
    })
    .then('the search result should contain "620"', (text) => {
      return client.assert.containsText('body', text)
    })
    .scenario('Division')
    .when('I search for "36/6"')
    .then('the search result should contain "6"')
}

function group () {
  return testCaseFactory
    .create('group-example')
    .group('group')
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
}

function hooks () {
  return testCaseFactory
    .create('hooks-example', {
      hooks: true
    })
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      return client
        .url('http://yahoo.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', () => {
      return client.assert.visible('input[name="p"]')
    })
}

function multi () {
  return testCaseFactory
    .create('multi-example')
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      return client
        .url('http://yahoo.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', () => {
      return client.assert.visible('input[name="p"]')
    })
}

function outlines () {
  return testCaseFactory
    .create('outlines-example')
    .feature('Scenario outlines support')
    .scenarioOutline('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .when('I search for <expression>', (expression) => {
      return client
        .setValue('input[name=q]', expression)
        .submitForm('input[name=q]')
    })
    .then('the search result should contain <result>', (result) => {
      return client.assert.containsText('body', result)
    })
    .example('expression', 'result')
    .example('36/6', '6')
    .example('500+120', '620')
}

function pageObject () {
  return testCaseFactory
    .create('page-object-example')
    .pageObject('yahoo', `module.exports = {
  url: 'http://yahoo.com',
  elements: {
    body: 'body',
    searchBar: 'input[name="p"]'
  }
}`)
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      const yahoo = client.page.yahoo()

      return yahoo
        .navigate()
        .waitForElementVisible('@body', 1000)
    })
    .then('the title is "Yahoo"', (text) => {
      return client.assert.title(text)
    })
    .and('the Yahoo search form exists', () => {
      const yahoo = client.page.yahoo()

      return yahoo.assert.visible('@searchBar')
    })
}

function paralell () {
  return testCaseFactory
    .create('paralell-example', { paralell: true })
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      return client
        .url('http://yahoo.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', () => {
      return client.assert.visible('input[name="p"]')
    })
}

function programmatical () {
  return testCaseFactory
    .create('programmatical-example')
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      return client
        .url('http://yahoo.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', () => {
      return client.assert.visible('input[name="p"]')
    })
}

function simple () {
  return testCaseFactory
    .create('simple-example')
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
}

function tag () {
  return testCaseFactory
    .create('tag-example')
    .feature('Google Search', ['google-search'])
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return client.assert.title(text)
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search', ['yahoo-search'])
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', () => {
      return client
        .url('http://yahoo.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', () => {
      return client.assert.visible('input[name="p"]')
    })
}

function babel () {
  return testCaseFactory
    .create('babel-example', { babel: true })
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', `async () => {
      await client.url('http://google.com')
      await client.waitForElementVisible('body', 1000)
    }`)
    .then('the title is "Google"', `async (text) => {
      await client.assert.title(text)
    }`)
    .and('the Google search form exists', `async () => {
      await client.assert.visible('input[name="q"]')
    }`)
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
    .feature('Yahoo Search')
    .scenario('Searching Yahoo')
    .given('I open Yahoo`s search page', `async () => {
      await client.url('http://yahoo.com')
      await client.waitForElementVisible('body', 1000)
    }`)
    .then('the title is "Yahoo"')
    .and('the Yahoo search form exists', `async () => {
      await client.assert.visible('input[name="p"]')
    }`)
}

function pendingWithNoStrict () {
  return testCaseFactory
    .create('pending-with-no-strict-example', { cucumberArgs: ['--no-strict'] })
    .feature('Google Search')
    .scenario('Searching Google')
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .then('the title is "Google"', (text) => {
      return 'pending'
    })
    .and('the Google search form exists', () => {
      return client.assert.visible('input[name="q"]')
    })
    .scenario('Searching Google again')
    .given('I open Google`s search page')
    .then('the title is "Google"')
    .and('the Google search form exists')
}

Object.keys(examples).forEach((name) => {
  examples[name]().build({examples: true})
})
