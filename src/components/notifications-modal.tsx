
import { Bell, Gift, Trophy, Zap, X } from "lucide-react"

interface NotificationsModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onMarkAllRead: () => void
}

export default function NotificationsModal({ user, isOpen, onClose, onMarkAllRead }: NotificationsModalProps) {
  // Mock notifications - replace with actual data
  const notifications = [
    {
      id: 1,
      type: "reward",
      title: "Daily Spin Available!",
      message: "Your daily spin wheel is ready. Try your luck for extra lives!",
      timestamp: "2 hours ago",
      icon: <Zap className="text-yellow-400" size={16} />,
      unread: true,
    },
    {
      id: 2,
      type: "achievement",
      title: "First Harvest Complete!",
      message: "Congratulations! You've completed your first harvest and earned 15.2g of premium bud.",
      timestamp: "1 day ago",
      icon: <Trophy className="text-yellow-400" size={16} />,
      unread: false,
    },
    {
      id: 3,
      type: "reward",
      title: "New Seed Unlocked",
      message: "Ghost OG seed has been added to your collection for reaching level 5.",
      timestamp: "2 days ago",
      icon: <Gift className="text-green-400" size={16} />,
      unread: false,
    },
    {
      id: 4,
      type: "system",
      title: "Lives Refreshed",
      message: "Your daily lives have been restored to 3. Happy growing!",
      timestamp: "3 days ago",
      icon: <Bell className="text-blue-400" size={16} />,
      unread: false,
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-gradient-to-b from-purple-800/95 to-purple-900/95 rounded-lg border-4 border-purple-600/50 shadow-2xl backdrop-blur-md w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-purple-600/50">
          <div className="flex items-center gap-2">
            <Bell className="text-yellow-300" size={20} />
            <h3 className="text-xl font-bold text-yellow-300">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-700/60 border border-purple-500/50 text-purple-200 hover:text-red-300 hover:bg-purple-600/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notification List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-purple-900/60 p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 ${notification.unread
                  ? "border-yellow-500/50 bg-purple-800/60"
                  : "border-purple-600/50 hover:border-purple-500/50"
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{notification.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-green-300 font-bold text-sm">{notification.title}</h4>
                    {notification.unread && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                  </div>
                  <p className="text-purple-200 text-xs mb-2">{notification.message}</p>
                  <div className="text-purple-400 text-xs">{notification.timestamp}</div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="mx-auto text-purple-400 mb-4" size={48} />
              <p className="text-purple-200 text-sm">No notifications yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.some((n) => n.unread) && (
          <div className="p-4 border-t border-purple-600/50">
            <button
              onClick={onMarkAllRead}
              className="w-full bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 font-bold py-2 px-4 rounded border border-purple-500/50 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
