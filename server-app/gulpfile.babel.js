'use strict';

import gulp from 'gulp';
import webpackStream from 'webpack-stream';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';

gulp.task('build', ['build-client', 'build-admin', 'build-server']); //'build-admin',

gulp.task('build-client', ['client-copy-assets'], () =>
    gulp.src('src/client/js/client.js')
    .pipe(webpackStream(require('./webpack.config.js')))
    .pipe(gulp.dest('../extension/lib/js'))
);
gulp.task('client-copy-assets', () =>
    gulp.src(['src/client/**/*.*', '!src/client/js/**/*.*'])
    .pipe(gulp.dest('../extension/lib/'))
);

gulp.task('build-admin', ['admin-copy-assets'], () =>
    gulp.src('src/admin/js/client.js')
    .pipe(webpackStream(require('./webpack-admin.config.js')))
    .pipe(gulp.dest('server/admin/js'))
);
gulp.task('admin-copy-assets', () =>
    gulp.src(['src/admin/**/*.*', '!src/admin/js/**/*.*'])
    .pipe(gulp.dest('server/admin'))
);


gulp.task('build-server', ['build-shared'], () =>
    gulp.src(['src/server/**/*.*'])
    .pipe(babel())
    .pipe(gulp.dest('server/'))
);

gulp.task('build-shared', () =>
    gulp.src(['src/shared/**/*.*'])
    .pipe(babel())
    .pipe(gulp.dest('shared/'))
);

gulp.task('watch', ['build'], () => {
    gulp.watch(['src/client/**/*.*'], ['build-client']);
    gulp.watch(['src/server/**/*.*'], ['build-server']);
    gulp.watch(['src/shared/**/*.*'], ['build-server', 'build-client']);
    gulp.start('run');
});

gulp.task('run', () => {
    nodemon({
        delay: 10,
        script: '../server/server.js',
        // args: ["config.json"],
        ext: 'js',
        watch: 'src'
    })
});

gulp.task('default', ['build', 'run']);