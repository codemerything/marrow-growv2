import { useState, useEffect, useRef } from "react"
import { AlertTriangle } from "lucide-react"
import cryptCookiesImg from '../assets/seeds/testmillion.png';
import skeleSkittlezImg from '../assets/seeds/seedmillion2.png';
import boneBlossomImg from '../assets/seeds/seed.png';

// Game configuration constants
const GAME_CONFIG = {
  GROWTH_STAGES: [
    { name: "Sprout", time: 32, image: "sprout" },
    { name: "Vegetative", time: 48, image: "vegetative" },
    { name: "Flowering", time: 64, image: "flowering" },
    { name: "Harvest", time: 0, image: "harvest" },
  ],
  INITIAL_RESOURCES: {
    health: 100,
    water: 80,
    light: 100,
    nutrients: 80,
    stress: 0,
  },
}

// Seed properties with pixel art images
const SEED_PROPERTIES = {
  "crypt-cookies": {
    name: "Crypt Cookies",
    waterDrain: 0.6,
    nutrientDrain: 0.5,
    image: cryptCookiesImg,
    desc: "Balanced, classic strain.",
  },
  "skele-skittlez": {
    name: "Skele Skittlez",
    waterDrain: 0.5,
    nutrientDrain: 0.7,
    image: skeleSkittlezImg,
    desc: "Potent, nutrient-hungry.",
  },
  "bone-blossom": {
    name: "Bone Blossom",
    waterDrain: 0.7,
    nutrientDrain: 0.6,
    image: boneBlossomImg,
    desc: "Unpredictable, mid stats.",
  },
}

// Soil types
const SOIL_TYPES = {
  "bone-dust": { name: "Bone Dust", waterDrain: 0.5, nutrientDrain: 0.6, desc: "Rich in calcium" },
  "magic-moss": { name: "Magic Moss", waterDrain: 0.6, nutrientDrain: 0.4, desc: "Mystical properties" },
  "basic-soil": { name: "Eh.. Not sure", waterDrain: 0.5, nutrientDrain: 0.5, desc: "Standard growing medium" },
}

// Defense types
const DEFENSE_TYPES = {
  grower: { name: "Grower", desc: "Defends against pests", icon: "🛡️" },
  hound: { name: "Hound", desc: "Defends against raiders", icon: "🐕" },
  vault: { name: "Vault", desc: "Protects your seeds", icon: "🔒" },
}

// Nutrient mixes for feeding schedule
const NUTRIENT_MIXES = {
  basic: { name: "Basic Mix", desc: "Standard, reliable feed.", potency: 1.0, yield: 1.0, nutrientFeed: 10 },
  growth: { name: "Growth Boost", desc: "Bigger yields, less potency.", potency: 0.9, yield: 1.2, nutrientFeed: 25 },
  potent: { name: "Potency Plus", desc: "More potent, less yield.", potency: 1.2, yield: 0.9, nutrientFeed: 15 },
  balanced: { name: "Balanced Blend", desc: "Slight boost to both.", potency: 1.1, yield: 1.1, nutrientFeed: 18 },
  cosmic: {
    name: "Cosmic Compost",
    desc: "Unpredictable, sometimes amazing.",
    potency: 1.4,
    yield: 1.0,
    nutrientFeed: 20,
  },
  doomdust: {
    name: "Doom Dust",
    desc: "Dangerous, huge yields if you survive.",
    potency: 0.6,
    yield: 1.4,
    nutrientFeed: 28,
  },
}

// Random events
const PEST_EVENTS = [
  { name: "Space Slugs", damage: [4, 12], message: "Space slugs are oozing over your plants!" },
  { name: "Brain Leeches", damage: [5, 15], message: "Brain leeches are draining your plant's will to live!" },
  { name: "Crypt Mites", damage: [3, 10], message: "Crypt mites are gnawing at your roots!" },
  { name: "Phantom Gnats", damage: [2, 8], message: "Phantom gnats are haunting your soil!" },
]

