"use client"

interface HarvestTabProps {
  user: any
}

export default function HarvestTab({ user }: HarvestTabProps) {
  // Mock harvest data - replace with actual data from smart contract/game state
  const harvestHistory = [
    {
      id: 1,
      strain: "Crypt Cookies",
      potency: 85,
      yield: 12.5,
      harvestDate: "2024-05-20",
      quality: "Premium",
      icon: "🌿",
    },
    {
      id: 2,
      strain: "Skele Skittlez",
      potency: 92,
      yield: 8.3,
      harvestDate: "2024-05-18",
      quality: "Elite",
      icon: "💀",
    },
    {
      id: 3,
      strain: "Bone Blossom",
      potency: 78,
      yield: 15.2,
      harvestDate: "2024-05-15",
      quality: "Good",
      icon: "🦴",
    },
  ]

  const totalYield = harvestHistory.reduce((sum, harvest) => sum + harvest.yield, 0)
  const averagePotency = harvestHistory.reduce((sum, harvest) => sum + harvest.potency, 0) / harvestHistory.length
  const bestHarvest = harvestHistory.reduce((best, current) => (current.potency > best.potency ? current : best))

  if (!user.isWalletConnected) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-yellow-300">Harvest Collection</h3>
        <p className="text-purple-200 text-sm">Connect your wallet to view your harvest history</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-yellow-300 text-center">Harvest Collection</h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-purple-900/80 p-3 rounded border border-purple-500 backdrop-blur-sm text-center">
          <div className="text-green-300 font-bold text-lg">{totalYield.toFixed(1)}g</div>
          <div className="text-purple-200 text-xs">Total Yield</div>
        </div>
        <div className="bg-purple-900/80 p-3 rounded border border-purple-500 backdrop-blur-sm text-center">
          <div className="text-yellow-300 font-bold text-lg">{averagePotency.toFixed(1)}%</div>
          <div className="text-purple-200 text-xs">Avg Potency</div>
        </div>
        <div className="bg-purple-900/80 p-3 rounded border border-purple-500 backdrop-blur-sm text-center">
          <div className="text-orange-300 font-bold text-lg">{harvestHistory.length}</div>
          <div className="text-purple-200 text-xs">Harvests</div>
        </div>
      </div>

      {/* Best Harvest */}
      {bestHarvest && (
        <div className="bg-gradient-to-r from-yellow-900/80 to-orange-900/80 p-3 rounded border-2 border-yellow-500 backdrop-blur-sm">
          <div className="text-yellow-300 font-bold text-sm mb-1">🏆 Best Harvest</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{bestHarvest.icon}</span>
              <div>
                <div className="text-yellow-200 font-bold text-sm">{bestHarvest.strain}</div>
                <div className="text-yellow-300 text-xs">{bestHarvest.potency}% THC</div>
              </div>
            </div>
            <div className="text-yellow-200 text-sm">{bestHarvest.yield}g</div>
          </div>
        </div>
      )}

      {/* Harvest History */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-lg font-bold text-yellow-300">Recent Harvests</h4>
        {harvestHistory.map((harvest) => (
          <div
            key={harvest.id}
            className="bg-purple-900/80 p-3 rounded border border-purple-500 backdrop-blur-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{harvest.icon}</span>
              <div>
                <div className="text-green-300 font-bold text-sm">{harvest.strain}</div>
                <div className="text-purple-200 text-xs">{harvest.harvestDate}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-300 text-sm">{harvest.potency}% THC</div>
              <div className="text-green-300 text-sm">{harvest.yield}g</div>
              <div className="text-purple-300 text-xs">{harvest.quality}</div>
            </div>
          </div>
        ))}
      </div>

      {harvestHistory.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-purple-200 text-sm">No harvests yet. Start growing to build your collection!</p>
        </div>
      )}
    </div>
  )
}
