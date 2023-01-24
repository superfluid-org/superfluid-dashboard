import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: 'https://prod-goerli-platform-service.dev.superfluid.dev/schema.json',
  apiFile: './platformApiTemplateEmpty.ts',
  apiImport: 'platformApiTemplateEmpty',
  outputFile: './platformApiTemplate.ts',
  exportName: 'platformApiTemplate',
  filterEndpoints: ["isAccountWhitelisted"],
  hooks: false
}

export default config