import React, { useState } from 'react'
import { Edit3, Trash2, Clock, User, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

const MessageList = ({ messages, onEdit, onDelete, loading }) => {
  const [editingMessage, setEditingMessage] = useState(null)
  const [editText, setEditText] = useState('')

  const handleEditClick = (message) => {
    setEditingMessage(message.ts)
    setEditText(message.text)
  }

  const handleEditSubmit = (ts) => {
    if (editText.trim() && editText !== messages.find(m => m.ts === ts)?.text) {
      onEdit(ts, editText.trim())
    }
    setEditingMessage(null)
    setEditText('')
  }

  const handleEditCancel = () => {
    setEditingMessage(null)
    setEditText('')
  }

  const formatTimestamp = (ts) => {
    try {
      const date = new Date(parseFloat(ts) * 1000)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-16 sm:h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-gray-500">No messages found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {messages.map((message, index) => {
        const colors = [
          'bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10 border-vibrant-purple/20',
          'bg-gradient-to-br from-vibrant-cyan/10 to-vibrant-blue/10 border-vibrant-cyan/20',
          'bg-gradient-to-br from-vibrant-emerald/10 to-vibrant-teal/10 border-vibrant-emerald/20',
          'bg-gradient-to-br from-vibrant-amber/10 to-vibrant-orange/10 border-vibrant-amber/20',
          'bg-gradient-to-br from-vibrant-rose/10 to-vibrant-red/10 border-vibrant-rose/20'
        ]
        const colorClass = colors[index % colors.length]
        
        return (
        <div key={message.ts} className={`${colorClass} rounded-xl p-3 sm:p-4 border shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="p-1 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-full">
                <User className="h-2 w-2 sm:h-3 sm:w-3 text-white flex-shrink-0" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {message.user || 'Unknown User'}
              </span>
              <span className="text-xs text-vibrant-purple flex-shrink-0">
                {formatTimestamp(message.ts)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {message.thread_ts && (
                <span className="text-xs bg-gradient-to-r from-vibrant-cyan to-vibrant-blue text-white px-1 sm:px-2 py-1 rounded-full">
                  <span className="hidden sm:inline">Thread Reply</span>
                  <span className="sm:hidden">Thread</span>
                </span>
              )}
              <button
                onClick={() => handleEditClick(message)}
                className="text-vibrant-blue hover:text-vibrant-purple transition-all duration-300 p-1 rounded-lg hover:bg-vibrant-blue/10"
                title="Edit message"
              >
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => onDelete(message.ts)}
                className="text-vibrant-rose hover:text-vibrant-red transition-all duration-300 p-1 rounded-lg hover:bg-vibrant-rose/10"
                title="Delete message"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {editingMessage === message.ts ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slack-purple focus:border-transparent"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditSubmit(message.ts)}
                  className="btn-primary text-sm py-1 px-3"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800">
              {message.text || (
                <span className="text-gray-500 italic">No text content</span>
              )}
            </div>
          )}

          {message.blocks && message.blocks.length > 0 && (
            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Rich Content:</div>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(message.blocks, null, 2)}
              </pre>
            </div>
          )}

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Attachments:</div>
              {message.attachments.map((attachment, index) => (
                <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                  {attachment.title && <div className="font-medium">{attachment.title}</div>}
                  {attachment.text && <div>{attachment.text}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            <span>ID: {message.ts}</span>
            {message.client_msg_id && (
              <span className="ml-4">Client ID: {message.client_msg_id}</span>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}

export default MessageList
