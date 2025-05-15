
import { useAppKitAccount } from "@reown/appkit/react"
import { useMemo } from "react"
import { Address } from "viem"
import { useAccount as useWagmiAccount } from "wagmi"

// Re-done wagmi's "useAccount" with Reown AppKit instead
export function useAccount() {
    const { address, isConnected, status } = useAppKitAccount()
    const { connector, chain } = useWagmiAccount()

    const isConnecting = status === "connecting"
    const isReconnecting = status === "reconnecting"
    const addressLowercased = useMemo(() => address?.toLowerCase() as (Address | undefined), [address])

    return {
        address: addressLowercased,
        isConnected,
        isConnecting,
        isReconnecting,
        chain,
        connector
    }
}