const RAIDER_EVENTS = [
  { name: "Crypt Bandits", damage: [10, 20], message: "Crypt bandits are sneaking into your garden!" },
  { name: "Mutant Chickens", damage: [8, 18], message: "Mutant chickens are pecking at your stash!" },
  { name: "Alien Harvesters", damage: [15, 25], message: "Alien harvesters are beaming up your buds!" },
  {
    name: "Corporate Thieves",
    damage: [20, 30],
    message: "Corporate security forces are attempting to seize your crop!",
  },
]

interface GameState {
  // Plant properties
  seedType: string | null
  soilType: string | null
  defenseType: string | null

  // Resources (0-100)
  health: number
  water: number
  light: number
  nutrients: number
  stress: number

  // Growth tracking
  growthStage: number
  stageTime: number
  totalGrowthTime: number

  // Game state
  isGrowing: boolean
  isPaused: boolean
  gameSpeed: number

  // Events
  activeEvent: string | null
  eventTimeout: number | null

  // Lighting system
  lightsOn: boolean
  lightFailureTime: number | null

  // Feeding schedule
  feedingSchedule: {
    sprout: { waterTimes: number; nutrientMix: string | null }
    vegetative: { waterTimes: number; nutrientMix: string | null }
    flowering: { waterTimes: number; nutrientMix: string | null }
  }

  // Final results
  finalPotency: number | null
  finalYield: number | null

  // Modifiers
  pestPenalty: number
  raiderPenalty: number
  potencyBoost: number

  // Statistics tracking
  healthSum: number
  healthTicks: number
}

interface PlantGrowingGameProps {
  selections: {
    seed: string | null
    soil: string | null
    defense: string | null
    feedingSchedule: {
      sprout: string | null
      vegetative: string | null
      flowering: string | null
    }
  }
  onGameComplete: (results: { potency: number; yield: number }) => void
  onBack: () => void
}

