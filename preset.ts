import { Preset, color } from 'apply';

Preset.setName('laravel-vite');
Preset.option('install', true);
Preset.option('vue', true);

Preset.extract('default');

Preset.delete(['resources/js', 'webpack.mix.js'])
	.withoutTitle()

Preset.edit('.gitignore')
	.withoutTitle()
	.addBefore('/public/hot', '/public/build')

Preset.edit('resources/views/welcome.blade.php')
	.ifNotOption('vue')
	.withoutTitle()
	.addAfter('<title>', [
		'@vite'
	]);

// Common packages
Preset.group(preset => {
	preset.editNodePackages()
		.remove('laravel-mix')
		.addDev('vite', '^2.0.1')
		.addDev('laravel-vite', '^0.0.7')
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

// Vue
Preset.group((preset) => {
	preset.delete(['resources/views/welcome.blade.php'])
	preset.extract('vue')
	
	preset.edit('routes/web.php')
		.update((content) => content.replace('welcome', 'app'))
		
	preset.editNodePackages()
		.add('vue', '^3.0.5')
		.addDev('@vue/compiler-sfc', '^3.0.5')
		.addDev('@vitejs/plugin-vue', '^1.1.4')
}).ifOption('vue').withTitle('Installing Vue...')

Preset.editPhpPackages()
	.add('innocenzi/laravel-vite', '^0.0.7')
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
