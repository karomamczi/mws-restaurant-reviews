const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const cleanCSS = require('gulp-clean-css');
const buffer = require('vinyl-buffer');
const gzip = require('gulp-gzip');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

gulp.task('css', () => {
  return gulp.src('app/css/*.css')
    .pipe($.if(dev, $.sourcemaps.init()))
      .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
      .pipe(cleanCSS())
      .pipe(gzip())
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({stream: true}));
});

gulp.task('js', () => {
  return gulp.src(['app/js/**/current_year.js', 'app/js/**/service_worker_register.js'])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
      .pipe($.babel({
          presets: ['env']
      }))
      .pipe($.uglify())
      .pipe(gzip())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({stream: true}));
});

gulp.task('sw', () => {
  return gulp.src('app/service_worker.js')
  .pipe($.plumber())
  .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel({
        presets: ['env']
    }))
    .pipe($.uglify())
    .pipe(gzip())
  .pipe($.if(dev, $.sourcemaps.write('.')))
  .pipe(gulp.dest('.tmp/'))
  .pipe(reload({stream: true}));
})

gulp.task('restaurantsDb', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform('babelify', {
      presets: ['env']
    })
    .require('app/js/restaurants_db.js', { entry: true })
    .bundle()
    .pipe(source('restaurants_db.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('dbHelper', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform('babelify', {
      presets: ['env']
    })
    .require('app/js/dbhelper.js', { entry: true })
    .bundle()
    .pipe(source('dbhelper.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('restaurants', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform('babelify', {
      presets: ['env']
    })
    .require('app/js/restaurants.js', { entry: true })
    .bundle()
    .pipe(source('restaurants.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('restaurantInfo', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform('babelify', {
      presets: ['env']
    })
    .require('app/js/restaurant_info.js', { entry: true })
    .bundle()
    .pipe(source('restaurant_info.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('restaurantMap', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform('babelify', {
      presets: ['env']
    })
    .require('app/js/restaurant_map.js', { entry: true })
    .bundle()
    .pipe(source('restaurant_map.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('html', ['css', 'js', 'restaurantsDb', 'dbHelper', 'restaurants', 'restaurantInfo', 'restaurantMap', 'sw', 'img'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gzip())
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('img', () => {
  return gulp.src('app/img/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('.tmp/img'));
});

gulp.task('clean', del.bind(null, ['.tmp']));

gulp.task('serve', () => {
  runSequence(
    ['clean', 'wiredep'],
    ['html', 'css', 'js', 'restaurantsDb', 'dbHelper', 'restaurants', 'restaurantInfo', 'restaurantMap', 'sw', 'img'],
    () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      'app/*.html',
      'app/img/**/*'
    ]).on('change', reload);

    gulp.watch('app/css/**/*.css', ['html', 'css']);
    gulp.watch('app/js/**/*.js', ['html', 'js', 'restaurantsDb', 'dbHelper', 'restaurants', 'restaurantInfo', 'restaurantMap']);
    gulp.watch('app/sw.js', ['sw']);
    gulp.watch('bower.json', ['wiredep']);
  });
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], resolve);
  });
});
