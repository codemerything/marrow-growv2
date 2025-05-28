
import { Volume2, VolumeX, Music, MicOffIcon as MusicOff } from "lucide-react"
import type { AudioSettings } from "../types/game-types"

interface AudioControlsProps {
  audioSettings: AudioSettings
  onAudioChange: (settings: AudioSettings) => void
}

export default function AudioControls({ audioSettings, onAudioChange }: AudioControlsProps) {
  const toggleSound = () => {
    onAudioChange({
      ...audioSettings,
      soundEnabled: !audioSettings.soundEnabled,
    })
  }

  const toggleMusic = () => {
    onAudioChange({
      ...audioSettings,
      musicEnabled: !audioSettings.musicEnabled,
    })
  }

  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={toggleSound}
        className={`p-3 rounded-full border-2 transition-all duration-200 backdrop-blur-sm ${audioSettings.soundEnabled
            ? "bg-purple-700/90 border-purple-500 text-yellow-300 hover:bg-purple-600/90"
            : "bg-purple-900/80 border-purple-700 text-purple-400 hover:bg-purple-800/80"
          }`}
        title={audioSettings.soundEnabled ? "Sound On" : "Sound Off"}
      >
        {audioSettings.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      <button
        onClick={toggleMusic}
        className={`p-3 rounded-full border-2 transition-all duration-200 backdrop-blur-sm ${audioSettings.musicEnabled
            ? "bg-purple-700/90 border-purple-500 text-yellow-300 hover:bg-purple-600/90"
            : "bg-purple-900/80 border-purple-700 text-purple-400 hover:bg-purple-800/80"
          }`}
        title={audioSettings.musicEnabled ? "Music On" : "Music Off"}
      >
        {audioSettings.musicEnabled ? <Music size={24} /> : <MusicOff size={24} />}
      </button>
    </div>
  )
}
