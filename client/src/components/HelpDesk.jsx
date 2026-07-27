import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axios'
import { MessageCircle, X, Send, AlertCircle, Inbox } from 'lucide-react'

export default function HelpDesk() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await axios.post('/messages/helpdesk', {
        content: userMessage
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setIsOpen(false)
        }, 2000)
      } else {
        throw new Error(response.data.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('HelpDesk error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewInbox = () => {
    navigate('/inbox')
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
          title="Help Desk"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Help Desk</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {success && (
              <div className="flex justify-start">
                <div className="bg-green-50 text-green-800 p-3 rounded-lg flex items-start gap-2 max-w-[80%]">
                  <div>
                    <p className="font-medium">Message Sent</p>
                    <p className="text-sm">Your message has been sent. An administrator will respond shortly.</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-start gap-2 max-w-[80%]">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center text-gray-600 text-sm">
              <p>Send a message to the administration team.</p>
              <p className="mt-2">Check your Inbox for replies.</p>
              <button
                onClick={handleViewInbox}
                className="mt-3 text-blue-600 hover:text-blue-800 underline"
              >
                <Inbox className="h-4 w-4 inline mr-1" />
                View Messages in Inbox
              </button>
            </div>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  Sending...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
