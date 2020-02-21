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
var fakeXhr = nise.fakeXhr;

var errorHandler;
var xhr, requests, requestHandler;
var WAIT_FOR_STACKTRACE_FROMERROR = 15;

/**
 * Helper function testing if a given message has been reported
 * @param {string} [message] - Substring that message must contain.
 */
function expectRequestWithMessage(message) {
  expect(requests.length).to.equal(1);
  var sentBody = JSON.parse(requests[0].requestBody);
  expect(sentBody).to.include.keys('message');
  expect(sentBody.message).to.contain(message);
}

/**
 * Helper function testing if a given message has been reported inside a payload
 * @param {string} [payload] - payload
 * @param {string} [message] - Substring that message must contain.
 */
function expectPayloadWithMessage(payload, message) {
  var sentBody = payload;
  expect(sentBody).to.include.keys('message');
  expect(sentBody.message).to.contain(message);
}

/**
 * Helper for testing call stack reporting
 * @param {string} [message] - Contents of error to throw.
 */
function throwError(message) {
  throw new TypeError(message);
}

beforeEach(function() {
  window.onerror= function() {};
  window.onunhandledrejection = function() {};
  errorHandler = new StackdriverErrorReporter();

  xhr = fakeXhr.useFakeXMLHttpRequest();
  xhr.useFilters = true;
  xhr.addFilter(function(method, url) {
    return !url.match('clouderrorreporting');
  });

  requests = [];
  requestHandler = function(req) {
    req.respond(200, {'Content-Type': 'application/json'}, '{}');
  };
  xhr.onCreate = function(req) {
    // Allow `onCreate` to complete so `xhr` can finish instantiating.
    setTimeout(function() {
      if (req.url.match('clouderrorreporting')) {
        requests.push(req);
        requestHandler(req);
      }
    }, 1);
  };
});

describe('Initialization', function() {
  it('should have default service', function() {
    errorHandler.start({key: 'key', projectId: 'projectId'});
    expect(errorHandler.serviceContext.service).to.equal('web');
  });

  it('should by default report uncaught exceptions', function() {
    errorHandler.start({key: 'key', projectId: 'projectId'});
    expect(errorHandler.reportUncaughtExceptions).to.equal(true);
  });

  it('should by default report unhandled promise rejections', function() {
    errorHandler.start({key: 'key', projectId: 'projectId'});
    expect(errorHandler.reportUnhandledPromiseRejections).to.equal(true);
  });

  it('should fail if no API key or custom url or custom func', function() {
    expect(function() {
      errorHandler.start({projectId: 'projectId'});
    }).to.throw(Error, /API/);
  });

  it('should fail if no project ID or custom url or custom func', function() {
    expect(function() {
      errorHandler.start({key: 'key'});
    }).to.throw(Error, /project/);
  });

  it('should succeed if custom target url provided without API key or project id', function() {
    expect(function() {
      errorHandler.start({targetUrl: 'custom-url'});
    }).to.not.throw();
  });

  it('should succeed if custom function provided without API key or project id', function() {
    expect(function() {
      function f() {

      }
      errorHandler.start({customReportingFunction: f});
    }).to.not.throw();
  });

  it('should have default context', function() {
    errorHandler.start({key: 'key', projectId: 'projectId'});
    expect(errorHandler.context).to.eql({});
  });

  it('should allow to specify a default context', function() {
    errorHandler.start({context: {user: '1234567890'}, key: 'key', projectId: 'projectId'});
    expect(errorHandler.context).to.eql({user: '1234567890'});
  });
});

describe('Disabling', function() {
  it('should not report errors if disabled', function() {
    errorHandler.start({key: 'key', projectId: 'projectId', disabled: true});
    return errorHandler.report('do not report').then(function() {
      expect(requests.length).to.equal(0);
    });
  });
});

