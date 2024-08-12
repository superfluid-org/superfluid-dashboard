//Cannot use JSON config because prettier plugins don't work with pnpm :(
//https://github.com/sveltejs/prettier-plugin-svelte/issues/155
module.exports = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  singleAttributePerLine: false,
  bracketSameLine: false,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 80,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  vueIndentScriptAndStyle: false,
  singleQuote: true,
  plugins: [require('prettier-plugin-gherkin')],
  overrides: [
    {
      files: '**/*.svx',
      options: { parser: 'markdown' },
    },
    {
      files: '**/*.ts',
      options: { parser: 'typescript' },
    },
    {
      files: '**/CHANGELOG.md',
      options: {
        requirePragma: true,
      },
    },
  ],
};
