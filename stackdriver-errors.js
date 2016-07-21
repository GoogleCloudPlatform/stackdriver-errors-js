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

  /**
   * An Error handler that sends errors to the Stackdriver Error Reporting API.
   */
  var StackdriverErrorReporting = function() {};
  exports.StackdriverErrorReporting = StackdriverErrorReporting;

  /**
   * Initialize the StackdriverErrorReporting object.
   * @param {Object} config - the init configuration.
   * @param {String} config.key - the API key to use to call the API.
   * @param {String} config.projectId - the Google Cloud Platform project ID to report errors to.
   * @param {String} [config.service=web] - service identifier.
   * @param {String} [config.version] - version identifier.
   * @param {Boolean} [config.reportUncaughtExceptions=true] - Set to false to stop reporting unhandled exceptions.
   * @param {Boolean} [config.disabled=false] - Set to true to not report errors when calling report(), this can be used when developping locally.
   */
  StackdriverErrorReporting.prototype.init = function(config) {
    if(!config.key) {
      throw new Error('Cannot initialize: No API key provided.');
    }
    if(!config.projectId) {
      throw new Error('Cannot initialize: No project ID provided.');
    }

    this.apiKey = config.key;
    this.projectId = config.projectId;
    this.serviceContext = {service: 'web'};
    if(config.service) {
      this.serviceContext.service = config.service;
    }
    if(config.version) {
      this.serviceContext.version = config.version;
    }
    this.reportUncaughtExceptions = config.reportUncaughtExceptions || true;
    this.disabled = config.disabled || false;

    // Register as global error handler if requested
    var that = this;
    if(this.reportUncaughtExceptions) {
      window.onerror = function(message, source, lineno, colno, error) {
        that.report(error);
      };
    }
  };

  /**
   * Report an error to the Stackdriver Error Reporting API
   * @param {Error|String} err - The Error object or message string to report.
   */
  StackdriverErrorReporting.prototype.report = function(err) {
    if(this.disabled) {return;}
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
