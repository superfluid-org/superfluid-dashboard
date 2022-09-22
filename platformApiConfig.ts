import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: 'https://dev-goerli-platform-v2.dev.superfluid.dev/schema.json',
  apiFile: './src/features/redux/platformApi/platformApiTemplateEmpty.ts',
  apiImport: 'platformApiTemplateEmpty',
  outputFile: './src/features/redux/platformApi/platformApiTemplate.ts',
  exportName: 'platformApiTemplate',
  filterEndpoints: ["listSubscriptions", "findSubscriptionById"],
  hooks: false
}

export default config