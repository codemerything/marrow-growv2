"use client"

interface SeedBankTabProps {
  user: any
  lives: number
}

export default function SeedBankTab({ user, lives }: SeedBankTabProps) {
  // Mock seed collection with new images
  const seedCollection = [
    {
      id: "crypt-cookies",
      name: "Crypt Cookies",
      image: "../assets/seeds/testmillion.png",
      rarity: "Common",
    },
    {
      id: "skele-skittlez",
      name: "Skele Skittlez",
      image: "../assets/seeds/seedmillion2.png",
      rarity: "Rare",
    },
    {
      id: "bone-blossom",
      name: "Bone Blossom",
      image: "../assets/seeds/seed.png",
      rarity: "Epic",
    },
    {
      id: "ghost-og",
      name: "Ghost OG",
      image: "../assets/seeds/testmillion.png",
      rarity: "Legendary",
    },
    {
      id: "phantom-kush",
      name: "Phantom Kush",
      image: "../assets/seeds/seedmillion2.png",
      rarity: "Common",
    },
  ]

  if (!user.isWalletConnected) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-yellow-300">Seed Collection</h3>
        <p className="text-purple-200 text-sm">Connect your wallet to view your seed collection</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lives Counter */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-yellow-300 mb-2">Seed Bank</h3>
        <div className="bg-purple-900/60 rounded-lg border-2 border-purple-500/50 p-4 backdrop-blur-sm">
          <div className="text-green-300 text-lg font-bold">Lives Remaining: {lives}</div>
          <div className="text-purple-200 text-sm mt-1">You get 3 lives daily to plant seeds</div>
        </div>
      </div>

      {/* Seed Collection */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-yellow-300 text-center">Your Seeds</h4>
        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
          {seedCollection.map((seed) => (
            <div
              key={seed.id}
              className="bg-purple-900/60 p-3 rounded border border-purple-500/50 backdrop-blur-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8">
                  <img
                    src={seed.image || "/placeholder.svg"}
                    alt={seed.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-green-300 font-bold text-sm">{seed.name}</div>
                  <div className="text-purple-200 text-xs">{seed.rarity}</div>
                </div>
              </div>
              <div className="text-yellow-300 text-sm">Unlimited</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-purple-200 text-sm">
        <p>Each seed can be planted unlimited times</p>
        <p>Limited only by your daily lives</p>
      </div>
    </div>
  )
}
