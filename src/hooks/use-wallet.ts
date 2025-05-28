"use client"

import { useState, useEffect } from "react"

export function useWallet() {
  const [isWalletAvailable, setIsWalletAvailable] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true)

    // Check for wallet availability
    const checkWallet = () => {
      if (typeof window !== "undefined" && window.ethereum) {
        setIsWalletAvailable(true)
      } else {
        setIsWalletAvailable(false)
      }
    }

    checkWallet()

    // Listen for wallet installation
    const handleEthereum = () => {
      checkWallet()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      })

      // Also check periodically in case wallet is installed after page load
      const interval = setInterval(checkWallet, 1000)

      return () => {
        window.removeEventListener("ethereum#initialized", handleEthereum)
        clearInterval(interval)
      }
    }
  }, [])

  return { isWalletAvailable, isClient }
}
