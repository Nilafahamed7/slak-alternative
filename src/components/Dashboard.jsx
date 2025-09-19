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
      }
    } catch (err) {
      setError('Failed to load channels: ' + err.message)
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-slack-purple mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Slack Alternative</h1>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Channels</h2>
              <ChannelSelector
                channels={channels}
                selectedChannel={selectedChannel}
                onChannelSelect={setSelectedChannel}
                loading={loading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-slack-purple text-slack-purple'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
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
