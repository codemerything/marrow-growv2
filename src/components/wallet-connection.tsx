import { useState } from "react"
import { Wallet } from "lucide-react"

interface WalletConnectionProps {
  onWalletConnected: (address: string) => void
}

export default function WalletConnection({ onWalletConnected }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
      onWalletConnected(mockAddress)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-xl font-bold text-yellow-300 mb-4">Connect Your Wallet</h3>
      <p className="text-purple-200 text-sm mb-6">Connect your Web3 wallet to start your growing journey</p>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 text-yellow-300 font-bold py-3 px-6 rounded border-2 border-purple-500 shadow-lg transform transition-transform hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2"
      >
        <Wallet size={20} />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    </div>
  )
}
