import { Preset, color } from 'apply';

Preset.setName('laravel-vite');
Preset.option('install', true);

Preset.extract();
Preset.delete(['resources/js', 'webpack.mix.js']).withTitle('Removing Mix...');

Preset.edit('.gitignore')
	.withTitle('Updating .gitignore...')
	.addBefore('/public/hot', '/public/build')

Preset.edit('resources/views/welcome.blade.php')
	.withTitle('Updating welcome.blade.php...')
	.addAfter('<title>', [
		'@vite'
	]);

Preset.group(preset => {
	preset.editNodePackages()
		.remove('laravel-mix')
		.addDev('vite', '^2.0.0-beta.66')
		.addDev('laravel-vite', '^0.0.2')
		.delete(() => ['development', 'watch', 'watch-poll', 'hot', 'prod', 'production'].map(command => `scripts.${command}`))

	preset.editNodePackages()
		.merge({
			scripts: {
				dev: 'vite',
				build: 'vite build',
				serve: 'vite preview'
			}
		});
})
.withTitle('Updating package.json...');

Preset.editPhpPackages()
	.add('innocenzi/laravel-vite', '^0.0.5')
	.withTitle('Updating composer.json...');

Preset.installDependencies('php')
	.ifOption('install')
	.withTitle('Updating PHP dependencies...');

Preset.installDependencies('node')
	.ifOption('install')
	.withTitle('Updating Node dependencies...');

Preset.instruct([
	`Run the development server with ${color.magenta('yarn dev')}`,
	`Edit your scripts in ${color.magenta('resources/scripts')}`,
]).withHeading("What's next?")
