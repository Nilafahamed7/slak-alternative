import React, { useState, useEffect } from 'react'
import { LogOut, MessageSquare, Send, Clock, Edit3, Trash2, Search } from 'lucide-react'
import { 
  getChannels, 
  getChannelHistory, 
  sendMessage, 
  scheduleMessage, 
  editMessage, 
  deleteMessage 
} from '../services/slackService'
import MessageList from './MessageList'
import MessageForm from './MessageForm'
import ChannelSelector from './ChannelSelector'

const Dashboard = ({ onLogout }) => {
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('send')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    loadChannels()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      loadMessages()
    }
  }, [selectedChannel])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const response = await getChannels()
      setChannels(response.channels || [])
      if (response.channels && response.channels.length > 0) {
        setSelectedChannel(response.channels[0].id)
      } else {
        // If no channels loaded, set a default channel ID for testing
        setSelectedChannel('general')
        setError('No channels found. Using default channel. You can manually enter a channel ID.')
      }
    } catch (err) {
      setError('Failed to load channels: ' + err.message + '. You can manually enter a channel ID.')
      // Set a default channel for testing
      setSelectedChannel('general')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedChannel) return
    
    try {
      setLoading(true)
      const response = await getChannelHistory(selectedChannel)
      setMessages(response.messages || [])
    } catch (err) {
      setError('Failed to load messages: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (messageData) => {
    try {
      setLoading(true)
      if (messageData.scheduled) {
        await scheduleMessage(
          selectedChannel,
          messageData.text,
          messageData.postAt,
          messageData.options
        )
      } else {
        await sendMessage(
          selectedChannel,
          messageData.text,
          messageData.options
        )
      }
      await loadMessages()
      setError('')
    } catch (err) {
      setError('Failed to send message: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditMessage = async (ts, newText) => {
    try {
      setLoading(true)
      await editMessage(selectedChannel, ts, newText)
      await loadMessages()
      setError('')
    } catch (err) {
      setError('Failed to edit message: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (ts) => {
    try {
      setLoading(true)
      await deleteMessage(selectedChannel, ts)
      await loadMessages()
      setError('')
    } catch (err) {
      setError('Failed to delete message: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      // Search through messages in the current channel
      const response = await getChannelHistory(selectedChannel, 100)
      const filteredMessages = response.messages.filter(msg => 
        msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filteredMessages)
    } catch (err) {
      setError('Search failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'send', label: 'Send Message', icon: Send },
    { id: 'schedule', label: 'Schedule Message', icon: Clock },
    { id: 'search', label: 'Search Messages', icon: Search },
    { id: 'manage', label: 'Manage Messages', icon: Edit3 }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-slack-purple mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                <span className="hidden sm:inline">Slack Alternative</span>
                <span className="sm:hidden">Slack</span>
              </h1>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Channels</h2>
              <ChannelSelector
                channels={channels}
                selectedChannel={selectedChannel}
                onChannelSelect={setSelectedChannel}
                loading={loading}
              />
              
              {/* Manual Channel Input */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <label htmlFor="manualChannel" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Or enter channel ID manually:
                </label>
                <input
                  type="text"
                  id="manualChannel"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  placeholder="e.g., general, C1234567890"
                  className="input-field text-xs sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use channel name (general) or channel ID (C1234567890)
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-slack-purple text-slack-purple'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {activeTab === 'send' && (
                  <MessageForm
                    onSubmit={handleSendMessage}
                    loading={loading}
                    scheduled={false}
                  />
                )}

                {activeTab === 'schedule' && (
                  <MessageForm
                    onSubmit={handleSendMessage}
                    loading={loading}
                    scheduled={true}
                  />
                )}

                {activeTab === 'search' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="flex-1 input-field"
                      />
                      <button
                        onClick={handleSearch}
                        className="btn-primary"
                        disabled={loading}
                      >
                        Search
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Search Results ({searchResults.length})
                        </h3>
                        <MessageList
                          messages={searchResults}
                          onEdit={handleEditMessage}
                          onDelete={handleDeleteMessage}
                          loading={loading}
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'manage' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Recent Messages
                    </h3>
                    <MessageList
                      messages={messages}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
