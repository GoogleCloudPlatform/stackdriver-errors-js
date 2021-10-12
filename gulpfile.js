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
var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var SRC_FILE = 'stackdriver-errors.js';
var TYPINGS_FILE = 'stackdriver-errors.d.ts';
var DEST = 'dist/';

var polyfills = [
  'core-js/features/array/filter',
  'core-js/features/array/for-each',
  'core-js/features/array/map',
  'core-js/features/function/bind',
  'core-js/features/promise',
];

gulp.task('lib-concat', function() {
  return browserify({
    debug: true,
    entries: SRC_FILE,
    standalone: 'StackdriverErrorReporter',
  })
    .require(polyfills)
    .plugin('browser-pack-flat/plugin')
    .bundle()
    .pipe(source(SRC_FILE))
    .pipe(rename({suffix: '-concat'}))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // This will output the non-minified version
    .pipe(gulp.dest(DEST))
    // This will minify and rename to stackdriver-errors.min.js
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(DEST))
    .pipe(gulp.src(TYPINGS_FILE))
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
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'));
});
