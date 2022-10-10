import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

export const platformApiTemplateEmpty = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: () => ({}),
})