describe('Reporting errors', function() {
  describe('Default configuration', function() {
    beforeEach(function() {
      errorHandler.start({key: 'key', projectId: 'projectId'});
    });

    it('should report error messages with location', function() {
      var message = 'Something broke!';
      return errorHandler.report(message).then(function() {
        expectRequestWithMessage(message);
      });
    });

    it('should include report origin by default', function() {
      var helper = function helperFn(handler) {
        return handler.report('common message');
      };
      return helper(errorHandler).then(function() {
        expectRequestWithMessage(': common message\n    at helperFn (');
      });
    });

    it('should skip number of frames if option is given', function() {
      var helper = function outerFn(handler) {
        return (function innerFn() {
          return handler.report('common message', {skipLocalFrames: 2});
        })();
      };
      return helper(errorHandler).then(function() {
        expectRequestWithMessage(': common message\n    at outerFn (');
      });
    });

    it('should extract and send stack traces from Errors', function() {
      var message = 'custom message';
      // Throw and catch error to attach a stacktrace
      try {
        throw new TypeError(message);
      } catch (e) {
        return errorHandler.report(e).then(function() {
          expectRequestWithMessage(message);
        });
      }
    });

    it('should extract and send functionName in stack traces', function() {
      var message = 'custom message';
      // Throw and catch error to attach a stacktrace
      try {
        throwError(message);
      } catch (e) {
        return errorHandler.report(e).then(function() {
          expectRequestWithMessage('throwError');
        });
      }
    });

    it('should set in stack traces when frame is anonymous', function() {
      var message = 'custom message';
      // Throw and catch error to attach a stacktrace
      try {
        (function() {
          throw new TypeError(message);
        })();
      } catch (e) {
        return errorHandler.report(e).then(function() {
          expectRequestWithMessage('<anonymous>');
        });
      }
    });

    it('should resolve with stacktrace in message', function() {
      try {
        throwError('mystery problem');
      } catch (e) {
        return errorHandler.report(e).then(function(details) {
          var expected = ': mystery problem\n    at throwError (';
          expectRequestWithMessage(expected);
          expect(details.message).to.contain(expected);
        });
      }
    });

    describe('XHR error handling', function() {
      it('should handle network error', function() {
        requestHandler = function(req) {
          req.error();
        };
        var message = 'News that will fail to send';
        return errorHandler.report(message).then(function() {
          throw new Error('unexpected fulfilled report');
        }, function(err) {
          expectRequestWithMessage(message);
          expect(err.message).to.equal('network error on stackdriver report');
        });
      });

      it('should handle http error', function() {
        requestHandler = function(req) {
          req.respond(503, {'Content-Type': 'text/plain'}, '');
        };
        errorHandler.start({key: 'key', projectId: 'projectId'});
        var message = 'News that was rejected on send';
        return errorHandler.report(message).then(function() {
          throw new Error('unexpected fulfilled report');
        }, function(err) {
          expectRequestWithMessage(message);
          expect(err.message).to.equal('503 http response on stackdriver report');
        });
      });
    });
  });

  describe('Custom target url configuration', function() {
    it('should report error messages with custom url config', function() {
      var targetUrl = 'config-uri-clouderrorreporting';
      errorHandler.start({targetUrl: targetUrl});

      var message = 'Something broke!';
      return errorHandler.report(message).then(function() {
        expectRequestWithMessage(message);
        expect(requests[0].url).to.equal(targetUrl);
      });
    });
  });

  describe('Custom reporting function', function() {
    it('should report error messages only to custom function', function() {
      var funcResult = null;
      function customFunc(payload) {
        funcResult = payload;
        return Promise.resolve();
      }
      errorHandler.start({customReportingFunction: customFunc});

      var message = 'Something broke!';
      return errorHandler.report(message).then(function() {
        expectPayloadWithMessage(funcResult, message);
        expect(requests.length).to.equal(0);
      });
    });
  });

  describe('Custom http request context', function() {
    it('should report error messages with custom http request context', function() {
      var method = 'GET';
      var userAgent = 'bot';
      var remoteIp = '123.45.67.89';

      var httpRequestContext = {
        method: method,
        userAgent: userAgent,
        remoteIp: remoteIp,
      };

      var context = {
        httpRequest: httpRequestContext,
      };

      errorHandler.start({context: context});

      var message = 'Something broke!';
      return errorHandler.report(message).then(function() {
        expectRequestWithMessage(message);
        expectRequestWithMessage('method: ' + method);
        expectRequestWithMessage('userAgent: ' + userAgent);
        expectRequestWithMessage('remoteIp: ' + remoteIp);
        expectRequestWithMessage('url'); // specified to be window.location.href by default
      });
    });
  });
});

describe('Unhandled exceptions', function() {
  it('should be reported by default', function(done) {
    errorHandler.start({key: 'key', projectId: 'projectId'});

    var message = 'custom message';
    try {
      throw new TypeError(message);
    } catch (e) {
      window.onerror(message, 'test.js', 42, 42, e);

      setTimeout(function() {
        expectRequestWithMessage(message);
        done();
      }, WAIT_FOR_STACKTRACE_FROMERROR);
    }
  });

  it('should keep calling previous error handler if already present', function(done) {
    var originalOnErrorCalled = false;
    window.onerror = function() {
      originalOnErrorCalled = true;
    };

    errorHandler.start({key: 'key', projectId: 'projectId'});

    var message = 'custom message';
    try {
      throw new TypeError(message);
    } catch (e) {
      window.onerror(message, 'test.js', 42, 42, e);

      setTimeout(function() {
        expect(originalOnErrorCalled).to.be.true;
        done();
      }, WAIT_FOR_STACKTRACE_FROMERROR);
    }
  });
});

describe('Unhandled promise rejections', function() {
  it('should be reported by default', function(done) {
    errorHandler.start({key: 'key', projectId: 'projectId'});

    var message = 'custom promise rejection message';
    try {
      throwError(message);
    } catch (e) {
      var promiseRejectionEvent = {reason: e};

      window.onunhandledrejection(promiseRejectionEvent);

      setTimeout(function() {
        expectRequestWithMessage(message);
        done();
      }, WAIT_FOR_STACKTRACE_FROMERROR);
    }
  });

  it('should keep calling previous promise rejection handler if already present', function(done) {
    var originalOnUnhandledRejectionCalled = false;
    window.onunhandledrejection = function() {
      originalOnUnhandledRejectionCalled = true;
    };

    errorHandler.start({key: 'key', projectId: 'projectId'});

    var message = 'custom promise rejection message';
    var promiseRejectionEvent = {reason: new TypeError(message)};

    window.onunhandledrejection(promiseRejectionEvent);

    setTimeout(function() {
      expect(originalOnUnhandledRejectionCalled).to.be.true;
      done();
    }, WAIT_FOR_STACKTRACE_FROMERROR);
  });
});

describe('Setting user', function() {
  it('should set the user in the context', function() {
    errorHandler.start({key: 'key', projectId: 'projectId'});
    errorHandler.setUser('1234567890');
    expect(errorHandler.context.user).to.equal('1234567890');
    errorHandler.setUser();
    expect(errorHandler.context.user).to.equal(undefined);
  });
});

afterEach(function() {
  xhr.restore();
});
