# Client-side JavaScript library for Stackdriver Error Reporting

> **This is not an official Google product.** This module is experimental and may not be ready for use.
> This module uses APIs that may be undocumented and are subject to change without notice.

This experimental library provides Stackdriver Error Reporting support for client-side web JavaScript applications.
[Stackdriver Error Reporting](https://cloud.google.com/error-reporting/) is a feature of Google Cloud Platform that allows in-depth monitoring and viewing of errors reported by applications running in almost any environment. Here's an introductory video:

[![Learn about Error Reporting in Stackdriver](https://img.youtube.com/vi/cVpWVD75Hs8/0.jpg)](https://www.youtube.com/watch?v=cVpWVD75Hs8)

## Prerequisites

1. You need a [Google Cloud project](https://console.cloud.google.com).
1. [Enable the Stackdriver Error Reporting API](https://console.cloud.google.com/apis/api/clouderrorreporting.googleapis.com/overview) for your project.

## Quickstart

1. **Create an API key:**

  Follow [these instructions](https://support.google.com/cloud/answer/6158862) to get an API key for your project.

1. **Load and initialize the library**

  Add this line in your HTML code, before `</head>`:

```HTML
	<script src="https://cdn.rawgit.com/GoogleCloudPlatform/stackdriver-errors-js/v0.1.0/dist/stackdriver-errors.min.js"></script>
  <script type="text/javascript">
  StackdriverErrors.init({
    key: 'my-api-key',
    projectId: 'my-project-id',
    serviceContext: {service: 'my-service-name'}
  });
  </script>
```

  And that's all you need to do. Unhandled exception will now automatically be reported to your project.
  Open Stackdriver Error Reporting at https://console.cloud.google.com/errors to view them.

  Additionally, you can change your code to report errors:

  When catching an exception:

  ```JS
  try {
    doSomethingRisky();
  } catch (e) {
    StackdriverErrors.report(e);
  }
  ```

  or anytime:

  ```JS
  StackdriverErrors.report('Something broke!');
  ```

## FAQ

**Q: Should I use this code in my production application?**
A: This is an experimental library. We do not recommend using it on production yet.

**Q: Are source maps supported?**
A: Not yet.
