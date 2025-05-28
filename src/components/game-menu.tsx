import introImage from '../assets/selections/introimagelandscape.png'

import { useState, useEffect } from "react"
import { LogOut, Bell } from "lucide-react"
import UsernameRegistration from "./username-registration"
import SelectionScreen from "./selection-screen"
import FeedingStation from "./feeding-station"
import PlantGrowingGame from "./plant-growing-game"
import AudioControls from "./audio-controls"
import SeedBankTab from "./seed-bank-tab"
import HarvestTab from "./harvest-tab"
import NotificationsModal from "./notifications-modal"
import SpinWheel from "./spin-wheel"
import type { GameSelections, User, AudioSettings } from "../types/game-types"

interface GameMenuProps {
  user: User
  audioSettings: AudioSettings
  onAudioChange: (settings: AudioSettings) => void
  onDisconnectWallet: () => void
}

export default function GameMenu({ user, audioSettings, onAudioChange, onDisconnectWallet }: GameMenuProps) {
  const [activeTab, setActiveTab] = useState("start")
  const [currentScreen, setCurrentScreen] = useState("menu") // "menu", "selection", "feeding", "game"
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [isRegistered, setIsRegistered] = useState(user.isRegistered)
  const [lives, setLives] = useState(3) // Daily lives for planting
  const [showSpinWheel, setShowSpinWheel] = useState(false)
  const [canSpin, setCanSpin] = useState(true)
  const [spinResult, setSpinResult] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)

  // Game selections state
  const [gameSelections, setGameSelections] = useState<GameSelections>({
    seed: null,
    soil: null,
    defense: null,
    feedingSchedule: {
      sprout: null,
      vegetative: null,
      flowering: null,
    },
  })

  const menuTabs = [
    { id: "start", label: "Start Growing", icon: "🌱" },
    { id: "seedbank", label: "Seed Bank", icon: "🏦" },
    { id: "harvest", label: "Harvest", icon: "🌿" },
    { id: "howto", label: "How to Play", icon: "❓" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  ]

  // Load lives and spin status from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLives = localStorage.getItem(`marrow_grow_lives_${user.walletAddress}`)
      const lastReset = localStorage.getItem(`marrow_grow_last_reset_${user.walletAddress}`)
      const lastSpin = localStorage.getItem(`marrow_grow_last_spin_${user.walletAddress}`)

      const today = new Date().toDateString()

      if (lastReset !== today) {
        // Reset lives to 3 and spin availability for new day
        setLives(3)
        setCanSpin(true)
        localStorage.setItem(`marrow_grow_lives_${user.walletAddress}`, "3")
        localStorage.setItem(`marrow_grow_last_reset_${user.walletAddress}`, today)
        localStorage.removeItem(`marrow_grow_last_spin_${user.walletAddress}`)
      } else {
        if (savedLives) {
          setLives(Number.parseInt(savedLives))
        }
        if (lastSpin === today) {
          setCanSpin(false)
        }
      }
    }
  }, [user.walletAddress])

  // Save lives to localStorage
  const handleLivesChange = (newLives: number) => {
    setLives(newLives)
    if (typeof window !== "undefined") {
      localStorage.setItem(`marrow_grow_lives_${user.walletAddress}`, newLives.toString())
    }
  }

  const handleUsernameRegistered = (newUsername: string) => {
    setUsername(newUsername)
    setIsRegistered(true)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleScreenTransition = (newScreen: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScreen(newScreen)
      setIsTransitioning(false)
    }, 300)
  }

  const handleSelectionChange = (type: "seed" | "soil" | "defense", value: string) => {
    setGameSelections((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleFeedingChange = (stage: "sprout" | "vegetative" | "flowering", nutrient: string) => {
    setGameSelections((prev) => ({
      ...prev,
      feedingSchedule: {
        ...prev.feedingSchedule,
        [stage]: nutrient,
      },
    }))
  }

  const handleStartGrowing = () => {
    if (lives > 0) {
      // Don't consume life yet, wait until feeding station
      handleScreenTransition("selection")
    }
  }

  const handleFeedingStationNext = () => {
    // Consume life when proceeding from feeding station to actual game
    handleLivesChange(lives - 1)
    handleScreenTransition("game")
  }

  const handleGameComplete = (results: { potency: number; yield: number }) => {
    // Handle game completion - could save results, show celebration, etc.
    console.log("Game completed with results:", results)
    // Return to menu after a delay
    setTimeout(() => {
      handleScreenTransition("menu")
      // Reset selections for next game
      setGameSelections({
        seed: null,
        soil: null,
        defense: null,
        feedingSchedule: {
          sprout: null,
          vegetative: null,
          flowering: null,
        },
      })
    }, 3000)
  }

  const handleSpinWheel = (result: { symbols: string[]; wonLife: boolean }) => {
    if (result.wonLife) {
      handleLivesChange(lives + 1)
      setSpinResult(`You won a life! ${result.symbols.join("")}`)
    } else {
      setSpinResult(`No luck this time... ${result.symbols.join("")}`)
    }

    // Mark spin as used for today
    setCanSpin(false)
    if (typeof window !== "undefined") {
      const today = new Date().toDateString()
      localStorage.setItem(`marrow_grow_last_spin_${user.walletAddress}`, today)
    }

    // Clear result after 3 seconds
    setTimeout(() => {
      setSpinResult(null)
    }, 3000)
  }

  const handleMarkAllRead = () => {
    setHasUnreadNotifications(false)
    // Here you would also update the backend/state to mark notifications as read
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "start":
        if (!isRegistered) {
          return <UsernameRegistration onUsernameRegistered={handleUsernameRegistered} />
        }

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-yellow-300 text-center mb-4">Welcome, {username}!</h3>

            {/* Lives Display */}
            <div className="bg-purple-900/60 rounded-lg border-2 border-purple-500/50 p-4 backdrop-blur-sm text-center">
              <div className="text-green-300 text-lg font-bold mb-1">Lives: {lives}</div>
              <div className="text-purple-200 text-sm">
                {lives > 0 ? "Ready to plant!" : "No lives remaining. Try the daily spin!"}
              </div>
            </div>

            <p className="text-purple-200 text-sm text-center mb-6">Ready to start your growing adventure?</p>

            <button
              onClick={handleStartGrowing}
              disabled={lives === 0}
              className="w-full bg-purple-700/60 hover:bg-purple-600/60 disabled:bg-purple-800/40 disabled:opacity-50 text-yellow-300 font-bold py-3 px-6 rounded border-2 border-purple-500/50 shadow-lg transform transition-transform hover:scale-105 backdrop-blur-sm"
            >
              {lives > 0 ? "Play" : "No Lives Remaining"}
            </button>

            {/* Spin Button */}
            <button
              onClick={() => setShowSpinWheel(true)}
              disabled={!canSpin}
              className="w-full bg-gradient-to-r from-yellow-700/60 to-orange-700/60 hover:from-yellow-600/60 hover:to-orange-600/60 disabled:from-gray-700/40 disabled:to-gray-800/40 disabled:opacity-50 text-yellow-300 font-bold py-3 px-6 rounded border-2 border-yellow-500/50 shadow-lg transform transition-transform hover:scale-105 backdrop-blur-sm"
            >
              {canSpin ? "🎰 Spin for Extra Lives" : "Daily Spin Used"}
            </button>

            {/* Spin Result */}
            {spinResult && (
              <div
                className={`text-center p-3 rounded border-2 backdrop-blur-sm ${spinResult.includes("won")
                  ? "bg-green-900/60 border-green-500/50 text-green-300"
                  : "bg-red-900/60 border-red-500/50 text-red-300"
                  }`}
              >
                {spinResult}
              </div>
            )}

            {!canSpin && <p className="text-purple-300 text-xs text-center">Daily spin resets tomorrow!</p>}
          </div>
        )

      case "seedbank":
        return <SeedBankTab user={user} lives={lives} />

      case "harvest":
        return <HarvestTab user={user} />

      case "howto":
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-yellow-300 text-center">How to Play</h3>
            <div className="text-green-300 text-sm space-y-2">
              <p>• Connect your Web3 wallet</p>
              <p>• Register your grower username</p>
              <p>• You get 3 lives daily to plant seeds</p>
              <p>• Select seed, soil, and defense</p>
              <p>• Set up feeding schedule (3 options per stage)</p>
              <p>• Monitor your plant's health, water, light, and nutrients</p>
              <p>• Fix lights when they fail to prevent plant death</p>
              <p>• Defend against pests and raiders</p>
              <p>• Harvest for potency and yield rewards</p>
              <p>• Get one daily spin for extra lives</p>
            </div>
          </div>
        )

      case "leaderboard":
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-yellow-300 text-center">Top Growers</h3>
            <div className="space-y-2">
              {[
                { rank: 1, name: "GreenThumb420", score: 15420 },
                { rank: 2, name: "PlantMaster", score: 12350 },
                { rank: 3, name: "BudGuru", score: 9870 },
              ].map((player) => (
                <div
                  key={player.rank}
                  className="flex justify-between items-center bg-purple-900/60 p-2 rounded border border-purple-500/50 backdrop-blur-sm"
                >
                  <span className="text-yellow-300">#{player.rank}</span>
                  <span className="text-green-300">{player.name}</span>
                  <span className="text-white">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "selection":
        return (
          <SelectionScreen
            selections={gameSelections}
            onSelectionChange={handleSelectionChange}
            onNext={() => handleScreenTransition("feeding")}
            onBack={() => handleScreenTransition("menu")}
          />
        )
      case "feeding":
        return (
          <FeedingStation
            selections={gameSelections}
            onFeedingChange={handleFeedingChange}
            onNext={handleFeedingStationNext}
            onBack={() => handleScreenTransition("selection")}
          />
        )
      case "game":
        return (
          <PlantGrowingGame
            selections={gameSelections}
            onGameComplete={handleGameComplete}
            onBack={() => handleScreenTransition("menu")}
          />
        )
      default:
        return renderTabContent()
    }
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

      <div
        className={`relative z-10 w-full transition-all duration-300 ${currentScreen === "game"
          ? "max-w-full"
          : currentScreen === "feeding"
            ? "max-w-6xl"
            : currentScreen === "selection"
              ? "max-w-4xl"
              : "max-w-md"
          } ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        {currentScreen === "menu" ? (
          <>
            {/* Wallet Status Bar */}
            <div className="mb-4 bg-purple-800/60 rounded-lg border-2 border-purple-600/50 p-3 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-sm">
                  <div className="text-green-300 font-mono">{formatAddress(user.walletAddress)}</div>
                  {isRegistered && <div className="text-yellow-300 text-xs">@{username}</div>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications Button */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 rounded-full bg-purple-700/60 border border-purple-500/50 text-purple-200 hover:text-yellow-300 hover:bg-purple-600/60 transition-colors"
                  title="Notifications"
                >
                  <Bell size={16} />
                  {hasUnreadNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={onDisconnectWallet}
                  className="p-2 rounded-full bg-purple-700/60 border border-purple-500/50 text-purple-200 hover:text-red-300 hover:bg-purple-600/60 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Main Menu Card */}
            <div className="bg-gradient-to-b from-purple-800/60 to-purple-900/70 rounded-lg border-4 border-purple-600/50 shadow-2xl overflow-hidden backdrop-blur-md">
              {/* Menu Tabs */}
              <div className="grid grid-cols-3 gap-1 p-2 bg-purple-800/60">
                {menuTabs.slice(0, 3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded text-sm font-bold transition-all duration-200 backdrop-blur-sm ${activeTab === tab.id
                      ? "bg-purple-900/70 text-green-300 border-2 border-green-400/50 shadow-inner"
                      : "bg-purple-700/60 text-purple-200 border-2 border-purple-500/50 hover:bg-purple-600/60 hover:text-green-300"
                      }`}
                  >
                    <div className="text-lg mb-1">{tab.icon}</div>
                    <div className="text-xs">{tab.label}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 px-2 pb-2 bg-purple-800/60">
                {menuTabs.slice(3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded text-sm font-bold transition-all duration-200 backdrop-blur-sm ${activeTab === tab.id
                      ? "bg-purple-900/70 text-green-300 border-2 border-green-400/50 shadow-inner"
                      : "bg-purple-700/60 text-purple-200 border-2 border-purple-500/50 hover:bg-purple-600/60 hover:text-green-300"
                      }`}
                  >
                    <div className="text-lg mb-1">{tab.icon}</div>
                    <div className="text-xs">{tab.label}</div>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-6 bg-gradient-to-b from-purple-900/60 to-black/70 min-h-[300px] border-t-4 border-purple-600/50 backdrop-blur-md">
                {renderCurrentScreen()}
              </div>
            </div>
          </>
        ) : (
          /* Other Screens */
          <div
            className={
              currentScreen === "game"
                ? ""
                : "bg-gradient-to-b from-purple-800/60 to-purple-900/70 rounded-lg border-4 border-purple-600/50 shadow-2xl overflow-hidden backdrop-blur-md p-6"
            }
          >
            {renderCurrentScreen()}
          </div>
        )}

        {/* Audio Controls - Only show on menu */}
        {currentScreen === "menu" && (
          <div className="mt-8">
            <AudioControls audioSettings={audioSettings} onAudioChange={onAudioChange} />
          </div>
        )}

        {/* Footer text - Only show on menu */}
        {currentScreen === "menu" && (
          <div className="text-center mt-4 text-purple-300 text-xs backdrop-blur-sm bg-black/20 rounded px-3 py-1">
            Marrow Grow • Begin the Ritual
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        user={user}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheel onSpin={handleSpinWheel} onClose={() => setShowSpinWheel(false)} canSpin={canSpin} />
      )}
    </div>
  )
}
