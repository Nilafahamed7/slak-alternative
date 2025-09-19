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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No messages found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.ts} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {message.user || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.ts)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {message.thread_ts && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Thread Reply
                </span>
              )}
              <button
                onClick={() => handleEditClick(message)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit message"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(message.ts)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete message"
              >
                <Trash2 className="h-4 w-4" />
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
      ))}
    </div>
  )
}

export default MessageList
