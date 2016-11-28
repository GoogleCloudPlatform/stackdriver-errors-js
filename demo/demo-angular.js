angular.module('demoApp', [])
  .controller('DemoController', function() {
    var demo = this;
    demo.customText = '';
 
    demo.triggerCrash = function() {
      console.log('crash', demo.customText);
    };
  });