export default definePreset({
	name: 'laravel:vite',
	options: {
		base: true,
		tailwindcss: true,
		https: false,
	},
	postInstall: ({ hl }) => [
		`Run the development server with ${hl('npm run dev')}`,
		`Edit your scripts in ${hl('resources/scripts')}`,
		`Build for production with ${hl('npm run build')}`,
	],
	handler: async(context) => {
		if (context.options.base) {
			await installVite(context.options.https)
		}

		if (context.options.tailwindcss) {
			await installTailwind()
		}
	},
})

async function installVite(https: boolean) {
	await group({
		title: 'install Node dependencies',
		handler: async() => {
			await editFiles({
				files: 'package.json',
				operations: [
					{ type: 'edit-json', delete: ['scripts', 'devDependencies'] },
					{ type: 'edit-json', merge: { scripts: { dev: 'vite', build: 'vite build' } } },
				],
				title: 'update package.json',
			})

			await installPackages({
				title: 'install front-end dependencies',
				for: 'node',
				install: [
					'vite-plugin-laravel',
					'vite',
				],
				dev: true,
			})
		},
	})

	await installPackages({
		title: 'install PHP dependencies',
		for: 'php',
		install: ['innocenzi/laravel-vite:0.2.*'],
	})

	await group({
		title: 'extract Vite scaffolding',
		handler: async() => {
			await extractTemplates({
				title: 'extract templates',
				from: 'default',
			})

			await deletePaths({
				title: 'remove some default files',
				paths: ['resources/js', 'resources/css', 'webpack.mix.js'],
			})

			await editFiles({
				title: 'update .gitignore',
				files: '.gitignore',
				operations: [{ type: 'add-line', position: 'prepend', lines: '/public/build' }],
			})

			await editFiles({
				title: 'update environment files',
				files: ['.env', '.env.example'],
				operations: [{
					type: 'add-line',
					position: 'append',
					skipIf: (content) => ['DEV_SERVER_URL', 'DEV_SERVER_KEY', 'DEV_SERVER_CERT'].some((key) => content.includes(key)),
					lines: [
						`DEV_SERVER_URL=http${https ? 's' : ''}://localhost:3000`,
						'DEV_SERVER_KEY=',
						'DEV_SERVER_CERT=',
					],
				}],
			})

			await editFiles({
				title: 'add @vite directive',
				files: 'resources/views/welcome.blade.php',
				operations: [{
					type: 'add-line',
					match: /<\/head>/,
					position: 'before',
					indent: '        ',
					lines: ['', '<!-- Scripts and CSS import -->', '@vite'],
				}],
			})

			await executeCommand({
				command: 'php',
				arguments: ['artisan', 'vendor:publish', '--tag=vite-config'],
				title: 'publish Laravel Vite configuration',
			})
		},
	})
}

async function installTailwind() {
	await installPackages({
		title: 'install Tailwind CSS',
		for: 'node',
		install: ['tailwindcss', 'autoprefixer', 'postcss'],
		dev: true,
	})

	await group({
		title: 'extract Tailwind scaffoling',
		handler: async() => {
			await extractTemplates({
				title: 'extract Tailwind CSS config',
				from: 'tailwind',
			})

			await editFiles({
				title: 'add Tailwind CSS imports',
				files: 'config/vite.php',
				operations: [
					{
						type: 'add-line',
						match: /resources\/scripts\/main.ts/,
						lines: "'resources/css/tailwind.css',",
						position: 'after',
					},
				],
			})

			await editFiles({
				title: 'register PostCSS plugins',
				files: 'vite.config.ts',
				operations: [
					{
						skipIf: (content) => content.includes('import tailwindcss') || content.includes('import autoprefixer'),
						type: 'add-line',
						lines: ["import tailwindcss from 'tailwindcss'", "import autoprefixer from 'autoprefixer'"],
						position: 'prepend',
					},
					{
						type: 'update-content',
						update: (content) => content.replace('laravel()', `laravel({
					postcss: [
						tailwindcss(), 
						autoprefixer()
					]
				})`),
					},
				],
			})

			await editFiles({
				title: 'remove inline CSS',
				files: 'resources/views/welcome.blade.php',
				operations: [
					{ type: 'remove-line', match: /<style>/, start: 0, count: 4 },
				],
			})
		},
	})
}
