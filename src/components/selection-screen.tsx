import type { GameSelections } from "../types/game-types"
import cryptCookiesImg from '../assets/seeds/testmillion.png';
import skeleSkittlezImg from '../assets/seeds/seedmillion2.png';
import boneBlossomImg from '../assets/seeds/seed.png';

interface SelectionScreenProps {
  selections: GameSelections
  onSelectionChange: (type: "seed" | "soil" | "defense", value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function SelectionScreen({ selections, onSelectionChange, onNext, onBack }: SelectionScreenProps) {
  const seedOptions = [
    {
      id: "crypt-cookies",
      name: "Crypt Cookies",
      description: "High potency strain",
      image: cryptCookiesImg,
    },
    {
      id: "skele-skittlez",
      name: "Skele Skittlez",
      description: "Balanced hybrid",
      image: skeleSkittlezImg
    },
    {
      id: "bone-blossom",
      name: "Bone Blossom",
      description: "Fast flowering",
      image: boneBlossomImg
    },
  ]

  const soilOptions = [
    { id: "bone-dust", name: "Bone Dust", description: "Rich in calcium", icon: "💀" },
    { id: "magic-moss", name: "Magic Moss", description: "Mystical properties", icon: "🔮" },
    { id: "basic-soil", name: "Eh.. Not sure", description: "Standard growing medium", icon: "🪨" },
  ]

  const defenseOptions = [
    { id: "grower", name: "Grower", description: "Defends against pests", icon: "🛡️" },
    { id: "hound", name: "Hound", description: "Defends against raiders", icon: "🐕" },
    { id: "vault", name: "Vault", description: "Protects your seeds", icon: "🔒" },
  ]

  const canProceed = selections.seed && selections.soil && selections.defense

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-purple-300 hover:text-yellow-300 text-sm flex items-center gap-2 transition-colors"
      >
        ← Back to Menu
      </button>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seed Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-yellow-300 text-center">Seed Selection</h3>
          <div className="space-y-2">
            {seedOptions.map((seed) => (
              <button
                key={seed.id}
                onClick={() => onSelectionChange("seed", seed.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 backdrop-blur-sm ${selections.seed === seed.id
                  ? "bg-green-600/80 border-green-400 shadow-lg shadow-green-400/50"
                  : "bg-purple-900/60 border-purple-600/50 hover:border-green-400"
                  }`}
              >
                <div className="mb-2">
                  <img
                    src={seed.image || "/placeholder.svg"}
                    alt={seed.name}
                    className="w-12 h-12 mx-auto object-contain"
                  />
                </div>
                <div className="text-green-300 font-bold text-sm">{seed.name}</div>
                <div className="text-purple-200 text-xs">{seed.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Soil Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-yellow-300 text-center">Soil Selection</h3>
          <div className="space-y-2">
            {soilOptions.map((soil) => (
              <button
                key={soil.id}
                onClick={() => onSelectionChange("soil", soil.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 backdrop-blur-sm ${selections.soil === soil.id
                  ? "bg-green-600/80 border-green-400 shadow-lg shadow-green-400/50"
                  : "bg-purple-900/60 border-purple-600/50 hover:border-green-400"
                  }`}
              >
                <div className="text-3xl mb-2">{soil.icon}</div>
                <div className="text-green-300 font-bold text-sm">{soil.name}</div>
                <div className="text-purple-200 text-xs">{soil.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Defense Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-yellow-300 text-center">Defense Selection</h3>
          <div className="space-y-2">
            {defenseOptions.map((defense) => (
              <button
                key={defense.id}
                onClick={() => onSelectionChange("defense", defense.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 backdrop-blur-sm ${selections.defense === defense.id
                  ? "bg-green-600/80 border-green-400 shadow-lg shadow-green-400/50"
                  : "bg-purple-900/60 border-purple-600/50 hover:border-green-400"
                  }`}
              >
                <div className="text-3xl mb-2">{defense.icon}</div>
                <div className="text-green-300 font-bold text-sm">{defense.name}</div>
                <div className="text-purple-200 text-xs">{defense.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="text-center space-y-2">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 font-bold text-lg rounded border-2 transition-all duration-200 backdrop-blur-sm ${canProceed
            ? "bg-purple-700/60 hover:bg-purple-600/60 text-yellow-300 border-purple-500/50 shadow-lg transform hover:scale-105"
            : "bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed"
            }`}
        >
          Continue to Feeding Station
        </button>
        <div className="text-yellow-300 text-sm">Seeds: 4</div>
      </div>
    </div>
  )
}
