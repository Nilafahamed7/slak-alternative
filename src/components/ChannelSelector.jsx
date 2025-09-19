import React from 'react'
import { Hash, Lock } from 'lucide-react'

const ChannelSelector = ({ channels, selectedChannel, onChannelSelect, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onChannelSelect(channel.id)}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
            selectedChannel === channel.id
              ? 'bg-slack-purple text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {channel.is_private ? (
            <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          <span className="truncate">{channel.name}</span>
        </button>
      ))}
      
      {channels.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          No channels available
        </p>
      )}
    </div>
  )
}

export default ChannelSelector
