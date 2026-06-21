import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
	{ ignores: ['dist', 'dist_temp/**', 'node_modules', '**/*.cjs', '.eslintrc.cjs', 'test_api.js', 'backend/**', 'real_db_schema/**'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: 2023,
				sourceType: 'module',
			},
		},
		rules: {
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
		'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];
