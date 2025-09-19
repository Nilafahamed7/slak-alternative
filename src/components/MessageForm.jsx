import React, { useState } from 'react'
import { Send, Clock, Paperclip, Smile } from 'lucide-react'
import { format } from 'date-fns'

const MessageForm = ({ onSubmit, loading, scheduled = false }) => {
  const [text, setText] = useState('')
  const [postAt, setPostAt] = useState('')
  const [threadTs, setThreadTs] = useState('')
  const [blocks, setBlocks] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const messageData = {
      text: text.trim(),
      options: {}
    }

    if (threadTs.trim()) {
      messageData.options.thread_ts = threadTs.trim()
    }

    if (blocks.trim()) {
      try {
        messageData.options.blocks = JSON.parse(blocks.trim())
      } catch (err) {
        alert('Invalid JSON in blocks field')
        return
      }
    }

    if (scheduled) {
      if (!postAt) {
        alert('Please select a date and time for scheduling')
        return
      }
      messageData.scheduled = true
      messageData.postAt = Math.floor(new Date(postAt).getTime() / 1000)
    }

    onSubmit(messageData)
    setText('')
    setPostAt('')
    setThreadTs('')
    setBlocks('')
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 1) // At least 1 minute in the future
    return now.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message Text
        </label>
        <textarea
          id="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="input-field resize-none"
          required
        />
      </div>

      {scheduled && (
        <div>
          <label htmlFor="postAt" className="block text-sm font-medium text-gray-700 mb-2">
            Schedule for
          </label>
          <input
            type="datetime-local"
            id="postAt"
            value={postAt}
            onChange={(e) => setPostAt(e.target.value)}
            min={getMinDateTime()}
            className="input-field"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="threadTs" className="block text-sm font-medium text-gray-700 mb-2">
            Thread Timestamp (optional)
          </label>
          <input
            type="text"
            id="threadTs"
            value={threadTs}
            onChange={(e) => setThreadTs(e.target.value)}
            placeholder="e.g., 1234567890.123456"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            Reply to a specific message thread
          </p>
        </div>

        <div>
          <label htmlFor="blocks" className="block text-sm font-medium text-gray-700 mb-2">
            Blocks JSON (optional)
          </label>
          <textarea
            id="blocks"
            value={blocks}
            onChange={(e) => setBlocks(e.target.value)}
            placeholder='[{"type": "section", "text": {"type": "mrkdwn", "text": "Hello!"}}]'
            rows={3}
            className="input-field text-sm font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Rich formatting using Slack blocks
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Paperclip className="h-4 w-4" />
          <Smile className="h-4 w-4" />
          <span>Rich formatting available</span>
        </div>
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {scheduled ? 'Scheduling...' : 'Sending...'}
            </div>
          ) : (
            <div className="flex items-center">
              {scheduled ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Message
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </div>
          )}
        </button>
      </div>
    </form>
  )
}

export default MessageForm
