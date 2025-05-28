import { useState, useEffect } from "react"
import { Shuffle } from "lucide-react"
import type { GameSelections } from "../types/game-types"

interface FeedingStationProps {
  selections: GameSelections
  onFeedingChange: (stage: "sprout" | "vegetative" | "flowering", nutrient: string) => void
  onNext: () => void
  onBack: () => void
}

export default function FeedingStation({ selections, onFeedingChange, onNext, onBack }: FeedingStationProps) {
  // All available nutrients
  const allNutrients = [
    // Base nutrients (L, M, H)
    { id: "light", name: "L", description: "Light feeding", category: "base", icon: "💧" },
    { id: "medium", name: "M", description: "Medium feeding", category: "base", icon: "💧" },
    { id: "heavy", name: "H", description: "Heavy feeding", category: "base", icon: "💧" },

    // Specialized nutrients
    { id: "doom-dust", name: "Doom Dust", description: "Dark energy boost", category: "special", icon: "💀" },
    { id: "basic-mix", name: "Basic Mix", description: "Standard nutrients", category: "special", icon: "👻" },
    { id: "flora-boost", name: "Flora Boost", description: "Plant growth enhancer", category: "special", icon: "🌿" },
    { id: "blood-boost", name: "Blood Boost", description: "Crimson power", category: "special", icon: "🩸" },

    // Advanced nutrients
    { id: "growth-boost", name: "Growth Boost", description: "Accelerated growth", category: "advanced", icon: "🌱" },
    { id: "bloom-power", name: "Bloom Power", description: "Flowering enhancer", category: "advanced", icon: "🌸" },
    { id: "ultra-bloom", name: "Ultra Bloom", description: "Maximum bloom", category: "advanced", icon: "🌺" },
    { id: "elven-bud", name: "Elven Bud", description: "Mystical enhancement", category: "advanced", icon: "🧝" },
    { id: "shadow-feed", name: "Shadow Feed", description: "Dark nutrients", category: "advanced", icon: "🌑" },
    { id: "crystal-boost", name: "Crystal Boost", description: "Pure energy", category: "advanced", icon: "💎" },
  ]

  // State for shuffled nutrients (3 per stage)
  const [shuffledNutrients, setShuffledNutrients] = useState<{
    sprout: typeof allNutrients
    vegetative: typeof allNutrients
    flowering: typeof allNutrients
  }>({
    sprout: [],
    vegetative: [],
    flowering: [],
  })

  // Shuffle nutrients on component mount
  useEffect(() => {
    shuffleNutrients()
  }, [])

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const shuffleNutrients = () => {
    const availableNutrients = allNutrients.filter((n) => n.category !== "base")

    setShuffledNutrients({
      sprout: shuffleArray(availableNutrients).slice(0, 3),
      vegetative: shuffleArray(availableNutrients).slice(0, 3),
      flowering: shuffleArray(availableNutrients).slice(0, 3),
    })
  }

  const baseNutrients = allNutrients.filter((n) => n.category === "base")

  const canStartGrowing =
    selections.feedingSchedule.sprout && selections.feedingSchedule.vegetative && selections.feedingSchedule.flowering

  const renderNutrientGrid = (nutrients: typeof allNutrients, stage: "sprout" | "vegetative" | "flowering") => {
    const selectedNutrient = selections.feedingSchedule[stage]

    return (
      <div className="grid grid-cols-3 gap-3">
        {nutrients.map((nutrient) => (
          <button
            key={`${stage}-${nutrient.id}`}
            onClick={() => onFeedingChange(stage, nutrient.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 backdrop-blur-sm ${selectedNutrient === nutrient.id
                ? "bg-yellow-600/80 border-yellow-400 shadow-lg shadow-yellow-400/50"
                : "bg-purple-900/60 border-purple-600/50 hover:border-yellow-400"
              }`}
          >
            <div className="text-2xl mb-1">{nutrient.icon}</div>
            <div className="text-yellow-300 font-bold text-xs">{nutrient.name}</div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-yellow-300 mb-2">FEEDING STATION</h2>
        <div className="flex items-center justify-center gap-4">
          <button onClick={onBack} className="text-purple-300 hover:text-yellow-300 text-sm transition-colors">
            ← Back to Selection
          </button>
          <button
            onClick={shuffleNutrients}
            className="flex items-center gap-2 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 px-3 py-1 rounded border border-purple-500/50 transition-colors"
          >
            <Shuffle size={14} />
            <span className="text-xs">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Base Nutrients (L, M, H) */}
      <div className="text-center space-y-3">
        <div className="flex justify-center space-x-4">
          {baseNutrients.map((nutrient) => (
            <div
              key={nutrient.id}
              className="w-20 h-24 bg-blue-600 rounded-lg border-4 border-blue-400 flex items-center justify-center relative"
            >
              <span className="text-white font-bold text-xl">{nutrient.name}</span>
              {/* Golden highlight for medium (as shown in image) */}
              {nutrient.id === "medium" && (
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Growth Stages */}
      <div className="space-y-6">
        {/* Sprout Stage */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-yellow-300 text-center">SPROUT STAGE</h3>
          {renderNutrientGrid(shuffledNutrients.sprout, "sprout")}
        </div>

        {/* Vegetative Stage */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-blue-400 text-center">VEGETATIVE STAGE</h3>
          {renderNutrientGrid(shuffledNutrients.vegetative, "vegetative")}
        </div>

        {/* Flowering Stage */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-orange-400 text-center">FLOWERING STAGE</h3>
          {renderNutrientGrid(shuffledNutrients.flowering, "flowering")}
        </div>
      </div>

      {/* Start Growing Button */}
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!canStartGrowing}
          className={`px-12 py-4 font-bold text-xl rounded border-2 transition-all duration-200 backdrop-blur-sm ${canStartGrowing
              ? "bg-green-700 hover:bg-green-600 text-white border-green-500 shadow-lg transform hover:scale-105"
              : "bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed"
            }`}
        >
          START GROWING
        </button>
      </div>
    </div>
  )
}
