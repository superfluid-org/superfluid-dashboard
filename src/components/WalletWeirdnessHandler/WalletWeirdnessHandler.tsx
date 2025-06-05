import { useEthersSigner } from "@/utils/wagmiEthersAdapters"
import { useAppKitAccount, useAppKitNetwork, useAppKitState, useDisconnect as useAppKitDisconnect } from "@reown/appkit/react"
import { useEffect, useState } from "react"
import { useAccount as useWagmiAccount, useDisconnect as useWagmiDisconnect } from "wagmi"

export function WalletWeirdnessHandler() {
    const { chainId: wagmiChainId } = useWagmiAccount()
    const { chainId: appkitChainId } = useAppKitNetwork()

    const { disconnect: wagmiDisconnect } = useWagmiDisconnect()
    const { disconnect: appKitDisconnect } = useAppKitDisconnect()

    const { address: accountAddress, status: appkitStatus, isConnected: appKitIsConnected } = useAppKitAccount()
    const appKitState = useAppKitState()

    const isAppKitDoingSomething = !appKitState.initialized && !appKitState.loading && !(appkitStatus === "connecting" || appkitStatus === "reconnecting")

    const doesAppKitThinkItIsReady = !isAppKitDoingSomething

    const [hasBeenHandledOnce, setHasBeenHandledOnce] = useState(false)

    const signer = useEthersSigner({ chainId: wagmiChainId })

    useEffect(() => {
        if (hasBeenHandledOnce) {
            // We've already tried to handle it once, trying it again could potentially keep the user out in forever-loop (?)
            return
        }

        if (doesAppKitThinkItIsReady) {
            const isAppKitConfusedAboutBeingConnected = appKitIsConnected && appkitStatus === "disconnected"
            if (isAppKitConfusedAboutBeingConnected) {
                const timeout = setTimeout(() => {
                    console.warn("AppKit's internal connection state is confused about connection status. Disconnecting...")
                    appKitDisconnect()
                    wagmiDisconnect()
                    setHasBeenHandledOnce(true)
                }, 1000)
                return () => clearTimeout(timeout)
            }
            if (appKitIsConnected) {
                if (wagmiChainId !== appkitChainId) {
                    const timeout = setTimeout(() => {
                        console.warn("AppKit's internal chain state is confused. AppKit and Wagmi disagree about the chain ID. Disconnecting...")
                        appKitDisconnect()
                        wagmiDisconnect()
                        setHasBeenHandledOnce(true)
                    }, 3000)
                    return () => clearTimeout(timeout)
                }
            }
            if (accountAddress && !signer) {
                const timeout = setTimeout(() => {
                    console.warn("AppKit's internal state is unable to get the signer. Disconnecting...")
                    appKitDisconnect()
                    wagmiDisconnect()
                    setHasBeenHandledOnce(true)
                }, 3000)
                return () => clearTimeout(timeout)
            }
        }
    }, [doesAppKitThinkItIsReady, appKitDisconnect, wagmiDisconnect, appKitIsConnected, appkitStatus, appkitChainId, wagmiChainId, signer])

    return null
}
