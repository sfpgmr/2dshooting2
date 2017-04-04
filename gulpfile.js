!function(){
'use strict';
const fs = require('fs');
const gulp = require('gulp');
const logger = require('gulp-logger');
const watch = require('gulp-watch');
const source = require('vinyl-source-stream');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const browserSync =require('browser-sync');

const rollup = require('rollup').rollup;
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');


const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const atImport = require('postcss-import');


// JSのビルド
gulp.task('js',function(){
    rollup({
    entry: './src/js/main.js',
    plugins: [
      nodeResolve({ jsnext: true }),
      commonjs()
    ],
    external:[
      'sharp','electron','events','tween.js'
    ]
  }).then((bundle)=>{
    bundle.write({
      format: 'iife',
      dest: './dist/js/bundle.js',
      sourceMap: 'inline'
    });
  });
//     browserify('./src/js/main.js',{debug:true,extensions: ['.js']})
//     .transform(babelify,{"plugins": [
//       "transform-es2015-arrow-functions",
//       "transform-es2015-block-scoped-functions",
//       "transform-es2015-block-scoping",
//       "transform-es2015-classes",
//       "transform-es2015-computed-properties",
// //      "transform-es2015-constants",
//       "transform-es2015-destructuring",
//       "transform-es2015-for-of",
//       "transform-es2015-function-name",
//       "transform-es2015-literals",
//       "transform-es2015-modules-commonjs",
//       "transform-es2015-object-super",
//       "transform-es2015-parameters",
//       "transform-es2015-shorthand-properties",
//       "transform-es2015-spread",
//       "transform-es2015-sticky-regex",
//       "transform-es2015-template-literals",
//       "transform-es2015-typeof-symbol",
//       "transform-es2015-unicode-regex"
//       ]})
// //    .transform({global:true},uglifyify)
//     .bundle()
//     .on("error", function (err) { console.log("Error : " + err.message); })
//     .pipe(source('bundle.js'))
//     .pipe(gulp.dest('./dist/js'));

    try {
      fs.accessSync('./dist/js/dsp.js');
    } catch (e) {
      if(e.code == 'ENOENT'){
        gulp.src('./src/js/dsp.js').pipe(gulp.dest('./dist/js'));
      }
    }
});

gulp.task('devjs',function(){
    rollup({
    entry: './src/js/devMain.js',
    plugins: [
      nodeResolve({ jsnext: true }),
      commonjs()
    ],
    external:[
      'sharp','electron','events','tween.js'
    ]
  }).then((bundle)=>{
    bundle.write({
      format: 'iife',
      dest: 'dist/js/bundle.js'
    });
  });  
//     browserify('./src/app/js/devMain.js',{debug:true,extensions: ['.js'],detectGlobals: false,
//     builtins: []})
//     .transform(babelify,{"plugins": [
//       "transform-es2015-arrow-functions",
//       "transform-es2015-block-scoped-functions",
//       "transform-es2015-block-scoping",
//       "transform-es2015-classes",
//       "transform-es2015-computed-properties",
// //      "transform-es2015-constants",
//       "transform-es2015-destructuring",
//       "transform-es2015-for-of",
//       "transform-es2015-function-name",
//       "transform-es2015-literals",
//       "transform-es2015-modules-commonjs",
//       "transform-es2015-object-super",
//       "transform-es2015-parameters",
//       "transform-es2015-shorthand-properties",
//       "transform-es2015-spread",
//       "transform-es2015-sticky-regex",
//       "transform-es2015-template-literals",
//       "transform-es2015-typeof-symbol",
//       "transform-es2015-unicode-regex"
//       ]})
// //    .transform({global:true},uglifyify)
//     .bundle()
//     .on("error", function (err) { console.log("Error : " + err.message); })
//     .pipe(source('bundle.js'))
//     .pipe(gulp.dest('./dist/app/js'));

    try {
      fs.accessSync('./dist/app/js/dsp.js');
    } catch (e) {
      if(e.code == 'ENOENT'){
        gulp.src('./src/js/dsp.js').pipe(gulp.dest('./dist/app/js'));
      }
    }

});


// CSSのビルド
gulp.task('postcss', function() {
    gulp.src('./src/css/**/*.css')
        .pipe(plumber())
        .pipe(postcss([
            atImport(),
            require('postcss-mixins')(),
            require('postcss-nested')(),
            require('postcss-simple-vars')(),
            require('cssnext')(),
//            require('cssnano')(),
            autoprefixer({ browsers: ['last 2 versions'] })
        ]))
        .pipe(gulp.dest('./dist/css'))
        .pipe(gulp.dest('./dist/app/css'))
        .pipe(logger({ beforeEach: '[postcss] wrote: ' }));
});

//HTMLのコピー
gulp.task('html',function(){
  gulp.src('./src/html/*.html').pipe(gulp.dest('./dist'));
});

gulp.task('devhtml',function(){
  gulp.src('./src/app/html/*.html').pipe(gulp.dest('./dist/app'));
});

//リソースのコピー
gulp.task('res',function(){
  gulp.src('./src/res/**').pipe(gulp.dest('./dist/res'));
  gulp.src('./src/res/**').pipe(gulp.dest('./dist/app/res'));
});

//dataのコピー
gulp.task('data',function(){
  gulp.src('./src/data/*.json').pipe(gulp.dest('./dist/data'));
  gulp.src('./src/data/*.json').pipe(gulp.dest('./dist/app/data'));
});

// devverディレクトリへのコピー
gulp.task('devver',function(){
  var date = new Date();
  var destdir = './devver/' + date.getUTCFullYear() + ('0' + (date.getMonth() + 1)).slice(-2)  + ('0' + date.getDate()).slice(-2);
  
  try {
    fs.mkdirSync(destdir);
  } catch (e){
    
  }
  
  try {
    fs.mkdirSync(destdir + '/js');
    fs.mkdirSync(destdir + '/data');
    fs.mkdirSync(destdir + '/css');
  } catch (e){
    
  }
  
  gulp.src('./dist/*.html').pipe(gulp.dest(destdir));
  gulp.src('./dist/js/*.js').pipe(gulp.dest(destdir + '/js'));
  gulp.src('./dist/data/*.json').pipe(gulp.dest(destdir + '/data'));
  gulp.src('./dist/css/*.*').pipe(gulp.dest(destdir + '/css'));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
             baseDir: "./dist/"
            ,index  : "index.html"
        },
        files:['./dist/**/*.*']
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('devapp',()=>{
  try {
    fs.mkdirSync('./dist/app');
  } catch (e) {
  }
  gulp.src('./src/app/*.js').pipe(gulp.dest('./dist/app'));
});

gulp.task('default',['html','devhtml','js','devjs','res','data','postcss','devapp','browser-sync'],function(){
    watch('./src/js/**/*.js',()=>gulp.start(['js'],['devjs']));
    watch('./src/html/*.html',()=>gulp.start(['html']));
    watch('./src/data/**/*.json',()=>gulp.start(['data']));
    watch('./src/css/**/*.css',()=>gulp.start(['postcss']));
    watch('./dist/**/*.*',()=>gulp.start(['bs-reload']));
    watch('./src/app/js/*.js',()=>gulp.start(['devjs']));
    watch('./src/app/*.js',()=>gulp.start(['devapp']));
    watch('./src/app/html/*.html',()=>gulp.start(['devhtml']));
});
}();