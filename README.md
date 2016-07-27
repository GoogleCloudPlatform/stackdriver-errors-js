# Experimental Client-side JavaScript library for Stackdriver Error Reporting

> **This is not an official Google product.** This module is experimental and may not be ready for use.
> This module uses APIs that may be undocumented and are subject to change without notice.

[![Build Status](https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js.svg?branch=master)](https://travis-ci.org/GoogleCloudPlatform/stackdriver-errors-js)

This **experimental** library provides Stackdriver Error Reporting support for client-side web JavaScript applications.
[Stackdriver Error Reporting](https://cloud.google.com/error-reporting/) is a feature of Google Cloud Platform that allows in-depth monitoring and viewing of errors reported by applications running in almost any environment. Here's an introductory video:

[![Learn about Error Reporting in Stackdriver](https://img.youtube.com/vi/cVpWVD75Hs8/0.jpg)](https://www.youtube.com/watch?v=cVpWVD75Hs8)

## Prerequisites

1. You need a [Google Cloud project](https://console.cloud.google.com).
1. [Enable the Stackdriver Error Reporting API](https://console.cloud.google.com/apis/api/clouderrorreporting.googleapis.com/overview) for your project.

## Quickstart

1. **Create an API key:**

  Follow [these instructions](https://support.google.com/cloud/answer/6158862) to get an API key for your project.

1. **Load and initialize the experimental library**

  Add this line in your HTML code, before `</head>` and replace `<my-api-key>` and `<my-project-id>` with your API key and Google Cloud project ID string:

```HTML
<!-- Warning: This is an experimental library, do not use it on production environments -->
<script src="https://cdn.rawgit.com/GoogleCloudPlatform/stackdriver-errors-js/v0.0.1/dist/stackdriver-errors-concat.min.js"></script>
<script type="text/javascript">
var errorHandler = new StackdriverErrorReporting();
errorHandler.init({
  key: '<my-api-key>',
  projectId: '<my-project-id>'
});
</script>
```


And that's all you need to do! Unhandled exceptions will now automatically be reported to your project.
  
**Test your setup**

Open the page that you instrumented, open the Devtools console and enter the following to trigger an unhandled exception:

```JS
window.onerror(null, null, null, null, new Error('Test: Something broke!'));
```

  Open Stackdriver Error Reporting at https://console.cloud.google.com/errors to view the error and opt-in to notifications on new errors.

## Setup

You can change your code to report errors:

When catching an exception:

```JS
try {
  doSomethingRisky();
} catch (e) {
  errorHandler.report(e);
}
```

or anytime:

```JS
errorHandler.report('Something broke!');
```

## FAQ

**Q: Should I use this code in my production application?**
A: This is an experimental library. We do not recommend using it on production yet.

**Q: Are source maps supported?**
A: Not yet.

## Developing the library

Install developer dependencies `npm install --dev`

Run `gulp` to test your changes.

Run `gulp dist` generates the minified version.
