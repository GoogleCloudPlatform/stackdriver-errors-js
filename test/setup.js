// Setup for tests to run outside of a browser environment
/* global global */
global.chai = require('chai');
global.sinon = require('sinon');

global.StackdriverErrorReporter = require('../stackdriver-errors');

global.window = {
  location: {href: 'http://stackdriver-errors.test/'},
  navigator: {userAgent: 'FakeAgent'},
};
global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
