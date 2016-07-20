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
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');

var DEST = 'dist/';

gulp.task('default', function() {
  return gulp.src(['test/test.js'], { read: false })
    .pipe(mocha());
});

gulp.task('dist', function() {
  return gulp.src('stackdriver-errors.js')
    .pipe(sourcemaps.init())
    // This will output the non-minified version
    .pipe(gulp.dest(DEST))
    // This will minify and rename to stackdriver-errors.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(DEST));
});
