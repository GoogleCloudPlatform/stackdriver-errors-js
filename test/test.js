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

/** 
 * Helper function testing if a given message has been reported
 */
function expectRequestWithMessage(message) {
  expect(requests.length).to.equal(1);
  var sentBody = JSON.parse(requests[0].requestBody);
  expect(sentBody).to.include.keys('message');
  expect(sentBody.message).to.contain(message);
}

/**
 * Helper for testing call stack reporting
 */
function throwError(message) {
  throw new TypeError(message);
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

 it('should fail if no API key or custom url', function () {
   expect(function() {errorHandler.start({projectId:'projectId'});}).to.throw(Error, /API/);
 });

 it('should fail if no project ID or custom url', function () {
   expect(function() {errorHandler.start({key:'key'});}).to.throw(Error, /project/);
 });

 it('should fail if StackTrace is undefined', function () {
   var stackTrace = window.StackTrace
   delete window.StackTrace
   expect(function() {errorHandler.start({projectId:'projectId', key:'key'});}).to.throw(Error, /StackTrace/);
   window.StackTrace = stackTrace 
 });

 it('should succeed if custom target url provided without API key or project id', function () {
   expect(function() {errorHandler.start({targetUrl:'custom-url'});}).to.not.throw();
 });

 it('should have default context', function () {
   errorHandler.start({key:'key', projectId:'projectId'});
   expect(errorHandler.context).to.eql({});
 });

 it('should allow to specify a default context', function () {
   errorHandler.start({context: { user: '1234567890' }, key:'key', projectId:'projectId'});
   expect(errorHandler.context).to.eql({ user: '1234567890' });
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
  describe('Default configuration', function() {
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

    it('should extract and send functionName in stack traces', function (done) {
      var message = 'custom message';
      // PhantomJS only attaches a stack to thrown errors
      try {
        throwError(message)
      } catch(e) {
        errorHandler.report(e, function() {
          expectRequestWithMessage('throwError');
          done();
        });
      }
    });

    it('should set in stack traces when frame is anonymous', function (done) {
      var message = 'custom message';
      // PhantomJS only attaches a stack to thrown errors
      try {
        (function () {
          throw new TypeError(message);
        })()
      } catch(e) {
        errorHandler.report(e, function() {
          expectRequestWithMessage('<anonymous>');
          done();
        });
      }
    });
  });

  describe('Custom target url configuration', function() {
    it('should report error messages with custom url config', function (done) {
      var targetUrl = 'config-uri-clouderrorreporting';
      errorHandler.start({targetUrl:targetUrl});

      var message = 'Something broke!';
      errorHandler.report(message, function() {
        expectRequestWithMessage(message);
        expect(requests[0].url).to.equal(targetUrl);

        done();
      });
    });
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

describe('Setting user', function() {
  it('should set the user in the context', function () {
    errorHandler.start({key:'key', projectId:'projectId'});
    errorHandler.setUser('1234567890');
    expect(errorHandler.context.user).to.equal('1234567890');
    errorHandler.setUser();
    expect(errorHandler.context.user).to.equal(undefined);
  });
});

afterEach(function() {
  xhr.restore();
});
