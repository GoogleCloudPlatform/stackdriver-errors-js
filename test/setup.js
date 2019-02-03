// Setup for tests to run outside of a browser environment
global.chai = require('chai');
global.nise = require('nise');

global.StackdriverErrorReporter = require('../stackdriver-errors');

global.window = {
  location: {href: 'http://stackdriver-errors.test/'},
  navigator: {userAgent: 'FakeAgent'},
};
global.XMLHttpRequest = nise.fakeXhr.FakeXMLHttpRequest;
