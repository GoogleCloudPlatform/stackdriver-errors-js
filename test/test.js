/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var expect = chai.expect;

var errorHandler;
var xhr, requests;

/** Helper function testing if a given message has been reported */
function expectRequestWithMessage(message) {
  expect(requests.length).to.equal(1);
  var sentBody = JSON.parse(requests[0].requestBody);
  expect(sentBody).to.include.keys('message');
  expect(sentBody.message).to.contain(message);
}

beforeEach(function() {
  window.onerror= function(){};

  errorHandler = new StackdriverErrorReporter();

  xhr = sinon.useFakeXMLHttpRequest();
  xhr.useFilters = true;
  xhr.addFilter(function (method, url) {
      return !url.match('clouderrorreporting');
  });

  requests = [];
  xhr.onCreate = function (req) {
    // Allow `onCreate` to complete so `xhr` can finish instantiating.
    setTimeout(function(){
      if(req.url.match('clouderrorreporting')) {
        requests.push(req);
      }
      req.respond(200, {"Content-Type": "application/json"}, '{}');
    }, 1);
  };
});

describe('Initialization', function () {
 it('should have default service', function () {
   errorHandler.start({key:'key', projectId:'projectId'});
   expect(errorHandler.serviceContext.service).to.equal('web');
 });

 it('should by default report uncaught exceptions', function () {
   errorHandler.start({key:'key', projectId:'projectId'});
   expect(errorHandler.reportUncaughtExceptions).to.equal(true);
 });

 it('should fail if no API key', function () {
   expect(function() {errorHandler.start({projectId:'projectId'});}).to.throw(Error, /API/);
 });

 it('should fail if no project ID', function () {
   expect(function() {errorHandler.start({key:'key'});}).to.throw(Error, /project/);
 });

});

describe('Disabling', function () {

 it('should not report errors if disabled', function (done) {
   errorHandler.start({key:'key', projectId:'projectId', disabled: true});
    errorHandler.report('do not report', function() {
      expect(requests.length).to.equal(0);
      done();
    });
 });

});

describe('Reporting errors', function () {
  beforeEach(function() {
    errorHandler.start({key:'key', projectId:'projectId'});
  });

  it('should report error messages with location', function (done) {
    var message = 'Something broke!';
    errorHandler.report(message, function() {
      expectRequestWithMessage(message);
      done();
    });
  });


  it('should extract and send stack traces from Errors', function (done) {
    var message = 'custom message';
    // PhantomJS only attaches a stack to thrown errors
    try {
      throw new TypeError(message);
    } catch(e) {
      errorHandler.report(e, function() {
        expectRequestWithMessage(message);
        done();
      });
    }
  });

});

describe('Unhandled exceptions', function () {

  it('should be reported by default', function (done) {
    errorHandler.start({key:'key', projectId:'projectId'});

    var message = 'custom message';
    try {
      throw new TypeError(message);
    } catch(e) {
      window.onerror(message, 'test.js', 42, 42, e);

      setTimeout(function(){
        expectRequestWithMessage(message);
        done();
      }, 10);
    }
  });

  it('should keep calling previous error handler if already present', function (done) {
    var originalOnErrorCalled = false;
    window.onerror = function(){ originalOnErrorCalled = true;};

    errorHandler.start({key:'key', projectId:'projectId'});

    var message = 'custom message';
    try {
      throw new TypeError(message);
    } catch(e) {
      window.onerror(message, 'test.js', 42, 42, e);
      expect(originalOnErrorCalled).to.be.true;
      done();
    }
  });

});

afterEach(function() {
  xhr.restore();
});
