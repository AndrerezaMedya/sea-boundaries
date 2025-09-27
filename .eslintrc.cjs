module.exports = {
	root: true,
	env: {
		browser: true,
		es2023: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2023,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'react-refresh'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
	},
	ignorePatterns: ['dist', 'node_modules'],
};
