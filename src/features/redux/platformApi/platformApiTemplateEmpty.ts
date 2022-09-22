import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

export const platformApiTemplateEmpty = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: () => ({}),
})

// { baseUrl: 'https://dev-goerli-platform-v2.dev.superfluid.dev/' }