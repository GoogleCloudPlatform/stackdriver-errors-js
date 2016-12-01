angular.module('demoApp', [])

  .factory('$exceptionHandler', ['$log', '$window', function($log, $window) {
    var StackdriverErrors = new $window.StackdriverErrorReporter();
    StackdriverErrors.start({
      projectId: '<your-project-id>',
      key: '<your-api-key>'
    });

    return function(exception, cause) {
      StackdriverErrors.report(exception);
      $log.warn('Reported error:', exception, cause);
    };
  }])

  .controller('DemoController', function() {
    var demo = this;
    demo.starUser = function() {
      demo.user.star();
    };
  });