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

beforeEach(function() {
  errorHandler = new StackdriverErrorReporting();
});

describe('Initialization', function () {
 it('should have default service', function () {
   errorHandler.init({key:'key', projectId:'projectId'});
   expect(errorHandler.serviceContext.service).to.equal('web');
 });

 it('should fail if no API key', function () {
   expect(function() {errorHandler.init({projectId:'projectId'});}).to.throw(Error, /API/);
 });

 it('should fail if no project ID', function () {
   expect(function() {errorHandler.init({key:'key'});}).to.throw(Error, /project/);
 });

});
