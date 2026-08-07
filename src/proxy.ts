import { NextRequest, NextResponse } from "next/server"
import { blockedCountries, blockedRegions } from "./geofencing"
import { geolocation } from '@vercel/functions'

export function proxy(req: NextRequest) {
    // The Sentry tunnel route (`tunnelRoute` in next.config.ts) must not be intercepted by this
    // geofence proxy, otherwise client-side error reports would be blocked. Let it pass through.
    if (req.nextUrl.pathname === "/monitoring" || req.nextUrl.pathname === "/monitoring/") {
        return NextResponse.next()
    }

    const geo = geolocation(req)

    const country = geo?.country
    const region = geo?.region

    if (country && blockedCountries.includes(country)) {
        return new NextResponse('Access Denied', { status: 403 })
    }

    if (country === 'UA' && region && blockedRegions.includes(region)) {
        return new NextResponse('Access Denied', { status: 403 })
    }

    return NextResponse.next()
}