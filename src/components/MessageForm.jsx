import React, { useState } from 'react'
import { Send, Clock } from 'lucide-react'
import { format } from 'date-fns'

const MessageForm = ({ onSubmit, loading, scheduled = false }) => {
  const [text, setText] = useState('')
  const [postAt, setPostAt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const messageData = {
      text: text.trim(),
      options: {}
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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Message Text
        </label>
        <textarea
          id="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          rows={3}
          className="input-field resize-none text-sm"
          required
        />
      </div>

      {scheduled && (
        <div>
          <label htmlFor="postAt" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Schedule for
          </label>
          <input
            type="datetime-local"
            id="postAt"
            value={postAt}
            onChange={(e) => setPostAt(e.target.value)}
            min={getMinDateTime()}
            className="input-field text-sm"
            required
          />
        </div>
      )}


      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 sm:pt-4 border-t border-vibrant-purple/20 space-y-3 sm:space-y-0">
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={`w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            scheduled 
              ? 'bg-gradient-to-r from-vibrant-amber to-vibrant-orange hover:from-vibrant-orange hover:to-vibrant-amber text-white' 
              : 'bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-pink hover:to-vibrant-purple text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
              <span className="text-xs sm:text-sm">{scheduled ? 'Scheduling...' : 'Sending...'}</span>
            </div>
          ) : (
            <div className="flex items-center">
              {scheduled ? (
                <>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Schedule Message</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Send Message</span>
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
