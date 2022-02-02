export default definePreset({
	name: 'laravel-vite',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
