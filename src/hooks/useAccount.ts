
import { useAppKitAccount } from "@reown/appkit/react"
import { useEffect, useMemo, useState } from "react"
import { Address, isAddress, zeroAddress } from "viem"
import { useAccount as useWagmiAccount } from "wagmi"

// Re-done wagmi's "useAccount" with Reown AppKit instead
export function useAccount() {
    const { address, isConnected, status } = useAppKitAccount()
    const { connector, chain } = useWagmiAccount()

    const isConnecting = status === "connecting"
    const isReconnecting = status === "reconnecting"

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const addressLowercased = useMemo(() => {
        if (!mounted) {
            return undefined
        }

        if (address === zeroAddress) {
            return undefined
        }

        const addressLowercased = address?.toLowerCase() as (Address | undefined)
        if (addressLowercased && isAddress(addressLowercased)) {
            return addressLowercased
        }

        return undefined
    }, [address, mounted])

    return {
        address: addressLowercased,
        isConnected: isConnected && !!addressLowercased,
        isConnecting,
        isReconnecting,
        chain,
        connector
    }
}