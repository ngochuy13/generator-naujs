/* © 2017 NauStud.io
 * @author Thanh Tran
 */
'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

module.exports = Generator.extend({
	initializing: function () {
		// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the  ' + chalk.red('Naujs') + ' generator!'
		));

		// check if the main generator already executed
		var pkg = this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {
			config: {
				src: 'src',
				dist: 'dist',
			},
			devDependencies: {}
		});

		let prompts = [{
			type    : 'input',
			name    : 'iconfontPath',
			message : 'Font files folder from project root:',
			default : path.join(pkg.config.src, '/fonts')
		}, {
			type    : 'input',
			name    : 'iconfontSamplePath',
			message : 'Folder to output the icon sampling icons.html:',
			default : 'private/'
		}, {
			type    : 'input',
			name    : 'iconfontSCSSPath',
			message : 'Folder to output the style file _icons.scss:',
			default : path.join(pkg.config.src, '/css')
		}];

		return this.prompt(prompts).then(props => {
			// To access props later use this.props.someOption;
			this.props = props;
		});

	},

	writing: function () {
		// update package.json
		var pkg = this.pkg;

		// add iconfont dependency
		pkg.devDependencies['gulp-iconfont'] = '^4.0.0';
		pkg.devDependencies['gulp-consolidate'] = '^0.1.2';
		pkg.devDependencies['lodash'] = '^3.10.1';

		this.fs.writeJSON(this.destinationPath('package.json'), pkg);

		// update gulpfile.js
		var currentGulpfile;
		try {
			currentGulpfile = this.fs.read(this.destinationPath('gulpfile.js'));
		} catch (err) {
			this.log(chalk.yellow('gulpfile.js does not existed. Generate the iconfont task to a new gulpfile.js.'))
			currentGulpfile = '/*generator: iconfont*/';
		}
		var re = /\/\*generator:\s*iconfont\*\//g;
		var newGulpfile;

		if (re.test(currentGulpfile)) {
			var gulpIconfont = this.fs.read(this.templatePath('gulpfile-iconfont.js'));
			gulpIconfont = this.engine(gulpIconfont, this);
			newGulpfile = currentGulpfile.replace(re, gulpIconfont);
		} else {
			this.log(chalk.yellow('Cannot find pattern /*generator: iconfont*/ in gulpfile.js. iconfont task already generated'));
			newGulpfile = currentGulpfile;
		}

		this.fs.write(
			this.destinationPath('gulpfile.js'),
			newGulpfile
		);

		// copy files in assets folder
		this.fs.copy(
			this.templatePath('assets/**/*'),
			this.destinationPath('assets/')
		);
	},

	install: function () {
		// install the new iconfont package
		this.npmInstall();
	},

	end: function() {
		this.log(
			chalk.green('Gulp iconfont task generated.'),
			'\nPlease import ' + this.props.iconfontSCSSPath + '/_icons.scss ' +
			'to your main SCSS file'
		);
	}
});
