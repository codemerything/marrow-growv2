import './App.css'
import { useState, useEffect } from "react"
import ConnectWalletPage from "./components/connect-wallet-page"
import GameMenu from "./components/game-menu"
import { getWeb3Service } from "./utils/web3"
import { SessionManager } from "./utils/session"
import { useWallet } from "./hooks/use-wallet"
import type { User, AudioSettings, Player } from "./types/game-types"

export default function App() {
  const [user, setUser] = useState<User>({
    isWalletConnected: false,
    walletAddress: "",
    username: "",
    isRegistered: false,
  })

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    soundEnabled: true,
    musicEnabled: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const { isWalletAvailable, isClient } = useWallet()

  useEffect(() => {
    if (isClient) {
      checkExistingSession()
    }
  }, [isClient])

  const checkExistingSession = async () => {
    try {
      // Check if we have wallet support
      if (!isWalletAvailable) {
        setIsLoading(false)
        return
      }

      const session = SessionManager.getSession()
      if (session) {
        // Update activity timestamp
        SessionManager.updateSessionActivity()

        try {
          const web3Service = getWeb3Service()

          // Check if player is registered on-chain
          const isRegistered = await web3Service.isPlayerRegistered(session.address)

          let player: Player | undefined
          if (isRegistered) {
            player = await web3Service.getPlayer(session.address)
          }

          setUser({
            isWalletConnected: true,
            walletAddress: session.address,
            username: player?.username || "",
            isRegistered,
            player,
          })
        } catch (error) {
          console.error("Error checking blockchain data:", error)
          // Keep the session but mark as not registered if blockchain call fails
          setUser({
            isWalletConnected: true,
            walletAddress: session.address,
            username: "",
            isRegistered: false,
          })
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
      SessionManager.clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnected = async (address: string, signature: string) => {
    try {
      const web3Service = getWeb3Service()

      // Check if player is already registered
      const isRegistered = await web3Service.isPlayerRegistered(address)

      let player: Player | undefined
      if (isRegistered) {
        player = await web3Service.getPlayer(address)
      }

      setUser({
        isWalletConnected: true,
        walletAddress: address,
        username: player?.username || "",
        isRegistered,
        player,
      })
    } catch (error) {
      console.error("Error checking player registration:", error)
      setUser({
        isWalletConnected: true,
        walletAddress: address,
        username: "",
        isRegistered: false,
      })
    }
  }

  const handleDisconnectWallet = () => {
    SessionManager.clearSession()
    const web3Service = getWeb3Service()
    web3Service.disconnect()
    setUser({
      isWalletConnected: false,
      walletAddress: "",
      username: "",
      isRegistered: false,
    })
  }

  const handleAudioChange = (newSettings: AudioSettings) => {
    setAudioSettings(newSettings)
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("marrow_grow_audio", JSON.stringify(newSettings))
    }
  }

  // Load audio settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAudio = localStorage.getItem("marrow_grow_audio")
        if (savedAudio) {
          setAudioSettings(JSON.parse(savedAudio))
        }
      } catch (error) {
        console.error("Error loading audio settings:", error)
      }
    }
  }, [])

  if (!isClient || isLoading) {
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

  if (!user.isWalletConnected) {
    return (
      <ConnectWalletPage
        audioSettings={audioSettings}
        onAudioChange={handleAudioChange}
        onWalletConnected={handleWalletConnected}
      />
    )
  }

  return (
    <GameMenu
      user={user}
      audioSettings={audioSettings}
      onAudioChange={handleAudioChange}
      onDisconnectWallet={handleDisconnectWallet}
    />
  )
}
