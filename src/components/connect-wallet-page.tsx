import introImage from '../assets/selections/introimagelandscape.png'

import { useState } from "react"
import { Wallet, AlertCircle, ExternalLink } from "lucide-react"
import AudioControls from "./audio-controls"
import { getWeb3Service } from "../utils/web3"
import { SessionManager } from "../utils/session"
import { useWallet } from "../hooks/use-wallet"
import type { AudioSettings } from "../types/game-types"

interface ConnectWalletPageProps {
    audioSettings: AudioSettings
    onAudioChange: (settings: AudioSettings) => void
    onWalletConnected: (address: string, signature: string) => void
}

export default function ConnectWalletPage({ audioSettings, onAudioChange, onWalletConnected }: ConnectWalletPageProps) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { isWalletAvailable, isClient } = useWallet()

    const connectWallet = async () => {
        if (!isClient) {
            setError("Please wait for the page to load completely.")
            return
        }

        if (!isWalletAvailable) {
            setError("No wallet provider found. Please install MetaMask or another Web3 wallet.")
            return
        }

        setIsConnecting(true)
        setError(null)

        try {
            const web3Service = getWeb3Service()
            const { address, signature } = await web3Service.connectWallet()

            // Save session
            SessionManager.saveSession(address, signature)

            // Call parent callback
            onWalletConnected(address, signature)
        } catch (error: any) {
            console.error("Wallet connection failed:", error)
            setError(error.message || "Failed to connect wallet. Please try again.")
        } finally {
            setIsConnecting(false)
        }
    }

    const openMetaMaskDownload = () => {
        window.open("https://metamask.io/download/", "_blank")
    }

    // Show loading state while checking for wallet
    if (!isClient) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/marrow-grow-artwork.png')",
                    }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mx-auto mb-4"></div>
                    <p className="text-yellow-300 text-lg">Loading Marrow Grow...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${introImage})`,
                }}
            />

            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 w-full max-w-md">
                {/* Game Title */}


                {/* Connect Wallet Card */}
                <div className="bg-gradient-to-b from-purple-700/95 to-purple-900/95 rounded-lg border-4 border-purple-500 shadow-2xl overflow-hidden backdrop-blur-md p-8">
                    <div className="text-center space-y-6">
                        <h2 className="text-2xl font-bold text-yellow-300 mb-6">Welcome to the Ritual</h2>

                        <p className="text-purple-200 text-sm mb-8">
                            Connect your Web3 wallet to begin your mystical growing journey on Base Network
                        </p>

                        {error && (
                            <div className="bg-red-900/80 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-400 mt-0.5" size={20} />
                                <div className="text-left">
                                    <p className="text-red-200 text-sm">{error}</p>
                                    {!isWalletAvailable && (
                                        <button
                                            onClick={openMetaMaskDownload}
                                            className="mt-2 text-red-300 hover:text-red-100 text-sm underline flex items-center gap-1"
                                        >
                                            Download MetaMask <ExternalLink size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isWalletAvailable ? (
                            <div className="space-y-4">
                                <div className="bg-yellow-900/80 border border-yellow-500 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
                                    <div className="text-left">
                                        <p className="text-yellow-200 text-sm">No Web3 wallet detected</p>
                                        <p className="text-yellow-300 text-xs mt-1">
                                            Please install MetaMask or another Web3 wallet to continue
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={openMetaMaskDownload}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg border-2 border-blue-400 shadow-lg transform transition-all duration-200 hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-3 text-lg"
                                >
                                    <ExternalLink size={24} />
                                    Install MetaMask
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-yellow-300 font-bold py-4 px-8 rounded-lg border-2 border-purple-400 shadow-lg transform transition-all duration-200 hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-3 text-lg"
                            >
                                <Wallet size={24} />
                                {isConnecting ? "Connecting..." : "CONNECT WALLET"}
                            </button>
                        )}

                        {isConnecting && (
                            <div className="space-y-3">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
                                </div>
                                <p className="text-purple-300 text-sm">Please check your wallet and sign the authentication message</p>
                            </div>
                        )}

                        {isWalletAvailable && (
                            <div className="text-purple-300 text-xs space-y-1">
                                <p>• Make sure you have MetaMask or compatible wallet installed</p>
                                <p>• You'll be prompted to switch to Base Sepolia network</p>
                                <p>• Sign the message to authenticate your session</p>
                            </div>
                        )}
                    </div>

                    {/* Menu Options */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button className="text-purple-300 hover:text-yellow-300 text-sm transition-colors">How to Play</button>
                        <span className="text-purple-500">•</span>
                        <button className="text-purple-300 hover:text-yellow-300 text-sm transition-colors">Leaderboard</button>
                    </div>
                </div>

                {/* Audio Controls */}
                <div className="mt-8">
                    <AudioControls audioSettings={audioSettings} onAudioChange={onAudioChange} />
                </div>

                {/* Footer text */}
                <div className="text-center mt-6 text-purple-300 text-xs backdrop-blur-sm bg-black/20 rounded px-3 py-1">
                    Marrow Grow • Enter the Mystical Realm
                </div>
            </div>
        </div>
    )
}
