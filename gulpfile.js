// Requis
const gulp = require('gulp');

const plugins = require('gulp-load-plugins')(); // tous les plugins de package.json
const jshint  = require('gulp-jshint');
const merge   = require("merge-stream");
const del     = require("del");

// Chemins
const dirs = {
		src: './src',
		build: './build',
		dist: './dist',
	    npm: './node_modules'
}

// Nettoyage
function clean() {
	return del(['./build/**.*']);
}

// Vérification syntaxique des scripts
function lint() {
	  return gulp.src(dirs.src + '/js/lib/*.js')
			     .pipe(jshint())
			     .pipe(jshint.reporter('default'));
}

// Copie des dépendances
function copyDeps() {
	  return merge([
		  gulp.src('./node_modules/requirejs/require.js').pipe(gulp.dest('./build/js/lib')),
	      gulp.src('./node_modules/jquery/dist/*.*').pipe(gulp.dest('./build/js/lib')),
	      gulp.src('./node_modules/jquery-ui-dist/*.js').pipe(gulp.dest('./build/js/lib')),
	      gulp.src('./node_modules/jquery-ui-themes/themes/smoothness/**.*').pipe(gulp.dest('./build/css/smoothness'))
	  ]);
}

//Copie des tests
function copyTests() {
	  return merge([
	      gulp.src('./src/test/*.*').pipe(gulp.dest('./build/test'))
	  ]);
}

//Copie des tests
function copyMyLib() {
	  return merge([
	      gulp.src('./src/js/lib/my-jq-splitter.js').pipe(gulp.dest('./build/js/lib')),
	      gulp.src('./src/css/*.*').pipe(gulp.dest('./build/css'))
	  ]);
}

// taches simples
gulp.task('lint', lint);

//taches complexes
const build = gulp.series(clean, lint, gulp.parallel(copyDeps, copyTests, copyMyLib));
gulp.task('build', build);
