import { useState } from "react"
import { X } from "lucide-react"

interface SpinWheelProps {
    onSpin: (result: { symbols: string[]; wonLife: boolean }) => void
    onClose: () => void
    canSpin: boolean
}

export default function SpinWheel({ onSpin, onClose, canSpin }: SpinWheelProps) {
    const [currentSymbols, setCurrentSymbols] = useState(["🦴", "🌿", "💀"])
    const [isAnimating, setIsAnimating] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [lastResult, setLastResult] = useState<{ symbols: string[]; wonLife: boolean } | null>(null)

    const symbols = ["🦴", "🌿", "💀"]

    const spin = () => {
        if (!canSpin || isAnimating) return

        setIsAnimating(true)
        setShowResult(false)

        // Animate the spinning
        let animationCount = 0
        const maxAnimations = 20

        const animationInterval = setInterval(() => {
            setCurrentSymbols([
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
            ])

            animationCount++

            if (animationCount >= maxAnimations) {
                clearInterval(animationInterval)

                // Final result
                const finalSymbols = [
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                ]

                setCurrentSymbols(finalSymbols)

                // Check if won life - NO skulls allowed, only bone or leaf combinations
                const hasSkull = finalSymbols.includes("💀")
                const wonLife = !hasSkull && (finalSymbols.includes("🦴") || finalSymbols.includes("🌿"))

                const result = { symbols: finalSymbols, wonLife }
                setLastResult(result)

                setTimeout(() => {
                    setIsAnimating(false)
                    setShowResult(true)

                    // Auto close after showing result
                    setTimeout(() => {
                        onSpin(result)
                        setTimeout(() => {
                            onClose()
                        }, 2000)
                    }, 1000)
                }, 500)
            }
        }, 100)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-purple-800/95 to-purple-900/95 rounded-lg border-4 border-purple-600 shadow-2xl backdrop-blur-md p-6 max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-yellow-300">Daily Spin Wheel</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-purple-700/80 border border-purple-500 text-purple-200 hover:text-red-300 hover:bg-purple-600/80 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Spin Wheel Display */}
                <div className="text-center space-y-4">
                    <div className="bg-purple-900/80 rounded-lg border-2 border-purple-500 p-6 backdrop-blur-sm">
                        <div className="flex justify-center space-x-4 mb-4">
                            {currentSymbols.map((symbol, index) => (
                                <div
                                    key={index}
                                    className={`w-16 h-16 bg-purple-800 rounded-lg border-2 border-purple-400 flex items-center justify-center text-3xl transition-all duration-100 ${isAnimating ? "animate-pulse scale-110" : ""
                                        }`}
                                >
                                    {symbol}
                                </div>
                            ))}
                        </div>

                        {!showResult && !isAnimating && (
                            <div className="text-purple-200 text-sm mb-4">
                                <p>🦴🌿 or 🌿🦴 = Win a life!</p>
                                <p>Any 💀 = No life</p>
                                <p className="text-yellow-300 mt-2">One spin per day</p>
                            </div>
                        )}

                        {showResult && lastResult && (
                            <div
                                className={`p-4 rounded-lg border-2 mb-4 ${lastResult.wonLife
                                        ? "bg-green-900/80 border-green-500 text-green-300"
                                        : "bg-red-900/80 border-red-500 text-red-300"
                                    }`}
                            >
                                <div className="text-lg font-bold mb-2">
                                    {lastResult.wonLife ? "🎉 You Won a Life!" : "💀 No Luck This Time"}
                                </div>
                                <div className="text-sm">{lastResult.symbols.join(" ")}</div>
                            </div>
                        )}

                        {canSpin && !showResult && (
                            <button
                                onClick={spin}
                                disabled={isAnimating}
                                className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 text-yellow-300 font-bold py-3 px-6 rounded border-2 border-purple-500 shadow-lg transform transition-transform hover:scale-105 backdrop-blur-sm"
                            >
                                {isAnimating ? "Spinning..." : "SPIN NOW"}
                            </button>
                        )}

                        {!canSpin && !showResult && (
                            <div className="text-center">
                                <div className="text-red-300 font-bold mb-2">Daily Spin Used</div>
                                <div className="text-purple-200 text-sm">Come back tomorrow for another spin!</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
