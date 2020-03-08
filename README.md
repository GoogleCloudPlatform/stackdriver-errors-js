# Experimental Client-side JavaScript library for Stackdriver Error Reporting

> **This is not an official Google product.** This module is experimental and may not be ready for use.

[![Build Status][travis-ci status image]][travis-ci status link]

This **experimental** library provides Stackdriver Error Reporting support for client-side web JavaScript applications. [Stackdriver Error Reporting](https://cloud.google.com/error-reporting/) is a feature of Google Cloud Platform that allows in-depth monitoring and viewing of errors reported by applications running in almost any environment. For server-side Node.js error reporting, use [cloud-errors-nodejs](https://github.com/GoogleCloudPlatform/cloud-errors-nodejs) instead.

Here's an introductory video:

[![Learn about Error Reporting in Stackdriver][video thumbnail]][video link]

## Prerequisites

1. You need a [Google Cloud project](https://console.cloud.google.com).

2. [Enable the Stackdriver Error Reporting API](https://console.cloud.google.com/apis/api/clouderrorreporting.googleapis.com/overview) for your project. We highly recommend to restrict the usage of the key to your website URL only using an 'HTTP referrer' restriction.

3. Create a browser API key:
   - Follow [using api keys instructions](https://support.google.com/cloud/answer/6158862) to get an API key for your project.
   - Recommended: Use **Application restrictions** to restrict this key to your website.
   - Recommended: Use **API restrictions** to limit this key to the *Stackdriver Error Reporting API*.

If API keys are not an option for your team, [use a custom url](
#configuring-without-an-api-key) to send your errors to your backend.

## Quickstart

The library can either be used as a standalone script, or incorporated as a module into a larger javascript application.

For use in any HTML page or without a specific framework, include the standalone script from CDN and set up the error handler in a page load event.
For instance, use include the following HTML in the page `<head>` and replace:

* `<version>` with the [latest version of the NPM package](https://www.npmjs.com/package/stackdriver-errors-js) 
* `<my-api-key>` with your API key
* `<my-project-id>` with  and Google Cloud project ID string:

```HTML
<!-- Warning: Experimental library, do not use in production environments. -->
<script defer src="https://cdn.jsdelivr.net/npm/stackdriver-errors-js@<version>/dist/stackdriver-errors-concat.min.js"></script>
<script type="text/javascript">
window.addEventListener('DOMContentLoaded', function() {
  var errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    key: '<my-api-key>',
    projectId: '<my-project-id>'
    // Other optional arguments can also be supplied, see below.
  });
});
</script>
```
And that's all you need to do! Unhandled exceptions will now automatically be reported to your project.

### Test your setup

Open the page that you instrumented, open the Developer Tools console and enter the following to trigger an unhandled exception:

```javascript
(function testErrorReporting() {
  window.onerror(null, null, null, null, new Error('Test: Something broke!'));
})();
```

Open [Stackdriver Error Reporting](https://console.cloud.google.com/errors) to view the error and opt-in to notifications on new errors.


## Setup for JavaScript

### Installing

We recommend using npm: `npm install stackdriver-errors-js --save`.

### Initialization

Create a file that is included in your application entry point and has access to variables `myApiKey` and `myProjectId`. For ES6 projects it can be in the form:

```javascript
// Warning: Experimental library, do not use in production environments.
import StackdriverErrorReporter from 'stackdriver-errors-js';

const errorHandler = new StackdriverErrorReporter();
errorHandler.start({
    key: myApiKey,
    projectId: myProjectId,

    // The following optional arguments can also be provided:

    // service: myServiceName,
    // Name of the service reporting the error, defaults to 'web'.

    // version: myServiceVersion,
    // Version identifier of the service reporting the error.

    // reportUncaughtExceptions: false
    // Set to false to prevent reporting unhandled exceptions, default: `true`.

    // reportUnhandledPromiseRejections: false
    // Set to false to prevent reporting unhandled promise rejections, default: `true`.

    // disabled: true
    // Set to true to not send error reports, this can be used when developing locally, default: `false`.

    // context: {user: 'user1'}
    // You can set the user later using setUser()
});
```

Note this uses the ES6 import syntax, if your project does not use a compilation step, instead the source with dependencies and polyfills bundled can be used directly:

```javascript
var StackdriverErrorReporter = require('stackdriver-errors-js/dist/stackdriver-errors-concat.min.js');

var errorHandler = new StackdriverErrorReporter();
errorHandler.start({
    key: myApiKey,
    projectId: myProjectId,
    // Other optional arguments can be supplied, see above.
});
```

### Usage

Unhandled exception will now automatically be sent to Stackdriver Error Reporting.

You can also change your application code to report errors:

```javascript
try {
  ...
} catch(e) {
  errorHandler.report(e);
}
```

Or simply:

```javascript
errorHandler.report('Something broke!');
```

You can set a user identifier at any time using:

```javascript
errorHandler.setUser('userId')
```

## Setup for AngularJS

### Initialization

1. Load the `dist/stackdriver-errors-concat.min.js` JavaScript module.

2. Implement a new [AngularJS exception handler](https://docs.angularjs.org/api/ng/service/$exceptionHandler) for your application:

```javascript
angular.module('myAngularApp', [])

  .factory('$exceptionHandler', ['$log', '$window', function($log, $window) {
    var StackdriverErrors = new $window.StackdriverErrorReporter();
    StackdriverErrors.start({
      key: '<my-api-key>',
      projectId: '<my-project-id>',
      // Other optional arguments can be supplied, see above.
    });

    return function(exception, cause) {
      StackdriverErrors.report(exception);
      $log.warn('Reported error:', exception, cause);
    };
  }])
```

### Usage

Uncaught exception in angular expressions will now be reported to Stackdriver Error Reporting.

If you wish, you can manually delegate exceptions, for instance:
```javascript
try { ... } catch(e) { $exceptionHandler(e); }
```
Or simply:
```javascript
$exceptionHandler('Something broke!');
```

## Setup for ReactJS

Follow the general instructions denoted in _Setup for JavaScript_ to load and initialize the library.

There is nothing specific that needs to be done with React, other than making sure to initialize the library in your root entry point (typically `index.js`).

## Source maps

Only publicly available JavaScript source maps are supported.

Your minified file need to be appended with a comment directive to your source map file:

```javascript
//# sourceMappingURL=http://example.com/path/to/your/sourcemap.map
```

## Configuring without an API key

If you are in a situation where an API key is not an option but you already have an acceptable way to communicate with the Stackdriver API (e.g., a secure back end service running in App Engine), you can configure the endpoint that errors are sent to with the following:

```javascript
const errorHandler = new StackdriverErrorReporter();
errorHandler.start({
  targetUrl: '<my-custom-url>',
  service: '<my-service>',              // (optional)
  version: '<my-service-version>'       // (optional)
});
```

where `targetUrl` is the url you'd like to send errors to and can be relative or absolute. This endpoint will need to support the [Report API endpoint](https://cloud.google.com/error-reporting/reference/rest/v1beta1/projects.events/report).

## Custom message dispatching

If you can't use HTTP Post requests for reporting your errors, or in need for some more complicated customizations, you may provide a custom function to handle the reporting.

The function will be called with a payload argument (the same one that would have been sent on the HTTP Post request) and should return a Promise.  

```javascript
const errorHandler = new StackdriverErrorReporter();
function myCustomFunction(payload) {
  console.log("custom reporting function called with payload:", payload);
  return Promise.resolve(); 
}
errorHandler.start({
  customReportingFunction: myCustomFunction,
});
```

## Best Practices

### Only reporting in the production environment with Webpack

If using webpack and the `DefinePlugin`, it is advisable to wrap the initialization logic to only occur in your production environment. Otherwise, with local development you will receive 403s if you restricted your API key to your production environment(which is _HIGHLY_ recommended). The code for this would look something along these lines:

```javascript
// webpack.production.js

module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],
  // ...
}
```

```javascript
// index.js

if (process.env.NODE_ENV === 'production') {
  const errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    key: '<my-project-id>',
    projectId: '<my-project-id>',
  });
}
```

### Usage as a utility

If you would like to use the error logger throughout your application, there are many options that exist. The simplest is to pull the initialization logic into its own file and reference it as necessary throughout your application as a module. An example would be as follows:

```javascript
// errorHandlerUtility.js
import StackdriverErrorReporter from 'stackdriver-errors-js';

let errorHandler;

if (process.env.NODE_ENV === 'production') {
  errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    key: '<my-project-id>',
    projectId: '<my-project-id>',
    // Other optional arguments can be supplied, see above.
  });
} else {
  errorHandler = {report: console.error};
}

export default errorHandler;
```

Consumption of `errorHandlerUtility` would essentially follow the following pattern:

```javascript
import errorHandler from './errorHandlerUtility';

try {
  someFunctionThatThrows();
} catch (error) {
  errorHandler.report(error);
}
```

If the call to report has additional levels of wrapping code, extra frames can be trimmed from the top of generated stacks by using a number greater than one for the `skipLocalFrames` option:

```javascript
import errorHandler from './errorHandlerUtility';

function backendReport (string) {
  // Skipping the two frames, for report() and for backendReport()
  errorHandler.report(error, {skipLocalFrames: 2});
}
```

## FAQ

**Q: Should I use this code in my production application?**
A: This is an experimental library provided without any guarantee or official support. We do not recommend using it on production without performing a review of its code.

**Q: Are private source maps supported?**
A: No, see [issue #4](https://github.com/GoogleCloudPlatform/stackdriver-errors-js/issues/4).

**Q: Can I propose changes to the library?**
A: Yes, see [the Contributing documentation](CONTRIBUTING.md) for more details.


[travis-ci status image]: https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js.svg?branch=master
[travis-ci status link]: https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js
[david-dm status image]: https://david-dm.org/GoogleCloudPlatform/stackdriver-errors-js.svg
[david-dm status link]: https://david-dm.org/GoogleCloudPlatform/stackdriver-errors-js
[video thumbnail]: https://img.youtube.com/vi/cVpWVD75Hs8/0.jpg
[video link]: https://www.youtube.com/watch?v=cVpWVD75Hs8