export default function PlantGrowingGame({ selections, onGameComplete, onBack }: PlantGrowingGameProps) {
  // Initialize game state
  const [gameState, setGameState] = useState<GameState>({
    seedType: selections.seed,
    soilType: selections.soil,
    defenseType: selections.defense,
    ...GAME_CONFIG.INITIAL_RESOURCES,
    growthStage: 0,
    stageTime: 0,
    totalGrowthTime: GAME_CONFIG.GROWTH_STAGES.slice(0, -1).reduce((sum, stage) => sum + stage.time, 0),
    isGrowing: false,
    isPaused: false,
    gameSpeed: 1,
    activeEvent: null,
    eventTimeout: null,
    lightsOn: true,
    lightFailureTime: null,
    feedingSchedule: {
      sprout: { waterTimes: 2, nutrientMix: "basic" },
      vegetative: { waterTimes: 3, nutrientMix: "growth" },
      flowering: { waterTimes: 4, nutrientMix: "potent" },
    },
    finalPotency: null,
    finalYield: null,
    pestPenalty: 1,
    raiderPenalty: 1,
    potencyBoost: 1,
    healthSum: 0,
    healthTicks: 0,
  })

  const [eventLog, setEventLog] = useState<Array<{ message: string; type: string; timestamp: number }>>([])
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const feedingTickRef = useRef(0)

  // Add event to log
  const addEventToLog = (message: string, type = "info") => {
    setEventLog((prev) => [
      { message, type, timestamp: Date.now() },
      ...prev.slice(0, 9), // Keep only last 10 events
    ])
  }

  // Start the game growth timer
  const startGrowthTimer = () => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
    }

    feedingTickRef.current = 0

    gameTimerRef.current = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState.isGrowing || prevState.isPaused) return prevState

        const newState = { ...prevState }

        // **RESOURCE DRAIN LOGIC**
        // Calculate drain rates based on seed and soil properties
        if (newState.seedType && newState.soilType) {
          // const seed = SEED_PROPERTIES[newState.seedType as keyof typeof SEED_PROPERTIES]
          const soil = SOIL_TYPES[newState.soilType as keyof typeof SOIL_TYPES]

          // Water drains based on soil properties
          const waterDrain = soil.waterDrain * newState.gameSpeed
          newState.water = Math.max(0, newState.water - waterDrain)

          // Nutrients drain at a base rate
          const nutrientDrain = 0.5 * newState.gameSpeed
          newState.nutrients = Math.max(0, newState.nutrients - nutrientDrain)
        }

        // **FEEDING SYSTEM**
        // Automatic feeding based on schedule
        feedingTickRef.current++
        const currentStage = GAME_CONFIG.GROWTH_STAGES[newState.growthStage]
        const stageKey = currentStage.name.toLowerCase() as "sprout" | "vegetative" | "flowering"
        const schedule = newState.feedingSchedule[stageKey]

        if (schedule && schedule.waterTimes > 0) {
          const feedInterval = Math.max(1, Math.floor(currentStage.time / schedule.waterTimes))

          if (feedingTickRef.current % feedInterval === 0) {
            // Add water
            newState.water = Math.min(100, newState.water + 20)

            // Add nutrients based on mix
            let nutrientAmount = 15
            if (schedule.nutrientMix && NUTRIENT_MIXES[schedule.nutrientMix as keyof typeof NUTRIENT_MIXES]) {
              const mix = NUTRIENT_MIXES[schedule.nutrientMix as keyof typeof NUTRIENT_MIXES]
              nutrientAmount = mix.nutrientFeed

              // Apply nutrient mix effects (once per stage)
              if (!newState[`${stageKey}NutrientApplied` as keyof GameState]) {
                newState.potencyBoost *= mix.potency
                // Yield effects will be applied at harvest
                newState[`${stageKey}NutrientApplied` as keyof GameState] = true as any
              }
            }

            newState.nutrients = Math.min(100, newState.nutrients + nutrientAmount)
          }
        }

        // **LIGHT FAILURE SYSTEM**
        // Random chance for lights to fail (5% per tick)
        if (newState.lightsOn && Math.random() < 0.05) {
          newState.lightsOn = false
          newState.lightFailureTime = Date.now()
          newState.light = Math.floor(Math.random() * 41) + 30 // 30-70% light when failed
          addEventToLog("Lights have gone out! Click to fix them!", "warning")
        }

        // Handle light failure effects
        if (!newState.lightsOn && newState.lightFailureTime) {
          const timeOff = (Date.now() - newState.lightFailureTime) / 1000
          // Gradually decrease light and increase health drain
          newState.light = Math.max(0, 100 - timeOff * 2)
          const drainRate = Math.min(1.0, 0.1 + timeOff / 300)
          newState.health = Math.max(0, newState.health - drainRate)
          newState.stress = Math.min(100, newState.stress + 0.5)
        }

        // **STRESS CALCULATION**
        // Stress increases when resources are out of optimal range (30-95%)
        let stressIncrease = 0

        if (newState.water < 30 || newState.water > 95) stressIncrease += 0.5
        if (newState.nutrients < 30 || newState.nutrients > 95) stressIncrease += 0.5
        if (newState.light < 50) stressIncrease += 0.5

        if (stressIncrease > 0) {
          newState.stress = Math.min(100, newState.stress + stressIncrease)
        } else {
          // Stress relief when resources are good
          newState.stress = Math.max(0, newState.stress - 0.5)
        }

        // **HEALTH CALCULATION**
        // Health decreases when resources are critically low or stress is high
        let healthPenalty = 0

        if (newState.water < 30 || newState.water > 95) healthPenalty += 0.5
        if (newState.nutrients < 30 || newState.nutrients > 95) healthPenalty += 0.5
        if (newState.stress > 80) healthPenalty += 0.5

        newState.health = Math.max(0, newState.health - healthPenalty)

        // Track health for final calculations
        newState.healthSum += newState.health
        newState.healthTicks++

        // **RANDOM EVENTS**
        // Trigger random events during growth (reduced frequency)
        if (!newState.activeEvent && Math.random() < 0.02) {
          // 2% chance per tick
          if (newState.growthStage === 2) {
            // Flowering stage
            // Can trigger raiders
            if (Math.random() < 0.5) {
              const raider = RAIDER_EVENTS[Math.floor(Math.random() * RAIDER_EVENTS.length)]
              newState.activeEvent = "raider"
              addEventToLog(raider.message, "warning")

              // Check defense
              if (newState.defenseType === "hound") {
                setTimeout(() => {
                  addEventToLog("Your Hound chased off the raiders!", "info")
                  setGameState((prev) => ({ ...prev, activeEvent: null }))
                }, 3000)
              } else {
                // Apply damage after delay
                setTimeout(() => {
                  const damage = Math.floor(Math.random() * 10) + 5
                  setGameState((prev) => ({
                    ...prev,
                    raiderPenalty: prev.raiderPenalty * (1 - damage / 100),
                    activeEvent: null,
                  }))
                  addEventToLog(`Raiders reduced yield by ${damage}%`, "error")
                }, 5000)
              }
            }
          } else {
            // Pest events in other stages
            const pest = PEST_EVENTS[Math.floor(Math.random() * PEST_EVENTS.length)]
            newState.activeEvent = "pest"
            addEventToLog(pest.message, "warning")

            // Check defense
            if (newState.defenseType === "grower") {
              setTimeout(() => {
                addEventToLog("Your Grower defended against the pests!", "info")
                setGameState((prev) => ({ ...prev, activeEvent: null }))
              }, 3000)
            } else {
              // Apply damage after delay
              setTimeout(() => {
                const damage = Math.floor(Math.random() * 10) + 5
                setGameState((prev) => ({
                  ...prev,
                  pestPenalty: prev.pestPenalty * (1 - damage / 100),
                  activeEvent: null,
                }))
                addEventToLog(`Pests reduced potency by ${damage}%`, "error")
              }, 5000)
            }
          }
        }

        // **GROWTH PROGRESSION**
        newState.stageTime++

        // Check if current stage is complete
        if (newState.stageTime >= GAME_CONFIG.GROWTH_STAGES[newState.growthStage].time) {
          if (newState.growthStage < GAME_CONFIG.GROWTH_STAGES.length - 2) {
            // Advance to next stage
            newState.growthStage++
            newState.stageTime = 0
            feedingTickRef.current = 0
            addEventToLog(`Entering ${GAME_CONFIG.GROWTH_STAGES[newState.growthStage].name} stage`, "info")
          } else {
            // Ready for harvest
            newState.growthStage = GAME_CONFIG.GROWTH_STAGES.length - 1
            newState.isGrowing = false

            // Calculate final results
            const avgHealth = newState.healthTicks > 0 ? newState.healthSum / newState.healthTicks / 100 : 1

            // **POTENCY CALCULATION**
            // Base potency 20-30%, with chance for higher (up to 70%)
            let basePotency = 20 + Math.random() * 10
            if (Math.random() < 0.2) {
              // 20% chance for higher potency
              basePotency = 30 + Math.random() * 40 // 30-70% range
            }

            const finalPotencyRaw = basePotency * newState.potencyBoost * newState.pestPenalty
            newState.finalPotency = Math.max(0, Math.min(70, Math.round(finalPotencyRaw)))

            // **YIELD CALCULATION**
            // Base yield 1-200g, affected by health and raiders
            const baseYield = 1 + Math.random() * 199
            const finalYieldRaw = baseYield * avgHealth * newState.raiderPenalty
            newState.finalYield = Math.max(1, Math.min(200, Math.round(finalYieldRaw)))

            addEventToLog("Plant is ready for harvest!", "info")

            // Auto-complete after a short delay
            setTimeout(() => {
              onGameComplete({
                potency: newState.finalPotency!,
                yield: newState.finalYield!,
              })
            }, 2000)
          }
        }

        // **GAME OVER CHECK**
        // Plant dies if health reaches 0 for too long
        if (newState.health <= 0) {
          newState.isGrowing = false
          addEventToLog("Your plant has died from neglect!", "error")
          setTimeout(() => {
            onBack() // Return to menu
          }, 3000)
        }

        return newState
      })
    }, 1000 / gameState.gameSpeed) // Adjust interval based on game speed
  }

  // Fix lights function
  const fixLights = () => {
    setGameState((prev) => ({
      ...prev,
      lightsOn: true,
      lightFailureTime: null,
      light: 100,
    }))
    addEventToLog("Lights are back on!", "info")
  }

  // Start game
  const startGame = () => {
    setGameState((prev) => ({ ...prev, isGrowing: true }))
    addEventToLog("Game started! Your plant begins to grow.", "info")
    startGrowthTimer()
  }

  // Toggle pause
  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
  }

  // Change game speed
  const changeGameSpeed = () => {
    setGameState((prev) => {
      const newSpeed = prev.gameSpeed === 1 ? 2 : prev.gameSpeed === 2 ? 3 : 1
      return { ...prev, gameSpeed: newSpeed }
    })

    // Restart timer with new speed
    if (gameState.isGrowing) {
      startGrowthTimer()
    }
  }

  // Calculate growth progress percentage
  const getGrowthProgress = () => {
    let elapsed = 0
    for (let i = 0; i < gameState.growthStage; i++) {
      elapsed += GAME_CONFIG.GROWTH_STAGES[i].time
    }
    elapsed += gameState.stageTime
    return Math.min(100, Math.round((elapsed / gameState.totalGrowthTime) * 100))
  }

  // Get current stage info
  const getCurrentStage = () => {
    return GAME_CONFIG.GROWTH_STAGES[gameState.growthStage] || GAME_CONFIG.GROWTH_STAGES[0]
  }

  // Get seed info
  const getSeedInfo = () => {
    return gameState.seedType ? SEED_PROPERTIES[gameState.seedType as keyof typeof SEED_PROPERTIES] : null
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
    }
  }, [])

  const seedInfo = getSeedInfo()
  const currentStage = getCurrentStage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-black/40 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            {seedInfo?.name || "Unknown Strain"}
          </h1>
          <div className="text-xl text-blue-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            Stage: {currentStage.name}
          </div>
          <div className="text-xl text-blue-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            Health: {Math.round(gameState.health)}%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Plant Display */}
          <div className="space-y-4">
            {/* Plant Image */}
            <div className="relative bg-purple-900/60 rounded-lg border-2 border-purple-500/50 p-4 h-80 flex items-center justify-center">
              {!gameState.lightsOn && (
                <div
                  className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer rounded-lg z-10"
                  onClick={fixLights}
                >
                  <div className="text-center">
                    <AlertTriangle className="text-yellow-400 mx-auto mb-2" size={48} />
                    <div className="text-white font-bold" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                      Lights Out!
                      <br />
                      Click to Fix
                    </div>
                  </div>
                </div>
              )}

              {/* Plant visualization based on stage and health */}
              <div className="text-center">
                {gameState.growthStage === 0 && <div className="text-6xl">🌱</div>}
                {gameState.growthStage === 1 && <div className="text-6xl">{gameState.stress > 50 ? "🥀" : "🌿"}</div>}
                {gameState.growthStage === 2 && <div className="text-6xl">{gameState.stress > 50 ? "🥀" : "🌸"}</div>}
                {gameState.growthStage === 3 && <div className="text-6xl">🌾</div>}

                <div className="mt-4 text-sm text-purple-200">{currentStage.name} Stage</div>
              </div>
            </div>

            {/* Seed and Soil Display */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3 text-center">
                {seedInfo && (
                  <>
                    <img
                      src={seedInfo.image || "/placeholder.svg"}
                      alt={seedInfo.name}
                      className="w-12 h-12 mx-auto mb-2 object-contain"
                    />
                    <div className="text-xs text-green-300">{seedInfo.name}</div>
                  </>
                )}
              </div>
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3 text-center">
                <div className="text-2xl mb-2">🪨</div>
                <div className="text-xs text-green-300">
                  {gameState.soilType ? SOIL_TYPES[gameState.soilType as keyof typeof SOIL_TYPES].name : "Unknown"}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Game Stats */}
          <div className="space-y-4">
            {/* Growth Progress */}
            <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-4">
              <div className="text-sm text-purple-200 mb-2">Growth Progress</div>
              <div className="w-full bg-purple-800/60 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${getGrowthProgress()}%` }}
                />
              </div>
              <div className="text-xs text-purple-300 mt-1">{getGrowthProgress()}%</div>
            </div>

            {/* Resource Bars */}
            <div className="space-y-3">
              {/* Water */}
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-200">Water</span>
                  <span className="text-sm text-blue-300">{Math.round(gameState.water)}%</span>
                </div>
                <div className="w-full bg-purple-800/60 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.water}%` }}
                  />
                </div>
              </div>

              {/* Light */}
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-200">Light</span>
                  <span className="text-sm text-yellow-300">{Math.round(gameState.light)}%</span>
                </div>
                <div className="w-full bg-purple-800/60 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.light}%` }}
                  />
                </div>
              </div>

              {/* Nutrients */}
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-200">Nutrients</span>
                  <span className="text-sm text-green-300">{Math.round(gameState.nutrients)}%</span>
                </div>
                <div className="w-full bg-purple-800/60 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.nutrients}%` }}
                  />
                </div>
              </div>

              {/* Stress */}
              <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-200">Stress</span>
                  <span className="text-sm text-red-300">{Math.round(gameState.stress)}%</span>
                </div>
                <div className="w-full bg-purple-800/60 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${gameState.stress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-4 space-y-3">
              {!gameState.isGrowing ? (
                <button
                  onClick={startGame}
                  className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  Start Growing
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={togglePause}
                    className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {gameState.isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={changeGameSpeed}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {gameState.gameSpeed}x Speed
                  </button>
                </div>
              )}

              <button
                onClick={onBack}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Back to Menu
              </button>
            </div>
          </div>

          {/* Right Panel - Stats and Events */}
          <div className="space-y-4">
            {/* Statistics */}
            <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-4">
              <h3
                className="text-lg font-bold text-yellow-300 mb-3"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Highest Potency</span>
                  <span className="text-white">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Total Yield</span>
                  <span className="text-white">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Average Potency</span>
                  <span className="text-white">--</span>
                </div>
              </div>
            </div>

            {/* Seed Bank */}
            <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-4">
              <h3
                className="text-lg font-bold text-yellow-300 mb-3"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Seed Bank
              </h3>
              <div className="text-yellow-300" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                Seeds: 2
              </div>
            </div>

            {/* Events Log */}
            <div className="bg-purple-900/60 rounded-lg border border-purple-500/50 p-4">
              <h3
                className="text-lg font-bold text-yellow-300 mb-3"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Events
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {eventLog.map((event, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${event.type === "warning"
                      ? "bg-yellow-900/60 text-yellow-200"
                      : event.type === "error"
                        ? "bg-red-900/60 text-red-200"
                        : "bg-blue-900/60 text-blue-200"
                      }`}
                  >
                    {event.message}
                  </div>
                ))}
                {eventLog.length === 0 && <div className="text-xs text-purple-400 italic">No events yet...</div>}
              </div>
            </div>

            {/* Final Results (if game complete) */}
            {gameState.finalPotency !== null && gameState.finalYield !== null && (
              <div className="bg-green-900/60 rounded-lg border border-green-500/50 p-4">
                <h3
                  className="text-lg font-bold text-green-300 mb-3"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  Harvest Results
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-200">Potency</span>
                    <span className="text-white">{gameState.finalPotency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-200">Yield</span>
                    <span className="text-white">{gameState.finalYield}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
