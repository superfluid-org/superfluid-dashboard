
import { useAppKitAccount } from "@reown/appkit/react"
import { useEffect, useMemo, useState } from "react"
import { Address, isAddress, zeroAddress } from "viem"
import { useAccount as useWagmiAccount } from "wagmi"

// Re-done wagmi's "useAccount" with Reown AppKit instead
export function useAccount() {
    const { address: appKitAddress, isConnected, status } = useAppKitAccount()
    const { connector, chain, address: wagmiAddress } = useWagmiAccount()

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

        // AppKit can lag behind wagmi during reconnection (e.g. page refresh with
        // existing session). Fall back to wagmi's address so that the transaction
        // drawer - which filters by signerAddress stored via the wagmi connector -
        // stays in sync and never shows an empty list while AppKit catches up.
        const address = appKitAddress ?? wagmiAddress

        if (address === zeroAddress) {
            return undefined
        }

        const addressLowercased = address?.toLowerCase() as (Address | undefined)
        if (addressLowercased && isAddress(addressLowercased)) {
            return addressLowercased
        }

        return undefined
    }, [appKitAddress, wagmiAddress, mounted])

    return {
        address: addressLowercased,
        isConnected: isConnected && !!addressLowercased,
        isConnecting,
        isReconnecting,
        chain,
        connector
    }
}