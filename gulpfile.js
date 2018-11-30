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
/* global require */
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var concat = require('gulp-concat');

var SRC_FILE = 'stackdriver-errors.js';
var DEST = 'dist/';

var dependencies = [
    './node_modules/stacktrace-js/dist/stacktrace-with-promises-and-json-polyfills.js',
];

gulp.task('test', function () {
    return gulp
    .src('test/test.html')
    .pipe(mochaPhantomJS({reporter: 'spec'}));
});

gulp.task('dist', function() {
  return gulp.src(dependencies.concat(SRC_FILE))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(concat(SRC_FILE.replace('.js', '-concat.js')))
    // This will output the non-minified version
    .pipe(gulp.dest(DEST))
    // This will minify and rename to stackdriver-errors.min.js
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(DEST));
});

gulp.task('demo-html', function() {
  return gulp.src('demo/demo.html')
    .pipe(replace(/..\/dist\//g, ''))
    .pipe(replace(/..\/demo\/demo\.js/g, 'demo.min.js'))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'));
});

gulp.task('demo-js', function() {
  return gulp.src('demo/demo.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['test']);
gulp.task('demo', ['dist', 'demo-html', 'demo-js']);
