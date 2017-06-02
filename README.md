# Experimental Client-side JavaScript library for Stackdriver Error Reporting

> **This is not an official Google product.** This module is experimental and may not be ready for use.

[![Build Status](https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js.svg?branch=master)](https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js)
[![Dependency Status](https://david-dm.org/GoogleCloudPlatform/stackdriver-errors-js.svg)](https://david-dm.org/GoogleCloudPlatform/stackdriver-errors-js)

This **experimental** library provides Stackdriver Error Reporting support for client-side web JavaScript applications.
[Stackdriver Error Reporting](https://cloud.google.com/error-reporting/) is a feature of Google Cloud Platform that allows in-depth monitoring and viewing of errors reported by applications running in almost any environment. For server-side Node.js error reporting, use [this other library](https://github.com/GoogleCloudPlatform/cloud-errors-nodejs).

Here's an introductory video:

[![Learn about Error Reporting in Stackdriver](https://img.youtube.com/vi/cVpWVD75Hs8/0.jpg)](https://www.youtube.com/watch?v=cVpWVD75Hs8)

## Prerequisites

1. You need a [Google Cloud project](https://console.cloud.google.com).
1. [Enable the Stackdriver Error Reporting API](https://console.cloud.google.com/apis/api/clouderrorreporting.googleapis.com/overview) for your project. We highly recommend to restrict the usage of the key to your website URL only using an 'HTTP referrer' restriction.
1. Create a browser API key: Follow [these instructions](https://support.google.com/cloud/answer/6158862) to get an API key for your project.

## Quickstart

**Load and initialize the experimental library**

Add this line in your HTML code, before `</head>` and replace `<my-api-key>` and `<my-project-id>` with your API key and Google Cloud project ID string:

```HTML
<!-- Warning: This is an experimental library, do not use it on production environments -->
<script src="https://cdn.rawgit.com/GoogleCloudPlatform/stackdriver-errors-js/v0.0.6/dist/stackdriver-errors-concat.min.js"></script>
<script type="text/javascript">
var errorHandler = new StackdriverErrorReporter();
errorHandler.start({
  key: '<my-api-key>',
  projectId: '<my-project-id>'
});
</script>
```
And that's all you need to do! Unhandled exceptions will now automatically be reported to your project.

**Test your setup**

Open the page that you instrumented, open the Devtools console and enter the following to trigger an unhandled exception:

```JS
(function testErrorReporting() {window.onerror(null, null, null, null, new Error('Test: Something broke!'));})();
```

  Open Stackdriver Error Reporting at https://console.cloud.google.com/errors to view the error and opt-in to notifications on new errors.


## Setup for JavaScript

### Initialization

Here are all the initialization options available:

```HTML
<!-- Warning: This is an experimental library -->
<script src="https://cdn.rawgit.com/GoogleCloudPlatform/stackdriver-errors-js/v0.0.6/dist/stackdriver-errors-concat.min.js"></script>
<script type="text/javascript">
var errorHandler = new StackdriverErrorReporter();
errorHandler.start({
  key: '<my-api-key>',
  projectId: '<my-project-id>',
  service: '<my-service>',              // (optional)
  version: '<my-service-version>'       // (optional)
  // reportUncaughtExceptions: false    // (optional) Set to false to stop reporting unhandled exceptions.
  // disabled: true                     // (optional) Set to true to not report errors when calling report(), this can be used when developping locally.
});
</script>
```

### Usage

Unhandled exception will now automatically be reported to Stackdriver Error Reporting.

You can also change your application code to report errors: `try { ... } catch(e) { errorHandler.report(e); }` or simply `errorHandler.report('Something broke!');`.

### Source maps

Only publicly available JavaScript source maps are supported.

Your minified file need to be appended with a comment directive to your source map file:
```JS
//# sourceMappingURL=http://example.com/path/to/your/sourcemap.map
```


## Setup for AngularJS

### Initialization

1. Load the `dist/stackdriver-errors-concat.min.js` JavaScript module.

2. Implement a new [exception handler](https://docs.angularjs.org/api/ng/service/$exceptionHandler) for your AngularJS application:

```JS
angular.module('myAngularApp', [])

  .factory('$exceptionHandler', ['$log', '$window', function($log, $window) {
    var StackdriverErrors = new $window.StackdriverErrorReporter();
    StackdriverErrors.start({
      key: '<my-api-key>',
      projectId: '<my-project-id>',
      service: '<my-service>',              // (optional)
      version: '<my-service-version>'       // (optional)
    });

    return function(exception, cause) {
      StackdriverErrors.report(exception);
      $log.warn('Reported error:', exception, cause);
    };
  }])
```

### Usage

Uncaught exception in angular expressions will now be reported to Stackdriver Error Reporting.

If you wish, you can manually delegate exceptions, e.g. `try { ... } catch(e) { $exceptionHandler(e); }` or simply `$exceptionHandler('Something broke!');`.

## Setup for ReactJS

Follow the general instructions denoted in _Setup for JavaScript_ to load and initialize the library.  

There is nothing specific that needs to be done with React, other than making sure to initialize the library in your root entry point(typically `index.js`).

## Best Practices

### Only reporting in the production environment with Webpack

If using webpack and the `DefinePlugin`, it is advisable to wrap the initialization logic to only occur in your production environment.  Otherwise, with local development you will receive 403s if you restricted your API key to your production environment(which is _HIGHLY_ recommended).  The code for this would look something along these lines:

```javascript
// webpack.production.js
// The rest of your webpack configuration
// ...
plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  // Your other plugins
]
// ...
// The rest of your webpack configuration
```

```javascript
// index.js
const environment = process.env.NODE_ENV;

if (environment === 'production') {
  const errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    key: '<my-project-id>',
    projectId: '<my-project-id>',
    service: '<my-service>',              // (optional)
    version: '<my-service-version>'       // (optional)
  });
}    
```

### Usage as a utility

If you would like to use the error logger throughout your application, there are many options that exist.  The simplest is to pull the initialization logic into its own file and reference it as necessary throughout your application as a module.  An example would be as follows:

```javascript
// errorHandlerUtility.js

const environment = process.env.NODE_ENV;

let errorHandler;

if (environment === 'production') {

  errorHandler = new StackdriverErrorReporter();
  errorHandler.start({
    key: '<my-project-id>',
    projectId: '<my-project-id>',
    service: '<my-service>',              // (optional)
    version: '<my-service-version>'       // (optional)
  });

} else {
  errorHandler = console.error;
}

export default errorHandler;

```

Consumption of the errorHandlerUtility would essentially follow the following pattern:

```javascript
// MyComponent.jsx
import errorHandler from './errorHandlerUtility';

// Some example code that throws an error
.catch(error) {
  errorHandler.report(error);
}

```

## FAQ

**Q: Should I use this code in my production application?** A: This is an experimental library provided without any guarantee or official support. We do not recommend using it on production without performing a review of its code.

**Q: Are private source maps supported?** A: No

## Developing the library

Install developer dependencies with `npm install --dev` and install `gulp` with `npm install -g gulp`

* Run `gulp` to test your changes.
* Run `gulp dist` generates the minified version.

Start a web server at the root of this repo and open `demo/demo.html` to test reporting errors from the local library with your API key and project ID.
