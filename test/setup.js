// Setup for tests to run outside of a browser environment
/* eslint-disable no-global-assign,no-undef */
global.chai = require('chai');
global.sinon = require('sinon');

global.StackdriverErrorReporter = require('../stackdriver-errors');

global.window = window = {
  location: {href: 'http://stackdriver-errors.test/'},
  navigator: {userAgent: 'FakeAgent'},
};
global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
