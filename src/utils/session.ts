import type { WalletSession } from "../types/game-types"

const SESSION_KEY = "marrow_grow_session"
const SESSION_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

export class SessionManager {
  static saveSession(address: string, signature: string): void {
    const session: WalletSession = {
      address,
      signature,
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  static getSession(): WalletSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) return null

      const session: WalletSession = JSON.parse(sessionData)

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error("Error reading session:", error)
      this.clearSession()
      return null
    }
  }

  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
  }

  static isSessionValid(): boolean {
    const session = this.getSession()
    return session !== null
  }

  static updateSessionActivity(): void {
    const session = this.getSession()
    if (session) {
      // Extend session by updating timestamp
      session.timestamp = Date.now()
      session.expiresAt = Date.now() + SESSION_DURATION
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  }

  static getRemainingTime(): number {
    const session = this.getSession()
    if (!session) return 0

    return Math.max(0, session.expiresAt - Date.now())
  }

  static formatRemainingTime(): string {
    const remaining = this.getRemainingTime()
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
}
