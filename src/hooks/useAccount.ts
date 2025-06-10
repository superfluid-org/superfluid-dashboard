
import { useAppKitAccount } from "@reown/appkit/react"
import { useMemo } from "react"
import { Address, isAddress, zeroAddress } from "viem"
import { useAccount as useWagmiAccount } from "wagmi"

// Re-done wagmi's "useAccount" with Reown AppKit instead
export function useAccount() {
    const { address, isConnected, status } = useAppKitAccount()
    const { connector, chain } = useWagmiAccount()

    const isConnecting = status === "connecting"
    const isReconnecting = status === "reconnecting"
    const addressLowercased = useMemo(() => {
        if (address === zeroAddress) {
            return undefined
        }

        const addressLowercased = address?.toLowerCase() as (Address | undefined)
        if (addressLowercased && isAddress(addressLowercased)) {
            return addressLowercased
        }

        return undefined
    }, [address])

    return {
        address: addressLowercased,
        isConnected: isConnected && !!addressLowercased,
        isConnecting,
        isReconnecting,
        chain,
        connector
    }
}