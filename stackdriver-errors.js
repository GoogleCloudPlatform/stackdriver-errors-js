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
(function(exports) {
  "use strict";

  var StackdriverErrorReporting = function() {};
  exports.StackdriverErrorReporting = StackdriverErrorReporting;

  StackdriverErrorReporting.prototype.init = function(config) {
    if(!config.key) {
      throw new Error('Cannot initialize: No API key provided.');
    }
    if(!config.projectId) {
      throw new Error('Cannot initialize: No project ID provided.');
    }

    this.apiKey = config.key;
    this.projectId = config.projectId;
    this.serviceContext = config.serviceContext || {service: 'web'};
    this.reportUncaughtExceptions = config.reportUncaughtExceptions || true;

    // Register as global error handler if requested
    var that = this;
    if(this.reportUncaughtExceptions) {
      window.onerror = function(message, source, lineno, colno, error) {
        that.report(error);
      };
    }
  };

  StackdriverErrorReporting.prototype.report = function(err) {
    if(!err) {return;}

    var payload = {};
    payload.serviceContext = this.serviceContext;
    payload.context = {
      httpRequest: {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      }
    };

    // Warning: err.stack is not a standard Error attribute
    //(see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack)
    if(err.stack) {
      payload.message = err.stack;
    } else {
      payload.message = err.toString();

      payload.context.reportLocation = {
        filePath: 'stackdriver-errors.js',
        functionName: 'report'
      };
    }

    this.sendErrorPayload(payload);
  };

  StackdriverErrorReporting.prototype.sendErrorPayload = function(payload) {
    var baseUrl = "https://clouderrorreporting.googleapis.com/v1beta1/projects/";
    var url = baseUrl + this.projectId + "/events:report?key=" + this.apiKey;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(payload));
    xhr.onloadend = function () {
      console.log('[Stackdriver Error Reporting]: Error reported', payload);
    };
  };
})(this);
