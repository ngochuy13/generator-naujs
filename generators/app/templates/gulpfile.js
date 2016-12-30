/**
 * Generated by generator-naujs
 */
/*eslint-env node*/
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();

// this is my proposed way to group all gulp component into a namespace
const g = require('gulp-load-plugins')();

/**
 * Configs
 */
let mode = 'dev';
let paths = {
	src: '<%= src %>',
	dist: '<%= dist %>',
	assets: 'assets',
	// subfolders:
	fonts: 'fonts',
	images: 'img',
	mock: 'mock',
	scripts: 'js',
	styles: 'css',
	// temporary
	tmp: '.tmp'
};

// other path shorthands
paths.srcFonts = paths.src + '/' + paths.fonts;
paths.srcImages = paths.src + '/' + paths.images;
paths.srcScripts = paths.src + '/' + paths.scripts;
paths.srcStyles = paths.src + '/' + paths.styles;
paths.distFonts = paths.dist + '/' + paths.fonts;
paths.distImages = paths.dist + '/' + paths.images;
paths.distScripts = paths.dist + '/' + paths.scripts;
paths.distStyles = paths.dist + '/' + paths.styles;

/*generator: iconfont*/

/**
 * Task: styles
 * compile sass, add browser prefix
 */
gulp.task('styles', function() {
	return gulp.src(path.join(paths.srcStyles, '/*.scss'))
		.pipe(g.sourcemaps.init())
		.pipe(g.sass({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.'],
			onError: console.error.bind(console, 'Sass error:')
		}))
		.pipe(g.postcss([
			require('autoprefixer-core')({browsers: ['last 2 version', 'ie >= 9']})
		]))
		.pipe( g.if(mode === 'dev', g.sourcemaps.write()) )
		.pipe(gulp.dest(paths.srcStyles))
		.pipe( g.if(mode !== 'dev', gulp.dest(paths.distStyles)) )
		.pipe(browserSync.stream());
});

// ----------------------------------------------------------------------------

/**
 * Task: jshint
 * Lint javascript
 */
gulp.task('jshint', function() {
	return gulp.src([
		path.join(paths.srcScripts, '/**/*.js'),
		path.join('!' + paths.srcScripts, '/lib/*.js'),
		path.join('!' + paths.srcScripts, '/vendor/*.js')
	])
		.pipe(browserSync.stream({once: true}))
		.pipe(g.jshint())
		.pipe(g.jshint.reporter('jshint-stylish'))
		.pipe(g.if(!browserSync.active, g.jshint.reporter('fail')));
});

// ----------------------------------------------------------------------------

/**
 * Task: copy-images
 * Minify and copy UI images to dist
 */
gulp.task('copy-images', function() {
	return gulp.src(path.join(paths.srcImages, '**/*'))
		// .pipe(g.cache(g.imagemin({
		// 	progressive: true,
		// 	interlaced: true,
		// 	// don't remove IDs from SVGs, they are often used
		// 	// as hooks for embedding and styling
		// 	svgoPlugins: [{cleanupIDs: false}]
		// })))
		.pipe(gulp.dest(paths.distImages));
});

// ----------------------------------------------------------------------------

/**
 * Task: copy-fonts
 * Copy fonts
 */
gulp.task('copy-fonts', function() {
	return gulp.src(path.join(paths.srcFonts, '/**/*'))
		.pipe(gulp.dest(paths.distFonts));
});

// ----------------------------------------------------------------------------

/**
 * Task: copy-extras
 * copy extra files in root folder (.htaccess, robot.txt, favicon.ico...)
 */
gulp.task('copy-extras', function() {
	return gulp.src([
		path.join(paths.src, '/*.*'),
		path.join('!' + paths.src, '/*.html')
	], {
		dot: true,
		base: 'html'
	}).pipe(gulp.dest(paths.dist));
});

// ----------------------------------------------------------------------------

/**
 * Task: clean
 * Clean compiled folders
 */
gulp.task('clean', require('del').bind(null, [paths.dist, paths.tmp]));

// ----------------------------------------------------------------------------

/**
 * Task: watch
 * Watch for changes
 */
gulp.task('watch', ['styles'], function () {
	// watch for HTML / JS changes
	gulp.watch([
		path.join(paths.src, '/**/*.html'),
		path.join(paths.src, '/**/*.js'),
	], function(event) {
		browserSync.reload(event.path);
	});

	//watch for SCSS changes
	gulp.watch(path.join(paths.src, '/css/**/*.scss'), function(/*event*/) {
		gulp.start('styles');
	});
});

// ----------------------------------------------------------------------------

// Browser sync init boilerplate
function browserSyncInit(baseDir, browser) {
	browser = browser === undefined ? 'default' : browser;

	var routes = null;
	if (baseDir === paths.src || (Array.isArray(baseDir) && baseDir.indexOf(paths.src) !== -1)) {
		routes = {
			'/bower_components': 'bower_components'
		};
	}

	var server = {
		baseDir: baseDir,
		routes: routes
	};

	/*
	 * You can add a proxy to your backend by uncommenting the line bellow.
	 * You just have to configure a context which will we redirected and the target url.
	 * Example: $http.get('/users') requests will be automatically proxified.
	 *
	 * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
	 */
	// server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

	browserSync.instance = browserSync.init({
		startPath: '/',
		server: server,
		browser: browser
	});
}

/**
 * Task: serve
 * Serve the app through localhost with browsersync for testing
 */
gulp.task('serve', ['watch'], function () {
	browserSyncInit([paths.tmp, paths.src]);
});

/**
 * Task: serve-build
 * Serve the build through localhost
 */
gulp.task('serve-build', ['build'], function () {
	browserSyncInit([paths.dist]);
});

// ----------------------------------------------------------------------------

/**
 * Task: build
 * build to dist folder
 *
 * FIXME: NOT TEST
 */
gulp.task('build', ['clean', 'jshint'], function() {
	mode = 'dist';
	gulp.start(['styles', 'copy-images', 'copy-fonts', 'copy-extras']);
});

// FIXME: NOT tested
gulp.task('report', ['build'], function() {
	return gulp.src('dist/**/*').pipe(g.size({title: 'build', gzip: true}));
});


// ----------------------------------------------------------------------------
/**
 * Default task
 */
gulp.task('default', function() {
	gulp.start('serve');
});
