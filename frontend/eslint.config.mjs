import nx from '@nx/eslint-plugin';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sheriff from '@softarc/eslint-plugin-sheriff';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...angular.configs.tsRecommended,
  {
    ignores: [
      '**/dist/**',
      '**/out-tsc/**',
      '**/gen/**',
      '**/.nx/**',
      '**/.angular/**',
      '**/coverage/**',
      '**/*.config*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [sheriff.configs.all],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.base.json',
          './apps/**/*.json',
          './libs/**/*.json',
          './articles/**/*.json',
          './auth/**/*.json',
          './comments/**/*.json',
          './profile/**/*.json',
          './shared/**/*.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Sheriff for architectural boundaries
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      // Angular-specific rules
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'conduit', 'lib'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'conduit', 'lib'],
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',

      // Temporarily disabled/downgraded rules to address the remaining issues
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // Disable Sheriff internal rules due to Windows bugs (lstat C:\ errors).
      // We are relying on @nx/enforce-module-boundaries instead, which is stable.
      '@softarc/sheriff/dependency-rule': 'off',
      '@softarc/sheriff/encapsulation': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // Angular template accessibility rules
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      '@angular-eslint/template/no-distracting-elements': 'error',
    },
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // JSX accessibility rules (if using React components)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },
  eslintConfigPrettier,
);
