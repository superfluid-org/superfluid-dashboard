import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: 'https://dev-goerli-platform-v2.dev.superfluid.dev/schema.json',
  apiFile: './platformApiTemplateEmpty.ts',
  apiImport: 'platformApiTemplateEmpty',
  outputFile: './platformApiTemplate.ts',
  exportName: 'platformApiTemplate',
  filterEndpoints: ["listSubscriptions"],
  hooks: false
}

export default config