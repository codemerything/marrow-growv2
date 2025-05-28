import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { web3Service } from "../utils/web3"

interface UsernameRegistrationProps {
  onUsernameRegistered: (username: string) => void
}

export default function UsernameRegistration({ onUsernameRegistered }: UsernameRegistrationProps) {
  const [tempUsername, setTempUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const available = await web3Service.isUsernameAvailable(username)
      setIsAvailable(available)
    } catch (error) {
      console.error("Error checking username:", error)
      setError("Failed to check username availability")
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setTempUsername(value)
    setIsAvailable(null)
    setError(null)

    // Debounce username checking
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        checkUsernameAvailability(value.trim())
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const registerUsername = async () => {
    if (!tempUsername.trim() || !isAvailable) return

    setIsRegistering(true)
    setError(null)

    try {
      const tx = await web3Service.registerPlayer(tempUsername.trim())

      // Wait for transaction confirmation
      await tx.wait()

      onUsernameRegistered(tempUsername.trim())
    } catch (error: any) {
      console.error("Registration failed:", error)
      setError(error.message || "Failed to register username. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  const getUsernameStatus = () => {
    if (isChecking) {
      return (
        <div className="flex items-center gap-2 text-purple-300">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Checking availability...</span>
        </div>
      )
    }

    if (tempUsername.length > 0 && tempUsername.length < 3) {
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertCircle size={16} />
          <span className="text-xs">Username must be at least 3 characters</span>
        </div>
      )
    }

    if (tempUsername.length > 20) {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <span className="text-xs">Username must be 20 characters or less</span>
        </div>
      )
    }

    if (isAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle size={16} />
          <span className="text-xs">Username available!</span>
        </div>
      )
    }

    if (isAvailable === false) {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <span className="text-xs">Username already taken</span>
        </div>
      )
    }

    return null
  }

  const canRegister =
    tempUsername.trim().length >= 3 && tempUsername.trim().length <= 20 && isAvailable === true && !isRegistering

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-yellow-300 text-center mb-4">Welcome! Please register username</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Enter username..."
          value={tempUsername}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className="w-full px-4 py-2 bg-purple-900/80 border-2 border-purple-600 rounded text-green-300 placeholder-purple-400 focus:border-green-400 focus:outline-none font-mono backdrop-blur-sm"
          maxLength={20}
          disabled={isRegistering}
          onKeyPress={(e) => e.key === "Enter" && canRegister && registerUsername()}
        />

        {getUsernameStatus()}
      </div>

      {error && (
        <div className="bg-red-900/80 border border-red-500 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="text-red-400" size={16} />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={registerUsername}
        disabled={!canRegister}
        className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 disabled:opacity-50 text-yellow-300 font-bold py-3 px-6 rounded border-2 border-purple-500 shadow-lg transform transition-transform hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2"
      >
        {isRegistering ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Registering...
          </>
        ) : (
          "Begin Growing"
        )}
      </button>

      {isRegistering && (
        <p className="text-purple-300 text-xs text-center">
          Please confirm the transaction in your wallet and wait for confirmation...
        </p>
      )}
    </div>
  )
}
