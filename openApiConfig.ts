import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: 'https://dev-goerli-platform-v2.dev.superfluid.dev/schema.json',
  apiFile: './src/features/redux/platformApi/emptyApi.ts',
  apiImport: 'emptyApi',
  outputFile: './src/features/redux/platformApi/platformApi.ts',
  exportName: 'platformApiSlice',
  hooks: true,
}

export default config