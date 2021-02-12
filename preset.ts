import { Preset } from "apply";

Preset.setName("laravel-vite");

Preset.extract();
Preset.delete(['resources/js', 'webpack.mix.js']);

Preset.edit('.gitignore')
	.addBefore('/public/hot', '/public/build');

Preset.edit('resources/views/welcome.blade.php')
	.addAfter('<title>', [
		'@vite'
	]);

Preset.group(preset => {
	preset.editNodePackages()
		.remove('laravel-mix')
		.addDev('vite', '^2.0.0-beta.66')
		.addDev('laravel-vite', '^0.0.1-dev.5')
		.delete(() => ['development', 'watch', 'watch-poll', 'hot', 'prod', 'production'].map(command => `scripts.${command}`))

	preset.editNodePackages()
		.merge({
			scripts: {
				dev: 'vite',
				build: 'vite build',
				serve: 'vite preview'
			}
		});
});

Preset.editPhpPackages()
	.add('innocenzi/laravel-vite', '^0.0.2');

Preset.installDependencies('php');
Preset.installDependencies('node');
