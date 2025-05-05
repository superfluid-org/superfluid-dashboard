import { useAppKitAccount, useAppKitNetwork, useAppKitState, useDisconnect as useAppKitDisconnect } from "@reown/appkit/react"
import { useEffect, useState } from "react"
import { useAccount as useWagmiAccount, useDisconnect as useWagmiDisconnect } from "wagmi"

export function WalletWeirdnessHandler() {
    const { chainId: wagmiChainId } = useWagmiAccount()
    const { chainId: appkitChainId } = useAppKitNetwork()

    const { disconnect: wagmiDisconnect } = useWagmiDisconnect()
    const { disconnect: appKitDisconnect } = useAppKitDisconnect()

    const { status: appkitStatus, isConnected: appKitIsConnected } = useAppKitAccount()
    const appKitState = useAppKitState()

    const isAppKitDoingSomething = !appKitState.initialized && !appKitState.loading && !(appkitStatus === "connecting" || appkitStatus === "reconnecting")

    const doesAppKitThinkItIsReady = !isAppKitDoingSomething

    const [hasBeenHandledOnce, setHasBeenHandledOnce] = useState(false)

    useEffect(() => {
        if (hasBeenHandledOnce) {
            // We've already tried to handle it once, trying it again could potentially keep the user out in forever-loop (?)
            return
        }

        if (doesAppKitThinkItIsReady) {
            const isAppKitConfusedAboutBeingConnected = appKitIsConnected && appkitStatus === "disconnected"
            if (isAppKitConfusedAboutBeingConnected) {
                const timeout = setTimeout(() => {
                    console.warn("AppKit's internal connection state is confused. Disconnecting...")
                    appKitDisconnect()
                    wagmiDisconnect()
                    setHasBeenHandledOnce(true)
                }, 1000)
                return () => clearTimeout(timeout)
            }
            if (appKitIsConnected) {
                if (wagmiChainId !== appkitChainId) {
                    const timeout = setTimeout(() => {
                        console.warn("AppKit's internal chain state is confused. Disconnecting...")
                        appKitDisconnect()
                        wagmiDisconnect()
                        setHasBeenHandledOnce(true)
                    }, 3000)
                    return () => clearTimeout(timeout)
                }
            }
        }
    }, [doesAppKitThinkItIsReady, appKitDisconnect, wagmiDisconnect, appKitIsConnected, appkitStatus, appkitChainId, wagmiChainId])

    return null
}
