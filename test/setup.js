// Setup for tests to run outside of a browser environment
/* eslint-disable no-global-assign,no-undef */
global.chai = require('chai');
global.sinon = require('sinon');

global.StackTrace = require('stacktrace-js');

var stackdriverErrors = require('../stackdriver-errors');
global.StackdriverErrorReporter = stackdriverErrors.StackdriverErrorReporter;

global.window = window = {
  location: {href: 'http://stackdriver-errors.test/'},
  navigator: {userAgent: 'FakeAgent'},
};
global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
