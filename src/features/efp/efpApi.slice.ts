import { fakeBaseQuery } from '@reduxjs/toolkit/query'
import { createApi } from '@reduxjs/toolkit/query/react'

export interface getFollowingParams {
	address?: string
	offset: number
	limit: number
	search?: string
}

export interface getFollowingResponse {
	address: string
}

export interface getStatsResponse {
	following: number
	followers: number
}

export const efpApi = createApi({
	reducerPath: 'efp',
	baseQuery: fakeBaseQuery(),
	keepUnusedDataFor: 500,
	endpoints: builder => {
		const EFP_API_URL = 'https://data.ethfollow.xyz/api/v1'

		return {
			getFollowing: builder.query<
				getFollowingResponse[],
				getFollowingParams
			>({
				queryFn: async ({ address, offset, limit, search }) => {
					if (!address) {
						return { data: [] }
					}

					const following = await fetch(
						`${EFP_API_URL}/users/${address}/${
							search ? 'searchFollowing' : 'following'
						}?offset=${offset}&limit=${limit}&sort=followers${
							search ? `&term=${search}` : ''
						}`
					)
					const data = await following.json()
					return { data: data.following }
				},
			}),
			getStats: builder.query<getStatsResponse, string | undefined>({
				queryFn: async address => {
					if (!address) {
						return { data: { following: 0, followers: 0 } }
					}

					const response = await fetch(
						`${EFP_API_URL}/users/${address}/stats`
					)
					const data = await response.json()

					const stats = {
						following: data.following_count,
						followers: data.followers_count,
					}

					return { data: stats }
				},
			}),
		}
	},
})
