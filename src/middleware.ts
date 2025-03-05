import { NextRequest, NextResponse } from "next/server"
import { blockedCountries, blockedRegions } from "./geofencing"
import { geolocation } from '@vercel/functions'

export function middleware(req: NextRequest) {
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