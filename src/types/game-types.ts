export interface GameSelections {
  seed: string | null
  soil: string | null
  defense: string | null
  feedingSchedule: {
    sprout: string | null
    vegetative: string | null
    flowering: string | null
  }
}

export interface Player {
  username: string
  registrationTime: number
  totalGames: number
  averagePotency: number
  totalYield: number
  highestPotency: number
  isActive: boolean
}

export interface User {
  isWalletConnected: boolean
  walletAddress: string
  username: string
  isRegistered: boolean
  player?: Player
}

export interface AudioSettings {
  soundEnabled: boolean
  musicEnabled: boolean
}

export interface WalletSession {
  address: string
  signature: string
  timestamp: number
  expiresAt: number
}
